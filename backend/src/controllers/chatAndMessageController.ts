import type { Request, Response } from "express";
import User from "../schema/userSchema.js";
import Chat, { type ChatType } from "../schema/chatSchema.js";
import imagekit from "../helpers/imagekit.js";
import Message from "../schema/messageSchema.js";
import type { deleteMessageBody } from "../types/types.js";
// import crypto from 'crypto'
// import cloudinary from "../helpers/coudinary.js";
import mongoose from "mongoose";
import sendPushNotification from "../helpers/pushNotification.js";
import { pubClient } from "../helpers/redis/redis.js";

function truncateText(text: string, maxLength: number = 15): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

async function deleteFromImagekit(fileIds: string[]) {
    const deletePromises = fileIds.map(fileId => {
        imagekit.deleteFile(fileId)
            .catch(error => { throw new Error(`Failed to delete file ${fileId} : ${error.message}`) })
    })

    await Promise.all(deletePromises)
}

async function sendMessage(req: Request, res: Response) {
    const userId = req.user?.id
    let { chatId, receiverId, text } = req.body
    const files = req.files as Express.Multer.File[]

    if (!userId) {
        return res.status(401)
            .json({ success: false, message: "Unauthorized request" })
    }

    if (!chatId && !receiverId) {
        return res.status(400)
            .json({ success: false, message: "Either chatId or receiver id is required" })
    }

    if (userId === receiverId) {
        return res.status(400)
            .json({ success: false, message: "Cannot send message to yourself" })
    }

    if (!text?.trim() && (!files || files.length === 0)) {
        return res.status(400)
            .json({ success: false, message: "Text or media is required" })
    }

    try {

        let chat;

        if (chatId) {
            chat = await Chat.findById(chatId)

            if (!chat) {
                return res.status(404)
                    .json({ success: false, message: "Chat not found" })
            }

            const isParticipant = chat.participants.find(
                (p) => p.equals(userId)
            );

            if (!isParticipant) {
                return res.status(403)
                    .json({ success: false, message: "Not authorized" })
            }

        } else {
            if (!receiverId) {
                return res.status(400)
                    .json({ success: false, message: "ReceiverId is required when chatId is not provided" })
            }

            const receiver = await User.findById(receiverId)

            if (!receiver) {
                return res.status(404)
                    .json({ success: false, message: "User not found" })
            }

            chat = await Chat.findOne({
                participants: { $all: [userId, receiverId] }
            })

            if (!chat) {
                chat = await Chat.create({
                    participants: [userId, receiverId],
                    lastMessage: null,
                    lastMessageTime: null
                })
            }

        }

        type mediaItem = {
            type: 'image' | 'video' | 'document',
            url: string,
            thumbnail: string,
            size: number,
            fileName: string,
            fileId: string
        }

        const mediaArray: mediaItem[] = [];

        if (files && files.length > 0) {
            const uploads = files.map(async (file) => {
                try {
                    const uploadResponse = await imagekit.upload({
                        file: file.buffer.toString('base64'),
                        fileName: `chat_${Date.now()}_${file.originalname}`,
                        folder: '/chat_media',
                        useUniqueFileName: true
                    })

                    const item: mediaItem = {
                        type: file.mimetype.startsWith("image")
                            ? "image"
                            : file.mimetype.startsWith("video")
                                ? "video"
                                : "document",
                        url: uploadResponse.url,
                        thumbnail: uploadResponse.thumbnailUrl || uploadResponse.url,
                        size: uploadResponse.size,
                        fileName: file.originalname,
                        fileId: uploadResponse.fileId
                    }

                    return item
                } catch (error: any) {
                    throw new Error('Failed to upload file', error)
                }
            })

            mediaArray.push(...(await Promise.all(uploads)))
        }

        const message = await Message.create({
            chatId: chat._id,
            sender: userId,
            text: text?.trim() || null,
            media: mediaArray,
            status: 'sent'
        })

        await Chat.findByIdAndUpdate(chat._id, {
            lastMessage: message._id,
            lastMessageTime: message.createdAt || new Date()
        })

        const responseMessage = await Message.findById(message._id).populate('sender', 'fullName avatar')

        try {

            const io = req.app.get('io')

            const otherParticipants = chat.participants.filter((p) => p.toString() !== userId.toString())

            for (const pId of otherParticipants) {
                let socketIds: string[] | null = null
                try {
                    socketIds = await pubClient.smembers(`user:${pId.toString()}`)
                } catch (error) {
                    console.error('Failed to get socket ids', error)
                }

                if (socketIds && socketIds.length) {
                    // io.to(receiverSocketId).emit('receiveMessage', {
                    //     message: responseMessage,
                    //     chatId: chat!._id,
                    //     type: chat!.type
                    // })
                    for (const socketId of socketIds) {
                        io.to(socketId).emit('receiveMessage', {
                            message: responseMessage,
                            chatId: chat!._id,

                        })
                    }
                } else {
                    try {
                        const receiver = await User.findById(pId)
                        const sender = await User.findById(userId)

                        if (receiver && receiver.expoPushToken && sender?.expoPushToken !== receiver.expoPushToken) {
                            const sender = responseMessage?.sender as any

                            await sendPushNotification(
                                receiver.expoPushToken,
                                sender.fullName,
                                responseMessage?.text || responseMessage?.media[0].url || `${responseMessage?.media.length} media`,
                                {
                                    chatId: chat!._id.toString(),
                                    senderId: sender._id.toString(),
                                    senderAvatar: sender.avatar || null,
                                    messageId: responseMessage?._id.toString() || null,
                                }
                            )
                        }
                    } catch (error) {
                        console.error('Failed to send push notification:', error)
                    }
                }
            }

        } catch (error) {
            console.error('Socket io receiveMessage emit failed', error)
        }
        const id = chatId || receiverId

        return res.status(200)
            .json({
                success: true, message: "Message sent",
                data: {
                    message: responseMessage,
                    chatId: chat._id,
                    id
                }
            })

    } catch (error) {
        console.error('Error in sending message', error)
        return res.status(500)
            .json({ success: false, message: "Server error" })
    }

}

