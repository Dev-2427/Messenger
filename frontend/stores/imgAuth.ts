import { create } from "zustand";
import api from "../helpers/axiosInstance/axiosInstance";
import Toast from "react-native-toast-message";
import axios from "axios";

interface fileData {
    fileUrl: string,
    mimeType: string,
    fileName: string,
}

interface authParamsData {
    expire: number,
    token: string,
    signature: string
    // folder: string,
    // cloudName: string
    // apiKey: string,
    // timestamp: number,
    // signature: string,
    // tags: string
}

interface UploadResult {
    // fileId: string;
    // url: string;
    // resourceType: string,
    // deleteToken?: string,
    // thumbnailUrl?: string;
    // fileType: string;
    // size?: number;
    // width?: number;
    // height?: number;
    fileId: string;
    url: string;
    thumbnailUrl?: string;
    fileType: string;
    filePath: string,
    size?: number;
    width?: number;
    height?: number;
}

let uploadController: AbortController | null = null;

interface AuthState {
    authParams: authParamsData | null,
    file: fileData | null,
    imagekitAuth: () => Promise<void>,
    gettingAuthCheck: boolean,
    uploadToImagekit: () => Promise<UploadResult | null>
    uploading: boolean,
    uploadProgress: number,
    setFiles: (fileUrl: string, mimeType: string, fileName: string,) => void,
    // buildFormData: (file: fileData, authParams: authParamsData) => FormData,
    buildFormData: (file: fileData,
        auth: authParamsData,
        publicKey: string) => FormData,
    saveToDatabase: (media: UploadResult) => Promise<void>,
    isSaving: boolean,
    handleSave: () => Promise<void>,
    cancelUpload: () => void
}



