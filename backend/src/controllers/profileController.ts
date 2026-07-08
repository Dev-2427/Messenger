import type { Request, Response } from "express";
import User from "../schema/userSchema.js";
import imagekit from "../helpers/imagekit.js";
import crypto from "crypto";

function makeAvatarFilename(userId: string, ext: string) {
    const ts = Date.now()
    const rand = crypto.randomBytes(3).toString('hex')

    return `avatars/${userId}_${ts}_${rand}_${ext}`
}

async function updateAvatar(req: Request, res: Response) {
    const userId = req.user?.id

    if (!userId) {
        return res.status(401).json({
            success: false, message: 'Unauthorized access'
        })
    }

    if (!req.file) {
        return res.status(400).json({
            success: false, message: 'File is required'
        })
    }

    const user = await User.findById(userId)

    if (!user) {
        return res.status(404).json({
            success: false, message: 'User not found'
        })
    }

    if (user.avatarId) {
        try {
            await imagekit.deleteFile(user.avatarId)
        } catch (error) {
            console.error('Failed to delete old avatar', error)
            return res.status(500).json({
                success: false, message: 'Failed to delete old avatar'
            })
        }
    }

    try {
        let ext = 'jpg'
        if (req.file.mimetype === 'image/png') ext = 'png'
        if (req.file.mimetype === 'image/jpeg') ext = 'jpeg'

        const base64File = req.file.buffer.toString('base64')
        const fileName = makeAvatarFilename(userId, ext)

        const uploadResponse = await imagekit.upload({
            file: base64File,
            fileName: fileName,
            folder: '/avatars',
            useUniqueFileName: false
        })

        user.avatar = uploadResponse.url
        user.avatarId = uploadResponse.fileId
        await user.save()

        return res.status(200).json({
            success: true, message: 'Avatar updated successfully', url: uploadResponse.url, avatarId: uploadResponse.fileId
        })
    } catch (error) {
        console.error('Failed to upload avatar', error)
        return res.status(500).json({
            success: false, message: 'Failed to upload avatar'
        })
    }
}

async function deleteAvatar(req: Request, res: Response) {
    const { uri, id } = req.body
    const userId = req.user?.id

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized access' })
    }

    if (!uri || !id) {
        return res.status(400).json({ success: false, message: 'uri and id is required for delete avatar' })
    }

    try {
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }


        try {
            await imagekit.deleteFile(id)
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error on avatar deletion' })
        }


        user.avatar = null
        user.avatarId = null

        await user.save()

        return res.status(200).json({ success: true, message: 'Avatar deleted successfully' })
    } catch (error) {
        console.error('Could not delete avatar', error)
        return res.status(500).json({ success: false, message: 'Could not delete avatar' })
    }

}

async function changeUsername(req: Request, res: Response) {
    const { name } = req.body
    const userId = req.user?.id

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized request' })
    }

    if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required' })
    }

    try {
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        user.fullName = name
        await user.save()

        return res.status(200).json({ success: true, message: 'Username changed successfully', userName: user.fullName })

    } catch (error) {
        console.error('Something went wrong while updating username:', error)
        return res.status(500).json({ success: false, message: 'Failed to update username' })
    }
}

export { updateAvatar, deleteAvatar, changeUsername }