async function getChats(req: Request, res: Response) {
    const userId = req.user?.id

    if (!userId) {
        return res.status(401).json({
            success: false, message: 'Unauthorized request'
        })
    }

    try {
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({
                success: false, message: 'User not found'
            })
        }

        const chats = await Chat.find({ participants: userId })
            .sort({ lastMessageTime: -1 })
            .populate('participants', 'fullName avatar email lastSeen')
            .populate({
                path: 'lastMessage',
                populate: { path: 'sender', select: 'fullName' }
            })

        if (chats.length === 0) {
            return res.status(200).json({
                success: true, message: 'No chat found'
            })
        }

        const formattedChats = chats.map(chat => {
            const chatObj = chat.toObject()

            const participants = chat.participants as any[]
            const otherParticipant = participants.find((p: any) => (
                p._id.toString() !== userId.toString()
            ))

            const lastMessage = (chatObj.lastMessage as any)?.text || ''

            return {
                _id: chatObj._id,
                chatName: otherParticipant?.fullName,
                chatAvatar: otherParticipant?.avatar,
                otherUser: otherParticipant,
                lastMessage: {
                    text: truncateText(lastMessage),
                    senderId: (chatObj.lastMessage as any)?.sender?._id,
                    time: chatObj.lastMessageTime,
                    status: (chatObj.lastMessage as any)?.status
                }
            }
        })

        return res.status(200).json({
            success: true, message: 'Chats found successfully',
            formattedChats
        })

    } catch (error) {
        console.error('Error on finding chats for the user', error)
        return res.status(500).json({
            success: false, message: 'Error on finding chats for the user'
        })
    }

}

async function getMessages(req: Request, res: Response) {
    const userId = req.user?.id
    const { receiverId, chatId } = req.query

    if (!userId) {
        return res.status(401).json({
            success: false, message: 'Not authorized'
        })
    }

    if (!receiverId && !chatId) {
        return res.status(400).json({
            success: false, message: 'ReceiverId or chatId is required'
        })
    }

    if (userId === receiverId) {
        return res.status(400).json({
            success: false, message: 'You are asking for messages with your self'
        })
    }

    try {
        let chat;

        if (!chatId) {
            chat = await Chat.findOne({
                participants: { $all: [userId, receiverId] },
            })

            if (!chat) {
                return res.status(200).json({
                    success: true, message: 'Chat does not exist', messages: []
                })
            }

        } else {


            chat = await Chat.findById(chatId)

            if (!chat) {
                return res.status(404).json({
                    success: false, message: 'Chat not found'
                })
            }

            const isParticipant = chat.participants.some((participant) =>
                String(participant._id) === String(userId)
            )

            if (!isParticipant) {
                return res.status(403).json({
                    success: false, message: 'Not authorized'
                })
            }
        }

        const messages = await Message.find({ chatId: chat._id })
            .populate('sender', 'avatar fullName')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true, message: 'Messages fatched successfully',
            messages
        })

    } catch (error) {
        console.error('Could not find messages', error)
        return res.status(500).json({
            success: false, message: 'Could not find messages'
        })
    }


}

