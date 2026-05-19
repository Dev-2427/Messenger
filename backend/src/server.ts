import express, { type Request, type Response } from 'express'
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import connectDB, { disconnectDB, getDBStatus } from './DB/db.js';
import cookieParser from "cookie-parser";
import authRouter from './routes/authRoutes.js'
import profileRouter from './routes/profileRoutes.js'
import userDataRouter from './routes/userDataRoutes.js'
import chatAndMessageRouter from './routes/chatAndMessageRoutes.js'
// import './helpers/cleanTempMedia.js'
import { createServer } from 'http';
import { Server } from 'socket.io';
import User from './schema/userSchema.js';
import { dbGuard } from './middleware/dbGuard.js';
import { pubClient, subClient } from './helpers/redis/redis.js';
import { createAdapter } from '@socket.io/redis-adapter';
import jwt from 'jsonwebtoken'
import type { decodedToken } from './middleware/authMiddleware.js';
import cookie from 'cookie'

const app = express()
const httpServer = createServer(app)     // io
const port = process.env.PORT || 3000

const io = new Server(httpServer, {
    cors: {
        origin: process.env.URL,
        credentials: true,
        methods: ['GET', "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'X-Auth-Token',
            // 'x-platform'
        ],
        exposedHeaders: [
            'X-Total-Count',
            'X-RateLimit-Limit',
            'X-RateLimit-Remaining'
        ],
        maxAge: 86400
    }
})

io.adapter(createAdapter(pubClient, subClient))
await pubClient.del('online_users')
console.log('✅ Cleared stale online users')

app.set('io', io)

await connectDB()

app.use(express.json({ limit: '5kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(cookieParser())
app.use(morgan('combined'))
app.use(helmet())
app.use(cors({
    origin: process.env.URL,
    credentials: true,
    methods: ['GET', "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Auth-Token',
        // 'x-platform'
    ],
    exposedHeaders: [
        'X-Total-Count',
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining'
    ],
    maxAge: 86400
}))

app.use("/api", dbGuard)
app.use("/api/auth", authRouter)
app.use("/api/profile", profileRouter)
app.use("/api/users", userDataRouter)
app.use("/api/chat", chatAndMessageRouter)

app.get('/health', (req: Request, res: Response) => {
    const dbup = getDBStatus()

    res.status(dbup ? 200 : 503)
        .json({
            success: dbup ? true : false,
            message: dbup ? 'connected' : 'disconnected',
            uptime: process.uptime(),
            timeStamp: Date.now()
        })
})


// export const userSocketMap: Record<string, string> = {}

io.use(async (socket, next) => {
    try {
         let token =
            socket.handshake.auth?.token

        // Web fallback
        if (!token) {

            const cookies =
                cookie.parse(
                    socket.handshake.headers.cookie || ""
                )

            token = cookies.accessToken
        }


        if (!token) {
            return next(new Error('Unauthorized'))
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as decodedToken

        const user = await User.findById(decoded?.userId)

        if (!user) {
            return next(new Error('Unauthorized'))
        }

        socket.data.user = {
            id: user._id.toString(),
            email: user.email
        }

        next()
    } catch (error) {
        console.error('Socket auth error', error)
        next(new Error('Unauthorized'))
    }
})

io.on('connection', async (socket) => {

    const userId = socket.data.user.id

    if (userId) {
        // userSocketMap[userId] = socket.id
        // io.emit('getOnlineUsers', Object.keys(userSocketMap))
        await pubClient.sadd(`user:${userId}`, socket.id)
        await pubClient.expire(`user:${userId}`, 60 * 60)


        await pubClient.sadd('online_users', userId)
        const onlineUsers = await pubClient.smembers('online_users')
        io.emit('getOnlineUsers', onlineUsers)
        console.log(`User ${userId} is online with socket ${socket.id}`)
    }


    socket.on('disconnect', async () => {
        console.log(`Socket ${socket.id} disconnect event fired for user ${userId}`)
        if (!userId) return

        if (userId) {
            // delete userSocketMap[userId]
            // io.emit('getOnlineUsers', Object.keys(userSocketMap))
            try {
                await pubClient.srem(`user:${userId}`, socket.id)
            } catch (error) {
                console.error('Redis cleanup failed:', error)
            }

            let remainingSockets: string[] = []

            try {
                remainingSockets = await pubClient.smembers(`user:${userId}`)
            } catch (error) {
                console.error('Failed to check remaining sockets:', error)
            }

            if (remainingSockets.length === 0) {
                try {
                    await pubClient.srem('online_users', userId)
                } catch (error) {
                    console.error('Failed to remove from online_users:', error)
                }
            }

            try {
                const onlineUsers = await pubClient.smembers('online_users')
                io.emit('getOnlineUsers', onlineUsers)
                console.log('online users', onlineUsers)
            } catch (error) {
                console.error('Failed to fetch online users:', error)
            }

            console.log(`User ${userId} disconnected`)

            try {
                await User.findByIdAndUpdate(userId, { lastSeen: new Date() })
            } catch (error) {
                console.error('Error updating last seen', error)
            }
        }
    })
})

const server = httpServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
// const server = app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`)
// })

async function shutdown() {
    console.log('Shutting down...')

    try {
        io.close()

        await disconnectDB()

        server.close(() => {
            process.exit(0)
        })
    } catch (error) {
        console.error('Shutdown failed:', error)
        process.exit(1)
    }
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
process.on('SIGQUIT', shutdown) // windows don't support completely

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception', error)
    process.exit(1)
})

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error)
    server.close(() => process.exit(1))
})
