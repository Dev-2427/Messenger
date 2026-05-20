import multer from "multer";

const storage = multer.memoryStorage()

const uploadChatMedia = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024
    },
    fileFilter: (_, file, cb) => {

        const allowed = ["image/jpeg", "image/png", "image/webp", "video/mp4"]

        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Unsupported file type"))
        }

        cb(null, true)
    }
})

export default uploadChatMedia