async function deleteMessage(req: Request<{}, {}, deleteMessageBody>, res: Response) {
    const userId = req.user?.id
    const { messageId, mediaId, type, chatId } = req.body

    if (!userId) {
        return res.status(401).json({
            success: false, message: 'Unauthorized access'
        })
    }

    if (!messageId && !mediaId && !type && !chatId) {
        return res.status(400).json({
            success: false, message: 'Details are required'
        })
    }

    if (!chatId || !messageId || !type) {
        return res.status(400).json({
            success: false, message: 'Incomplete details'
        })
    }

    try {

        const chat = await Chat.findById(chatId)

        if (!chat) {
            return res.status(404).json({
                success: false, message: 'Invalid chatId'
            })
        }

        const message = await Message.findById(messageId)

        if (!message) {
            return res.status(404).json({
                success: false, message: 'Message not found'
            })
        }

        if (type === 'media') {
            const mediaList = message.media as any[]
            const media = mediaList.find((m) => m.fileId === mediaId)

            if (!media) {
                return res.status(404).json({
                    success: false, message: 'Invalid mediaId'
                })
            }

            try {
                await imagekit.deleteFile(mediaId)
            } catch (error) {
                console.error('Failed to delete media file', error)
                return res.status(500).json({
                    success: false, message: 'Failed to delete media file'
                })
            }

            message.media = mediaList.filter((m) => m.fileId !== mediaId) as any

            await message.save()
        }

        if (type === 'text') {
            (message as any).text = null
            await message.save()
        }

        if (message.media.length === 0 && message.text === null) {
            await message.deleteOne()
        }

        if (chat.lastMessage && chat.lastMessage.equals(message._id)) {

            const latestMessage = await Message.findOne({ chatId: chat._id }).sort({ createdAt: -1 })

            if (!latestMessage) {
                chat.lastMessage = null
                chat.lastMessageTime = null
                await chat.save()
            } else {
                chat.lastMessage = latestMessage._id
                chat.lastMessageTime = latestMessage.createdAt
                await chat.save()
            }
        }

        const io = req.app.get("io")

        const otherParticipants = chat.participants.filter((p) => p.toString() !== userId.toString())

        for (const pId of otherParticipants) {
            const socketIds = await pubClient.smembers(`user:${pId.toString()}`)

            for (const socketId of socketIds) {
                io.to(socketId).emit("messageDeleted", { contextMenu: req.body })
            }
        }

        return res.status(200).json({
            success: true, message: 'Message deleted successfully'
        })



    } catch (error) {
        console.error('error deleting message', error)
        return res.status(500).json({
            success: false, message: 'Error deleting message'
        })
    }


}

async function editMessage(req: Request, res: Response) {
    const { chatId, messageId, text } = req.body
    const userId = req.user?.id

    if (!userId) {
        return res.status(401).json({
            success: false, message: "Unauthorized access"
        })
    }

    if (!chatId || !messageId || !text || !text.trim()) {
        return res.status(400).json({
            success: false, message: "Details are required"
        })
    }

    try {

        const message = await Message.findById(messageId)

        if (!message) {
            return res.status(404).json({
                success: false, message: "Invalid messageId"
            })
        }

        const chat = await Chat.findById(chatId)

        if (!chat || chat._id.toString() !== message.chatId.toString()) {
            return res.status(404).json({
                success: false, message: "Invalid chatId"
            })
        }

        if (message.sender._id.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false, message: "Not authorized for this operation"
            })
        }

        message.text = text
        await message.save()

        const io = req.app.get("io")

        const otherParticipant = chat.participants.filter((p) => p.toString() !== userId.toString())

        for (const pId of otherParticipant) {
            const socketIds = await pubClient.smembers(`user:${pId.toString()}`)

            for (const socketId of socketIds) {
                io.to(socketId).emit("messageEdited", { messageId, text })
            }
        }

        return res.status(200).json({
            success: true, message: "Message edited successfully"
        })

    } catch (error) {
        console.error("Failed to edit the message from server", error)
        return res.status(500).json({
            success: false, message: "Failed to edit the message from server"
        })
    }
}

async function deleteMultipleChats(req: Request, res: Response) {

    const { chatIds } = req.body
    const userId = req.user?.id

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized access' })
    }

    if (!chatIds || chatIds.length === 0) {
        return res.status(400).json({ success: false, message: 'Chat ids are required for the operation' })
    }

    const chats = await Chat.find({
        _id: { $in: chatIds },
        participants: userId
    })

    if (!chats) {
        return res.status(404).json({ success: false, message: 'Chats not found' })
    }

    if (chats.length !== chatIds.length) {
        return res.status(403).json({ success: false, message: 'Some chats not found or user is not participant' })
    }

    const messagesWithMedia = await Message.find({
        chatId: { $in: chatIds },
        'media.0': { $exists: true }
    })

    const filesToDelete: string[] = []

    messagesWithMedia.forEach(message => {
        message.media?.forEach(mediaItem => {
            if (mediaItem.fileId) {
                filesToDelete.push(mediaItem.fileId)
            }
        })
    })

    try {
        if (filesToDelete.length > 0) {
            await deleteFromImagekit(filesToDelete)
        }
    } catch (error) {
        console.error('Imagekit deletion failed', error)
        return res.status(500).json({ success: false, message: 'Media deletion failed. Chats are not deleted.' })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        await Message.deleteMany({
            chatId: { $in: chatIds }
        }).session(session)

        await Chat.deleteMany({
            _id: { $in: chatIds }
        }).session(session)

        await session.commitTransaction()

        return res.status(200).json({ success: true, message: 'Chats deleted successfully', deletedChats: chats.length, deletedMediaFiles: filesToDelete.length })
    } catch (error) {
        await session.abortTransaction()
        console.log('Could not delete chats')
        return res.status(500).json({ success: false, message: 'Chats deletion failed' })
    } finally {
        session.endSession()
    }

}

