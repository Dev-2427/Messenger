import mongoose from "mongoose";

export interface ChatType {
    participants: mongoose.Types.ObjectId[],
    lastMessage: mongoose.Types.ObjectId | null,
    lastMessageTime: Date | null,
}

const ChatSchema = new mongoose.Schema({

    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: 1
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
}, { timestamps: true })


const Chat = mongoose.model<ChatType>("Chat", ChatSchema)

export default Chat