import { Router } from "express";
import { deleteUser, googleAuth, healthCheck, refreshTokens, resetPassword, sendEmail, signIn, signOut, signUp, updatePushToken, verifyCode } from "../controllers/userController.js";
import authCheck from "../middleware/authMiddleware.js";

const router = Router()

router.post("/google_auth", googleAuth)
router.post("/sign_up", signUp)
router.post("/verify_code", verifyCode)
router.post("/sign_in", signIn)
router.post('/refresh', refreshTokens)
router.post('/send_email', sendEmail)
router.post('/reset_password', resetPassword)
router.post("/sign_out", authCheck, signOut)
router.get("/health_check", authCheck, healthCheck)
router.post("/update_push_token", authCheck, updatePushToken)
router.delete("/delete_user", authCheck, deleteUser)

export default router