// async function imagekitAuth(req: Request, res: Response) {
//     try {
//         const authParams = imagekit.getAuthenticationParameters()

//         return res.status(200).json({ success: true, message: 'Authenticated successfully', authParams })

//         // const userId = req.user?.id.toString()

//         // const timestamp = Math.floor(Date.now() / 1000)
//         // const folder = 'media/test'
//         // const tags = `user_${userId},avatar,temp`


//         // const toSign = {
//         //     timestamp, folder, tags
//         // }

//         // const signature = cloudinary.utils.api_sign_request(
//         //     toSign,
//         //     process.env.CLOUDINARY_API_SECRET!
//         // )

//         // return res.status(200).json({
//         //     success: true, message: 'Signature created successfuly',
//         //     authParams: {
//         //         ...toSign,
//         //         signature,
//         //         apiKey: process.env.CLOUDINARY_API_KEY,
//         //         cloudName: process.env.CLOUDINARY_NAME,
//         //     }
//         // })
//     } catch (error) {
//         console.error('Failed to authenticate imagekit:', error)
//         res.status(500).json({ success: false, message: 'Failed to authenticate' })
//     }
// }



// async function permanent(req: Request, res: Response) {
//     // const { publicId, resourceType } = req.body
//     const { fileId, filePath } = req.body
//     const userId = req.user?.id

//     try {
//         await imagekit.updateFileDetails(fileId, {
//             tags: [`user_${userId}`]
//         })

//         await imagekit.moveFile({
//             sourceFilePath: filePath,
//             destinationPath: '/media'
//         })

//         // await imagekit.getFileDetails()

//         // const asset = await cloudinary.api.resource(publicId, {
//         //     resource_type: resourceType
//         // });

//         // // 2️⃣ Security check – make sure user owns it
//         // if (!asset.tags.includes(`user_${userId}`)) {
//         //     return res.status(403).json({
//         //         success: false,
//         //         message: "You do not own this file"
//         //     });
//         // }


//         // await cloudinary.uploader.add_tag('permanent', publicId)
//         // await cloudinary.uploader.remove_tag('temp', publicId)

//         // await cloudinary.uploader.explicit(publicId, {
//         //     type: 'upload',
//         //     asset_folder: 'media/permanent'
//         // })


//         // save in db
//         // const media = await Media.create({
//         //       user: userId,
//         //   publicId,
//         //   url: secureUrl,
//         //   resourceType,
//         //   width,
//         //   height,
//         //   size
//         //   });

//         return res.status(200).json({
//             success: true, message: 'Expiry changed successfuly'
//         })

//     } catch (error) {
//         console.error('save media failed:', error)

//         // if (publicId) {
//         if (fileId) {
//             try {
//                 // await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
//                 await imagekit.deleteFile(fileId)
//             } catch (e) {
//                 console.error('Rollback failed:', e)
//             }
//         }
//         return res.status(500).json({
//             success: false, message: 'could not save media'
//         })

//     }
// }

async function markAsRead(req: Request, res: Response) {
    const { chatId } = req.body
    const userId = req.user?.id

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized access' })
    }

    if (!chatId) {
        return res.status(400).json({ success: false, message: 'Chat id is required' })
    }

    try {
        const chat = await Chat.findById(chatId).populate('lastMessage')

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' })
        }

        const lastMessage = await Message.findById(chat.lastMessage)

        if (!lastMessage) {
            return res.status(404).json({ success: false, message: 'LastMessage not found' })
        }

        lastMessage.status = 'read'
        await lastMessage.save()

        return res.status(200).json({ success: true, message: 'Last message has been updated' })

    } catch (error) {
        console.error('Could not update last message', error)
        return res.status(500).json({ success: false, message: 'Could not update last message' })
    }
}


export {
    sendMessage, getChats, getMessages, deleteMessage, editMessage,
    // imagekitAuth, permanent,
    deleteMultipleChats, markAsRead
}