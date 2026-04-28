import mongoose, { type InferSchemaType } from "mongoose";

const MessageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        default: null
    },
    seen: {
        type: Boolean,
        default: false
    },
    media: [{
        type: {
            type: String,
            enum: ['image', 'video', 'document'],
            default: 'image'
        },
        url: {
            type: String,
            require: true
        },
        thumbnail: String,
        size: Number,
        fileName: String,
        fileId: String
    }],
    status: {
        type: String,
        enum: ['sent', 'read'],
        default: 'sent'
    },
}, { timestamps: true })

type MessageType = InferSchemaType<typeof MessageSchema>

const Message = mongoose.model<MessageType>('Message', MessageSchema)

export default Message