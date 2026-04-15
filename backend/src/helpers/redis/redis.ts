import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const pubClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
})

const subClient = pubClient.duplicate()

pubClient.on('connect', () => {
    console.log('✅ Redis pubClient connected')
})
subClient.on('connect', () => {
    console.log('✅ Redis subClient connected')
})

pubClient.on('error', (error) => {
    console.log('❌ Redis pubClient error', error)
})
subClient.on('error', (error) => {
    console.log('❌ Redis subClient error', error)
})


export { pubClient, subClient };