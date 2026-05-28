import type { CookieOptions, Request, Response } from "express";
import type { SignInBody, SignUpBody, VerifyCodeBody, resetPasswordBody, sendEmailBody } from "../types/types.js";
import User from "../schema/userSchema.js";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "../helpers/email/sendVerificationEmail.js";
import { generateAccessToken, generateRefreshToken } from "../helpers/jwt/jwt.js";
import jwt from "jsonwebtoken";
import type { decodedToken } from "../middleware/authMiddleware.js";
import Chat from "../schema/chatSchema.js";
import imagekit from "../helpers/imagekit.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const options: CookieOptions = {
    httpOnly: true,
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production'
}

async function signUp(req: Request<{}, {}, SignUpBody>, res: Response) {
    const { fullName, email, password } = req.body

    if (!fullName || !email || !password) {
        return res.status(400)
            .json({ success: false, message: "All fields are required" })
    }

    try {
        const existingUser = await User.findOne({ email })
        const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString()
        let userId;
        console.log(newVerificationCode)
        if (existingUser) {
            if (existingUser?.isVerified) {
                return res.status(409)
                    .json({ success: false, message: "An account with this email already exists" })
            } else {
                const hashedPassword = await bcrypt.hash(password, 10)

                existingUser.password = hashedPassword
                existingUser.verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000)
                existingUser.verifyCode = newVerificationCode

                await existingUser.save()
                userId = existingUser._id.toString()
            }
        } else {

            const hashedPassword = await bcrypt.hash(password, 10)
            const newVerifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000)

            const newUser = new User({
                fullName,
                email,
                password: hashedPassword,
                isVerified: false,
                verifyCode: newVerificationCode,
                verifyCodeExpiry: newVerifyCodeExpiry
            })

            await newUser.save()
            userId = newUser._id.toString()

        }
        const sendEmail = await sendVerificationEmail(email, newVerificationCode, fullName)

        if (!sendEmail.success) {
            console.error("Email send failed but continuing signup:", sendEmail.message);
            //return res.status(500).json({ success: false, message: sendEmail.message })
        }

        return res.status(201).json({ success: true, message: "A verification code has been sent to your email, please verify", userId })
    } catch (error) {
        console.error("Failed to create user:", error)
        return res.status(500).json({ success: false, message: "Failed to create user" })
    }
}

async function googleAuth(req: Request, res: Response) {
    try {

        const { idToken } = req.body
        const platform = req.headers['x-platform']

        if (!idToken) {
            return res.status(400).json({
                success: false, message: 'Google token required'
            })
        }

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        })

        const payload = ticket.getPayload()

        console.log('ticket', ticket)

        if (!payload) {
            return res.status(401).json({
                success: false,
                message: "Invalid Google token"
            });
        }

        const { sub: googleId, email, picture, name } = payload

        let user = await User.findOne({
            $or: [
                { googleId },
                { email }
            ]
        })

        if (!user) {
            user = await User.create({
                fullName: name,
                email,
                googleId,
                isVerified: true,
                authProvider: 'google',
                avatar: picture
            })
        }

        if (!user.googleId) {
            user.googleId = googleId

            if (user.authProvider === 'local') {
                user.authProvider = 'hybrid'
            } else {
                user.authProvider = 'google'
            }
            await user.save()
        }

        const accessToken = generateAccessToken(user._id.toString())
        const refreshToken = generateRefreshToken(user._id.toString())

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        const userData = {
            id: user._id.toString(),
            name: user.fullName,
            email: user.email,
            avatar: user.avatar,
            avatarId: user.avatarId || null,
            expoToken: user.expoPushToken || null
        }

        if (platform === "mobile") {
            return res.status(200).json({
                success: true,
                message: "Google login successful",
                accessToken,
                refreshToken,
                userData
            });
        }

        return res
            .status(200)
            .cookie('accessToken', accessToken, {
                ...options,
                maxAge: 15 * 60 * 1000
            })
            .cookie('refreshToken', refreshToken, {
                ...options,
                maxAge: 30 * 24 * 60 * 60 * 1000
            })
            .json({ success: true, message: 'Google login successful', userData })

    } catch (error) {
        console.error('Google auth error:', error)

        return res.status(500).json({
            success: false, message: 'Google authentication failed'
        })
    }
}


