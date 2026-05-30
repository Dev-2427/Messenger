import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import User from "../schema/userSchema.js";


export interface decodedToken extends JwtPayload {
    userId: string
}

export default async function authCheck(req: Request, res: Response, next: NextFunction) {

    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            success: false, message: 'Session expired', code: "NO_TOKEN"
        })
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as decodedToken

        const user = await User.findById(decodedToken?.userId)

        if (!user) {
            return res.status(401).json({
                success: false, message: 'Invalid access token', code: 'INVALID_TOKEN'
            })
        }

        req.user = {
            id: user._id.toString(),
            email: user.email
        }

        next()
    } catch (error) {
        console.error("Token verification failed", error)
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ success: false, message: "Session expired", code: "TOKEN_EXPIRED" })
        }
        return res.status(401).json({
            success: false, message: 'Session has been expired', code: 'INVALID_TOKEN'
        })
    }

}