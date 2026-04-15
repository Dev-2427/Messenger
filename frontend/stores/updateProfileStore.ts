import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";
import Toast from "react-native-toast-message";
import api from "../helpers/axiosInstance/axiosInstance";
import useAuthStore from "./authStore";
import AsyncStorage from '@react-native-async-storage/async-storage'
import z from "zod";
import { sendName } from "../helpers/schemaValidations/schemaValidation";


interface UpdateProfileStore {
    localUri: string | null;
    isUploading: boolean;
    isDeletingAvatar: boolean;
    success: boolean;
    showActiveStatus: boolean,
    hasHydrated: boolean,
    changingUsername: boolean,
    isUsernameEditable: boolean,
    setUsernameEditableTrue: () => void,
    setUsernameEditableFalse: () => void,
    setHasHydrated: (status: boolean) => void,
    toggleActiveStatus: () => Promise<void>,
    askMediaPermission: () => Promise<boolean>;
    askCameraPermission: () => Promise<boolean>;
    pickFromGallery: () => Promise<void>;
    captureFromCamera: () => Promise<void>;
    uploadAvatar: (uri: string) => Promise<void>;
    deleteAvatar: (uri: string, id: string) => Promise<void>;
    changeUsername: (data: z.infer<typeof sendName>) => Promise<void>
}

const useUpdateProfile = create(persist<UpdateProfileStore>((set, get) => ({

    localUri: null,
    isUploading: false,
    isDeletingAvatar: false,
    success: false,
    showActiveStatus: false,
    hasHydrated: false,
    isUsernameEditable: false,
    changingUsername: false,

    askMediaPermission: async () => {
        const { status: currentStatus } = await ImagePicker.getMediaLibraryPermissionsAsync()

        if (currentStatus === 'granted') {
            return true
        }

        const status = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!status.granted) {
            Alert.alert('Permission required', 'Please enable photo library permission to pick an image')
            return false
        }
        return true
    },

    askCameraPermission: async () => {
        const permission = await ImagePicker.getCameraPermissionsAsync()

        if (permission.status === 'granted') {
            return true
        }

        const result = await ImagePicker.requestCameraPermissionsAsync()

        if (result.status === 'granted') {
            return true
        }

        Alert.alert(
            "Camera Access Required",
            "Please enable camera access from settings.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Open Settings", onPress: Linking.openSettings }
            ]
        )

        return false
    },

    pickFromGallery: async () => {
        const ok = await get().askMediaPermission()

        if (!ok) {
            Toast.show({
                type: 'info',
                text1: 'Permission is not granted'
            })
            return
        }

        try {
            const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: false,
                selectionLimit: 1,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            })

            if (res.canceled || !res.assets || res.assets.length === 0) {
                return
            }

            const asset = res.assets ? res.assets[0] : res
            const uri = asset.uri

            if (asset && asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
                Toast.show({
                    type: 'error',
                    text1: 'File size should be less than 5MB'
                })
                return
            }

            set({ localUri: uri })

            await get().uploadAvatar(uri)

        } catch (error) {
            console.error('Picker error', error)
            Toast.show({
                type: 'error',
                text1: 'Could not open gallery.'
            })
        }
    },

    captureFromCamera: async () => {
        const ok = await get().askCameraPermission()

        if (!ok) {
            Toast.show({
                type: 'error',
                text1: 'Permission is not granted'
            })
            return
        }

        try {
            const res = await ImagePicker.launchCameraAsync({
                mediaTypes: ["images"],
                aspect: [1, 1],
                allowsEditing: true,
                quality: 0.8,

            })

            if (res.canceled || !res.assets || res.assets.length === 0) {
                return
            }

            const asset = res.assets ? res.assets[0] : res

            const uri = asset.uri

            set({ localUri: uri })

            await get().uploadAvatar(uri)
        } catch (error) {
            console.error('Could not capture image', error)
            Toast.show({
                type: "error",
                text1: 'Could not capture image'
            })
        }
    },

    uploadAvatar: async (uri: string) => {
        set({ isUploading: true, success: false })

        try {
            const allowTypes = ['jpg', 'jpeg', 'png']

            const ext = uri.split('.').pop()?.toLowerCase()
            const mimeType = ext === 'jpg' ? 'image/jpg' : `image/${ext}`

            if (!allowTypes.includes(ext || '')) {
                Toast.show({
                    type: 'error',
                    text1: 'Please select JPG, JPEG, or PNG only'
                })
                return
            }

            const formData = new FormData()

            formData.append('avatar', {
                uri,
                name: `avatar.${ext}`,
                type: mimeType
            } as any)
            console.log("formData", formData)

            const res = await api.post('/api/profile/update_avatar', formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })

            if (res.data.success) {
                useAuthStore.getState().setAvatar(res.data.url, res.data.avatarId)
                set({ success: true })
                Toast.show({
                    type: 'success',
                    text1: res.data.message
                })
            } else {
                Toast.show({
                    type: 'error',
                    text1: res.data.message
                })
            }
        } catch (error) {
            console.error('Upload error', error)
            Toast.show({
                type: 'error',
                text1: 'Upload failed'
            })
        } finally {
            set({ isUploading: false })
        }
    },

    deleteAvatar: async (uri, id) => {
        set({ isDeletingAvatar: true })

        if (!uri || !id) {
            Toast.show({
                type: 'error',
                text1: 'uri and id is required'
            })
            return
        }

        try {
            const res = await api.post('/api/profile/delete_avatar', { uri, id })

            if (res.data.success) {
                Toast.show({
                    type: 'success',
                    text1: res.data.message
                })

                useAuthStore.getState().emptyAvatar()
            } else {
                Toast.show({
                    type: 'error',
                    text1: res.data.message
                })
            }
        } catch (error) {
            console.error('Failed to send delete avatar request', error)
            Toast.show({
                type: 'error',
                text1: 'Something went wrong'
            })
        } finally {
            set({ isDeletingAvatar: false })
        }

    },

    setUsernameEditableFalse: () => {
        set({ isUsernameEditable: false })
    },

    setUsernameEditableTrue: () => {
        set({ isUsernameEditable: true })
    },

    changeUsername: async (data) => {
        set({ changingUsername: true })

        try {
            const res = await api.post('api/profile/change_username', data)

            if (res.data.success) {
                get().setUsernameEditableFalse()
                Toast.show({
                    type: 'success',
                    text1: res.data.message
                })
                useAuthStore.getState().updateUsername(res.data.userName)
            } else {
                Toast.show({
                    type: 'error',
                    text1: res.data.message
                })
            }
        } catch (error) {
            console.error('Something went wrong while chnging user name:', error)
            Toast.show({
                type: 'error',
                text1: 'Something went wrong, Please try again later.'
            })
        } finally {
            set({ changingUsername: false })
        }
    },

    toggleActiveStatus: async () => {
        set({ showActiveStatus: !get().showActiveStatus })
    },

    setHasHydrated: (status) => {
        set({ hasHydrated: status })
    }


}),
    {
        name: 'profile-storage',
        storage: createJSONStorage(() => AsyncStorage),

        partialize: (state: UpdateProfileStore) => ({
            showActiveStatus: state.showActiveStatus
        } as Pick<UpdateProfileStore, 'showActiveStatus'> as UpdateProfileStore),

        onRehydrateStorage: () => {

            return (state, error) => {
                if (error) {
                    console.log('An error occured during showActiveStatus hydration:', error)
                }
                state?.setHasHydrated(true)
            }
        },
    }
))

export default useUpdateProfile