async function verifyCode(req: Request<{}, {}, VerifyCodeBody>, res: Response) {

    try {
        const { code, userId, justSendEmail } = req.body
        const platform = req.headers['x-platform']

        if (!code || !userId || !justSendEmail) {
            return res.status(400).json({
                success: false, message: 'OTP and user ID are required'
            })
        }

        const user = await User.findById(userId)

        console.log('user log', user)

        if (!user) {
            return res.status(404).json({
                success: false, message: 'User not found'
            })
        }

        if (justSendEmail === 'false' && user.isVerified) {
            return res.status(409).json({
                success: false, message: 'User is already verified '
            })
        }

        if (!user.verifyCodeExpiry || user.verifyCodeExpiry < new Date()) {
            return res.status(410).json({
                success: false, message: 'Verification code has expired'
            })
        }

        if (user.verifyCode !== code || code.length !== 6) {
            return res.status(401).json({
                success: false, message: 'Invalid verification code'
            })
        }

        let accessToken;
        let refreshToken;

        if (justSendEmail === 'false') {
            accessToken = generateAccessToken(userId)
            refreshToken = generateRefreshToken(userId)

            user.isVerified = true
            user.verifyCode = null
            user.verifyCodeExpiry = null
            user.refreshToken = refreshToken

            await user.save()
        }

        const userData = {
            id: user._id.toString(),
            name: user.fullName,
            email: user.email,
            avatar: user.avatar || null,
            avatarId: user.avatarId || null
        }

        if (justSendEmail === 'true') {
            return res.status(200).json({
                success: true, message: 'Email verified successfully'
            })
        }

        if (platform === 'mobile') {
            return res.status(200).json({
                success: true,
                message: 'User verified successfully',
                accessToken,
                refreshToken,
                userData
            })
        } else {
            return res.status(200)
                .cookie("accessToken", accessToken, {
                    ...options,
                    maxAge: 15 * 60 * 1000
                })
                .cookie("refreshToken", refreshToken, {
                    ...options,
                    maxAge: 30 * 24 * 60 * 60 * 1000
                })
                .json({ success: true, message: 'User verified successfully', userData })
        }

    } catch (error) {
        console.error('Error verifying user', error)
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }

}


async function signIn(req: Request<{}, {}, SignInBody>, res: Response) {

    const { email, password } = req.body
    const platform = req.headers["x-platform"]

    if (!email || !password) {
        return res.status(400)
            .json({ success: false, message: 'All fields are required' })
    }

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(401)
                .json({ success: false, message: 'Invalid credentials' })
        }

        if (user.authProvider === 'google') {
            return res.status(403).json({
                success: false,
                message: "Use Google login"
            });
        }

        if (!user.isVerified) {
            return res.status(403)
                .json({ success: false, message: 'Account not verified. Please register again. ' })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCorrect) {
            return res.status(401)
                .json({ success: false, message: 'Invalid credentials' })
        }

        const accessToken = generateAccessToken(user.id)
        const refreshToken = generateRefreshToken(user.id)

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        const userData = {
            id: user._id.toString(),
            name: user.fullName,
            email: user.email,
            avatar: user.avatar || null,
            avatarId: user.avatarId || null
        }

        if (platform === 'mobile') {
            return res.status(200)
                .json({
                    success: true, message: 'Signed in successfully',
                    accessToken,
                    refreshToken,
                    userData
                })
        } else {
            return res.status(200)
                .cookie("accessToken", accessToken, {
                    ...options,
                    maxAge: 15 * 60 * 1000
                })
                .cookie("refreshToken", refreshToken, {
                    ...options,
                    maxAge: 30 * 24 * 60 * 60 * 1000
                })
                .json({ success: true, message: "Signed in successfully", userData })
        }

    } catch (error) {
        console.error("Failed to sign in:", error)
        return res.status(500)
            .json({
                success: false, message: 'Failed to sign in',

            })
    }

}


async function signOut(req: Request, res: Response) {

    const id = req.user?.id
    const platform = req.headers['x-platform']

    if (!id) {
        return res.status(401).json({ success: false, message: "Unauthorized request" })
    }

    try {

        const user = await User.findById(id)

        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized request" })
        }

        user.refreshToken = null
        if (platform === "mobile") {
            user.expoPushToken = null
        }
        await user.save()

        if (platform === 'mobile') {
            return res.status(200)
                .json({ success: true, message: "Signed out successfully" })
        } else {
            return res.status(200)
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .json({ success: true, message: "Signed out successfully" })
        }

    } catch (error) {
        console.error("Failed to signout:", error)
        return res.status(500).json({
            success: false, message: 'Failed to signout'
        })
    }
}


async function refreshTokens(req: Request, res: Response) {

    try {
        const platform = req.headers['x-platform']
        const refreshToken = req.cookies.refreshToken || req.headers.authorization?.split(" ")[1]

        if (!refreshToken) {
            return res.status(401)
                .json({ success: false, message: "Refresh token not found" })
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as decodedToken

        const user = await User.findById(decoded.userId)

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401)
                .json({ success: false, message: "Invalid refresh token" })
        }

        const accessToken = generateAccessToken(user._id.toString())
        const newRefreshToken = generateRefreshToken(user._id.toString())

        user.refreshToken = newRefreshToken
        await user.save({ validateBeforeSave: false })

        if (platform === 'mobile') {
            return res.status(200)
                .json({
                    success: true,
                    message: 'Access and refresh token updated successfully',
                    accessToken,
                    refreshToken: newRefreshToken
                })
        } else {
            return res.status(200)
                .cookie("accessToken", accessToken, {
                    ...options,
                    maxAge: 15 * 60 * 1000
                })
                .cookie("refreshToken", newRefreshToken, {
                    ...options,
                    maxAge: 30 * 24 * 60 * 60 * 1000
                })
                .json({
                    success: true,
                    message: 'Access and refresh token updated successfully',
                })
        }
    } catch (error) {
        console.error("Session expired:", error)
        return res.status(401)
            .json({
                success: false,
                message: 'session has been expired',

            })
    }

}