const imgAuth = create<AuthState>((set, get) => ({

    file: null,
    authParams: null,
    uploading: false,
    uploadProgress: 0,
    gettingAuthCheck: false,
    isSaving: false,

    cancelUpload: () => {
        if (uploadController) {
            uploadController.abort()
            uploadController = null
        }

        set({ uploading: false, uploadProgress: 0 })
    },

    setFiles: (fileUrl, mimeType, fileName) => {
        set({ file: { fileName, fileUrl, mimeType } })
    },

    buildFormData: (file, auth, publicKey,) => {
        // buildFormData: (file, authParams) => {

        const formData = new FormData()

        // formData.append('file', {
        //     uri: file.fileUrl,
        //     type: file.mimeType,
        //     name: file.fileName
        // } as any)
        // formData.append('folder', authParams.folder)
        // formData.append('tags', authParams.tags)
        // formData.append('timestamp', authParams.timestamp.toString())
        // formData.append('signature', authParams.signature)
        // formData.append('api_key', authParams.apiKey)

        formData.append('file', {
            uri: file.fileUrl,
            type: file.mimeType,
            name: file.fileName
        } as any)
        formData.append('folder', '/media/test')
        formData.append('tags', 'temp')  //for multiple tag = "temp,user_123"
        formData.append('fileName', file.fileName)
        formData.append('token', auth.token)
        formData.append('expire', auth.expire.toString())
        formData.append('signature', auth.signature)
        formData.append('publicKey', publicKey)

        return formData
    },

    imagekitAuth: async () => {
        set({ gettingAuthCheck: true })
        try {
            const res = await api.get('/api/chat/imagekit_auth')
            if (res.data.success) {
                set({ authParams: res.data.authParams })
                console.log("data", res.data.authParams)
            } else (
                Toast.show({ type: "error", text1: res.data.message })
            )
        } catch (error) {
            console.log('Could not get authorization')
            Toast.show({
                type: 'error',
                text1: 'errorrrrrrr'
            })
        } finally {
            set({ gettingAuthCheck: false })
        }
    },

    uploadToImagekit: async () => {
        if (get().uploading) return null;

        const file = get().file;
        if (!file) {
            Toast.show({ type: "error", text1: "No file selected" });
            return null;
        }

        const IMAGEKIT_UPLOAD_URL =
            process.env.EXPO_PUBLIC_IMAGEKIT_UPLOAD_URL!;
        const IMAGEKIT_PUBLIC_KEY =
            process.env.EXPO_PUBLIC_IMAGEKIT_PUBLIC_KEY!;

        set({ uploading: true, uploadProgress: 0 });

        uploadController = new AbortController()

        try {

            await get().imagekitAuth();
            let auth = get().authParams;

            if (!auth) {
                Toast.show({ type: "error", text1: "Not authorized" });
                return null;
            }

            const uploadOnce = async (authParams: authParamsData) => {
                const formData = get().buildFormData(
                    file,
                    authParams,
                    IMAGEKIT_PUBLIC_KEY
                    // file,
                    // authParams,

                );

                // return axios.post(`https://api.cloudinary.com/v1_1/${authParams.cloudName}/auto/upload`, formData, {
                return axios.post(IMAGEKIT_UPLOAD_URL, formData, {
                    signal: uploadController?.signal,
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (progressEvent) => {
                        if (!get().uploading) return;

                        const total = progressEvent.total;
                        if (!total) return;

                        const rawPercent = Math.round(
                            (progressEvent.loaded * 100) / total
                        );

                        // 👇 never allow 100 here
                        const percent = Math.min(99, Math.max(0, rawPercent));

                        set({ uploadProgress: percent });
                    }
                });
            };

            try {
                const res = await uploadOnce(auth);

                set({ file: null, uploadProgress: 100, authParams: null });
                console.log(res.data)
                return {
                    fileId: res.data.fileId,
                    url: res.data.url,
                    thumbnailUrl: res.data.thumbnailUrl,
                    fileType: res.data.fileType,
                    size: res.data.size,
                    width: res.data.width,
                    height: res.data.height,
                    filePath: res.data.filePath
                    // fileId: res.data.public_id,
                    // url: res.data.secure_url,
                    // fileType: res.data.resource_type,
                    // resourceType: res.data.resource_type,
                    // deleteToken: res.data.deleteToken,
                    // size: res.data.bytes,
                    // width: res.data.width,
                    // height: res.data.height
                }

            } catch (error: any) {
                const status = error.response?.status;

                if (status === 400 || status === 401 || status === 403) {
                    set({ uploadProgress: 0 });

                    await get().imagekitAuth();
                    auth = get().authParams;

                    if (!auth) {
                        Toast.show({ type: "error", text1: "Authentication failed" });
                        return null;
                    }

                    const retryRes = await uploadOnce(auth);


                    set({ file: null, uploadProgress: 100, authParams: null });

                    return {
                        fileId: retryRes.data.fileId,
                        url: retryRes.data.url,
                        thumbnailUrl: retryRes.data.thumbnailUrl,
                        fileType: retryRes.data.fileType,
                        size: retryRes.data.size,
                        width: retryRes.data.width,
                        height: retryRes.data.height,
                        filePath: retryRes.data.filePath
                        // fileId: retryRes.data.public_id,
                        // url: retryRes.data.secure_url,
                        // fileType: retryRes.data.resource_type,
                        // resourceType: retryRes.data.resource_type,
                        // deleteToken: retryRes.data.deleteToken,
                        // size: retryRes.data.bytes,
                        // width: retryRes.data.width,
                        // height: retryRes.data.height
                    }
                }

                throw error;
            }

        } catch (error: any) {
            if (error.name === "CanceledError" ||
                error.code === "ERR_CANCELED") {
                console.log("Upload canceled", error);
                return null
            }
            console.error("Upload failed:", error);
            set({ uploadProgress: 0 });

            Toast.show({
                type: "error",
                text1: "Upload failed",
            });

            return null

        } finally {
            uploadController = null
            set({ uploading: false });
        }
    },

    saveToDatabase: async (media) => {

        try {
            const res = await api.post('/api/chat/permanent',
                // { publicId: media.fileId, resourseType: media.resource_type }
                { fileId: media.fileId, filePath: media.filePath }
            )

            if (res.data.success) {
                Toast.show({
                    type: 'success',
                    text1: res.data.message
                })
            } else {
                throw Error('db save failed')
            }
        } catch (error) {
            console.error('Could not save media to database:', error)
            Toast.show({
                type: 'error',
                text1: 'Upload succeeded, but saving failed'
            })
            throw error
        }

    },

    handleSave: async () => {
        if (get().isSaving) return

        set({ isSaving: true })

        let resultData: UploadResult | null = null
        try {
            resultData = await get().uploadToImagekit()

            if (!resultData) return

            await get().saveToDatabase(resultData)

        } catch (error) {
            console.error("Something went wrong while saving media:", error)
            Toast.show({ type: 'error', text1: 'Something went wrong while saving media' })

            try {
                // if (resultData?.deleteToken) {
                // const authParams = get().authParams
                // await axios.post(`https://api.cloudinary.com/v1_1/${authParams.cloudName}/delete_by_token`, { token: resultData.deleteToken })
                // }
            } catch (error) {
                console.error('could not delete media rollback', error)
            }

        } finally {
            set({ isSaving: false, uploadProgress: 0 })
        }
    }

}));


// Imagekit upload result {"AITags": null, "description": null, "fileId": "695a6c5e5c7cd75eb8d70064", "filePath": "/IMAGE_1767533658890_jpeg_25nmsPIUT", "fileType": "image", "height": 736, "name": "IMAGE_1767533658890_jpeg_25nmsPIUT", "size": 78563, "thumbnailUrl": "https://ik.imagekit.io/devtanna/tr:n-ik_ml_thumbnail/IMAGE_1767533658890_jpeg_25nmsPIUT", "url": "https://ik.imagekit.io/devtanna/IMAGE_1767533658890_jpeg_25nmsPIUT", "versionInfo": {"id": "695a6c5e5c7cd75eb8d70064", "name": "Version 1"}, "width": 736}


export default imgAuth