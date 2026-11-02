import { Router } from "express";
import {
    deleteMessage, deleteMultipleChats, editMessage, getChats, getMessages, markAsRead,
    sendMessage
} from "../controllers/chatAndMessageController.js";
import authCheck from "../middleware/authMiddleware.js";
import uploadChatMedia from "../middleware/uploadChatMedia.js";

const router = Router()

router.post('/send_message', authCheck, uploadChatMedia.array('files', 5), sendMessage)
router.get('/get_chats', authCheck, getChats)
router.get('/get_messages', authCheck, getMessages)
router.post('/delete_message', authCheck, deleteMessage)
router.post('/edit_message', authCheck, editMessage)
router.delete('/delete_chats', authCheck, deleteMultipleChats)
router.post('/mark_as_read', authCheck, markAsRead)

export default router