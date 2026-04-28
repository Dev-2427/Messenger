// import cron from "node-cron";
// import cloudinary from "./coudinary.js";
// import imagekit from "./imagekit.js";

// cron.schedule("*/30 * * * *", async () => {
//     console.log("Running cleanup...")

//     try {

//         const files = await imagekit.listFiles({
//             tags: 'temp',
//             limit: 100
//         })

//         if (!files.length) {
//             console.log("✅ No temp files")
//             return
//         }

//         const now = Date.now()

//         for (const file of files) {
//             if (file.type !== 'file') continue

//             const createdAt = new Date(file.createdAt).getTime()

//             if (now - createdAt > 30 * 60 * 1000) {
//                 await imagekit.deleteFile(file.fileId)
//             }
//         }
//         console.log(`Deleted ${files.length}`)

//         // const thirtyMinutesAgo = new Date(
//         //     Date.now() - 30 * 60 * 1000
//         // ).toISOString()

//         // const result = await cloudinary.search
//         //     .expression(`tags=temp AND created_at < "${thirtyMinutesAgo}"`)
//         //     .execute()

//         // if (!result.resources.length) {
//         //     console.log('No files to delete')
//         //     return
//         // }

//         // const images = result.resources
//         //     .filter((r: any) => r.resource_type === 'image')
//         //     .map((r: any) => r.public_id)

//         // const videos = result.resources
//         //     .filter((r: any) => r.resource_type === 'video')
//         //     .map((r: any) => r.public_id)

//         // if (images.length) {
//         //     await cloudinary.api.delete_resources(images, {
//         //         resource_type: 'image'
//         //     })
//         // }

//         // if (videos.length) {
//         //     await cloudinary.api.delete_resources(videos, {
//         //         resource_type: 'video'
//         //     })
//         // }

//         // console.log(`Deleted ${images.length + videos.length} temp files`)
//     } catch (error) {
//         console.error('Cron failed:', error)
//     }
// })