import multer from "multer";

const storage = multer.memoryStorage()

const uploadChatMedia = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024
    },
    fileFilter: (_, file, cb) => {
        cb(null, true)
    }
})

export default uploadChatMedia