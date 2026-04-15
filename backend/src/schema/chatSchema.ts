import mongoose from "mongoose";

export interface ChatType {
    type: String,
    participants: mongoose.Types.ObjectId[],
    groupName: string,
    groupAvatar: String,
    groupAvatarId: String,
    groupAdmin: mongoose.Types.ObjectId[],
    lastMessage: mongoose.Types.ObjectId | null,
    lastMessageTime: Date | null,
    isArchived: Boolean
}

const ChatSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["direct", "group"],
        required: true,
        index: 1
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: 1
    }],
    groupName: {
        type: String,
    },
    groupAvatar: {
        type: String,
        default: null
    },
    groupAvatarId: {
        type: String,
        default: null
    },
    groupAdmin: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null,
        index: -1
    },
    lastMessageTime: {
        type: Date,
        default: null
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })


const Chat = mongoose.model<ChatType>("Chat", ChatSchema)

export default Chat