async function sendEmail(req: Request<{}, {}, sendEmailBody>, res: Response) {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({
                success: false, message: 'Email is required'
            })
        }

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                success: false, message: 'Invalid email'
            })
        }

        if (!user.isVerified) {
            return res.status(403).json({ success: false, message: "Account is not verified" })
        }

        if (user.authProvider === "google") {
            return res.status(403).json({ success: false, message: "This account uses Google login" })
        }

        const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString()

        user.verifyCode = newVerificationCode
        user.verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000)

        await user.save()

        const sendMail = await sendVerificationEmail(email, newVerificationCode, user.fullName)

        if (!sendMail.success) {
            console.error("Email send failed but continuing email verification:", sendMail.message);
            // return res.status(500).json({
            //     success: false, message: sendMail.message
            // })
        }

        return res.status(200).json({
            success: true, message: "Email verified successfully", userId: user._id.toString()
        })
    } catch (error) {
        console.error("Failed to send verification code", error)
        return res.status(500).json({
            success: false, message: "Failed to process the request"
        })
    }
}

async function resetPassword(req: Request<{}, {}, resetPasswordBody>, res: Response) {

    const { password, confirmPassword, userId } = req.body
    const platform = req.headers["x-platform"]

    if (!password || !confirmPassword) {
        console.log('password:', password, 'conf:', confirmPassword, 'user', userId)
        return res.status(400).json({
            success: false, message: 'Both fields are required'
        })
    }

    if (password !== confirmPassword) {
        return res.status(404).json({
            success: false, message: 'Passwords do not match'
        })
    }

    const user = await User.findById(userId)

    if (!user) {
        return res.status(404).json({
            success: false, message: 'User not found'
        })
    }

    if (!user.isVerified) {
        return res.status(404).json({
            success: false, message: 'Email is not verified'
        })
    }

    const newPassword = await bcrypt.hash(password, 10)

    user.password = newPassword
    await user.save()

    if (platform === 'mobile') {
        return res.status(200).json({
            success: true, message: 'Password reset successfully, Please sign in again'
        })
    } else {
        return res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                success: true, message: 'Password reset successfully, Please sign in again'
            })
    }
}

async function healthCheck(req: Request, res: Response) {
    try {
        const userId = req.user?.id

        if (!userId) {
            return res.status(401)
                .json({ success: false, message: 'Unauthorized access' })
        }

        const user = await User.findById(userId)

        if (!user) {
            return res.status(401)
                .json({ success: false, message: 'Invalid user id' })
        }

        const userData = {
            id: userId,
            name: user.fullName,
            avatar: user.avatar,
            email: user.email,
            avatarId: user.avatarId,
            expoToken: user.expoPushToken

        }

        return res.status(200)
            .json({
                success: true, message: "Api running good", userData
            })
    } catch (error) {
        console.error("Api error", error)
        return res.status(500)
            .json({
                success: true, message: "Api failed"
            })
    }
}

async function updatePushToken(req: Request, res: Response) {
    const { pushToken } = req.body
    const userId = req.user?.id
    console.log('pushToken', pushToken)
    if (!pushToken) {
        return res.status(404).json({ success: false, message: 'Push token not found' })
    }

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    try {
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        user.expoPushToken = pushToken
        await user.save()

        return res.status(200).json({ success: true, message: 'Expo push token updated successfully' })
    } catch (error) {
        console.error('Failed to save expo push token:', error)
        return res.status(500).json({ success: false, message: 'Failed to update push token' })
    }

}

async function deleteUser(req: Request, res: Response) {
    const userId = req.user?.id
    const platForm = req.headers['x-platform']

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized access' })
    }

    try {
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' })
        }

        const chat = await Chat.find({
            participants: userId
        })

        if (chat.length > 0) {
            return res.status(401).json({ success: false, message: 'Chat found with this user, Please delete chats.' })
        }

        if (user.avatar && user.avatarId) {
            try {
                await imagekit.deleteFile(user.avatarId)
            } catch (error) {
                console.error('Avatar deletion failed.', error)
                return res.status(500).json({ success: false, message: 'Something went wrong while deleting avatar' })
            }
        }

        await user.deleteOne()

        if (platForm === 'mobile') {
            return res.status(200).json({ success: true, message: 'User deleted successfully' })
        } else {
            return res.status(200)
                .clearCookie('accessToken', options)
                .clearCookie('refreshToken', options)
                .json({ success: true, message: 'User deleted successfully' })
        }

    } catch (error) {
        console.error('User deletion failed', error)
        return res.status(500).json({ success: false, message: 'Failed to delete user' })
    }

}


export { signUp, verifyCode, signIn, signOut, refreshTokens, sendEmail, resetPassword, healthCheck, updatePushToken, deleteUser, googleAuth }
