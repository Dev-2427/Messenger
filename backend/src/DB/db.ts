import mongoose from "mongoose"
import dotenv from "dotenv";

dotenv.config()


mongoose.connection.on('connected', () => {
    console.log('MongoDB event: connected')
})

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB event: disconnected')
})

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB event: reconnected')
})

mongoose.connection.on('error', (error) => {
    console.log('MongoDB event: error', error)
})

mongoose.connection.on('close', () => {
    console.log('MongoDB event: connection closed')
})

let retryCount = 0
const MAX_RETRIES = 5

export default async function connectDB() {
    const uri = process.env.MONGODB_URI

    if (!uri) {
        console.error('MongoDb URI missing')
        process.exit(1)
    }

    const state = mongoose.connection.readyState

    if (state === 1) {
        console.log('MongoDB already connected')
        return
    }

    if (state === 2) {
        console.log('MongoDB connection in progress...')
        return
    }

    try {
        mongoose.set('strictQuery', true)

        await mongoose.connect(uri, {
            maxPoolSize: 10,
            minPoolSize: 2,

            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,

            autoIndex: false,
            retryWrites: true,
            // writeConcern: {
            //     w: 'majority'
            // }
        })

        console.log(`MongoDB connected`)
    } catch (error) {
        retryCount++

        console.error(`MongoDB error (${retryCount}/${MAX_RETRIES}):`, error)

        if (retryCount >= MAX_RETRIES) {
            console.error('MongoDB failed. Shutting down.')
            process.exit(1)
        }
        setTimeout(connectDB, 5000);
    }
}

export async function disconnectDB() {
    await mongoose.connection.close()
    console.log('MongoDB disconnected')
}

export function getDBStatus() {
    return mongoose.connection.readyState === 1
}