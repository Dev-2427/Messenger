import type { Request, Response } from "express";
import User from "../schema/userSchema.js"

async function getUsers(req: Request, res: Response) {
    const userId = req.user?.id

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized access' })
    }
    try {
        const users = await User.find({ isVerified: true, _id: { $ne: userId } }).select('fullName avatar email lastSeen')

        return res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.error('Could not get user', error)
        return res.status(500).json({
            success: false,
            message: 'Error on user fetching'
        });
    }
}

export { getUsers }