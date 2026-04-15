import { Router } from "express";
import { changeUsername, deleteAvatar, updateAvatar } from "../controllers/profileController.js";
import authCheck from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadAvatar.js";

const router = Router()

router.post('/update_avatar', authCheck, upload.single('avatar'), updateAvatar)
router.post('/delete_avatar', authCheck, deleteAvatar)
router.post('/change_username', authCheck, changeUsername)

export default router