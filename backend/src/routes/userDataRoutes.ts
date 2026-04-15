import { Router } from "express";
import { getUsers } from "../controllers/userDataContoller.js";
import authCheck from "../middleware/authMiddleware.js";

const router = Router()

router.get('/get_users', authCheck, getUsers)

export default router