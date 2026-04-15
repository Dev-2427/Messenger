import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import User from "../schema/userSchema.js";


export interface decodedToken extends JwtPayload {
    userId: string
}

export default async function authCheck(req: Request, res: Response, next: NextFunction) {

    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(408).json({
            success: false, message: 'No token found'
        })
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as decodedToken

        const user = await User.findById(decodedToken?.userId)

        if (!user) {
            return res.status(408).json({
                success: false, message: 'Invalid accessToken'
            })
        }

        req.user = {
            id: user._id.toString(),
            email: user.email
        }

        next()
    } catch (error) {
        console.error("Token verification failed", error)
        return res.status(408).json({
            success: false, message: 'Session has been expired'
        })
    }

}