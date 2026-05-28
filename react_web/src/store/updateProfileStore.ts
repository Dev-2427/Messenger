import type z from "zod";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { sendName } from "../schemas/schema";
import toast from "react-hot-toast";
import api from "../helpers/url";
import useAuthStore from "./authStore";
import type React from "react";

interface Avatar {
    uri: string,
    file: File
}

interface UpdateProfileStore {
    localFile: Avatar | null,
    isUploading: boolean,
    changingAvatar: boolean,
    isDeletingAvatar: boolean,
    showActiveStatus: boolean,
    hasHydrated: boolean,
    changingUsername: boolean,
    isUsernameEditable: boolean,
    setUsernameEditableTrue: () => void,
    setUsernameEditableFalse: () => void,
    setHasHydrated: (status: boolean) => void,
    toggleActiveStatus: () => Promise<void>,
    changeAvatar: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    pickAvatar: (event: React.ChangeEvent<HTMLInputElement>) => void,
    uploadAvatar: () => Promise<void>;
    deleteAvatar: (uri: string, id: string) => Promise<void>;
    changeUsername: (data: z.infer<typeof sendName>) => Promise<void>
}

const updateProfileStore = create(persist<UpdateProfileStore, [], [], Pick<UpdateProfileStore, "showActiveStatus">>((set, get) => ({
    localFile: null,
    isUploading: false,
    isDeletingAvatar: false,
    showActiveStatus: false,
    hasHydrated: false,
    isUsernameEditable: false,
    changingUsername: false,
    changingAvatar: false,

    changeAvatar: async (event) => {
        try {
            const selectedFile = event.target.files?.[0]

            if (!selectedFile) return

            set({ changingAvatar: true })

            const form = new FormData()

            form.append("avatar", selectedFile)

            const res = await api.post("/api/profile/update_avatar", form)

            if (res.data.success) {
                useAuthStore.getState().setAvatar(res.data.url, res.data.avatarId)
                toast.success(res.data.message)
            } else {
                toast.error(res.data.message
                )
            }
        } catch (error: any) {
            console.error("Failed to chnage avatar", error)
            toast.error(error.response?.data?.message || "Failed to change avatar")
        } finally {
            set({ changingAvatar: false })
        }
    },

    pickAvatar: (event) => {
        const selectedFile = event.target.files?.[0]

        if (!selectedFile) return

        const oldFile = get().localFile

        if (oldFile?.uri) {
            URL.revokeObjectURL(oldFile.uri)
        }

        const avatar: Avatar = {
            uri: URL.createObjectURL(selectedFile),
            file: selectedFile
        }

        set({ localFile: avatar })
    },

    uploadAvatar: async () => {
        const localFile = get().localFile
        if (!localFile) return

        set({ isUploading: true })
        try {
            const form = new FormData()

            form.append("avatar", localFile.file)

            const res = await api.post("/api/profile/update_avatar", form)

            if (res.data.success) {
                useAuthStore.getState().setAvatar(res.data.url, res.data.avatarId)
                if (localFile?.uri) {
                    URL.revokeObjectURL(localFile.uri)
                }
                set({ localFile: null })
                toast.success(res.data.message)
            } else {
                toast.error(res.data.message)
            }
        } catch (error: any) {
            console.error("Failed to set avatar:", error)
            toast.error(error.response?.data?.message || "Failed to set avatar")
        } finally {
            set({ isUploading: false })
        }
    },

    deleteAvatar: async (uri, id) => {
        set({ isDeletingAvatar: true })

        if (!uri || !id) {
            toast.error("Uri and id is required")
            return
        }

        try {
            const res = await api.post('/api/profile/delete_avatar', { uri, id })

            if (res.data.success) {
                toast.success(res.data.message)
                useAuthStore.getState().emptyAvatar()
            } else {
                toast.error(res.data.success)
            }
        } catch (error: any) {
            console.error("Failed to send delete avatar request:", error)
            toast.error("Something went wrong")
        } finally {
            set({ isDeletingAvatar: false })
        }
    },

    setUsernameEditableFalse: () => {
        set({ isUsernameEditable: false })
    },

    setUsernameEditableTrue: async () => {
        set({ isUsernameEditable: true })
    },

    changeUsername: async (data) => {
        set({ changingUsername: true })

        try {
            const res = await api.post('/api/profile/change_username', data)

            if (res.data.success) {
                get().setUsernameEditableFalse()
                toast.success(res.data.message)
                useAuthStore.getState().updateUsername(res.data.userName)
            } else {
                toast.error(res.data.message)
            }
        } catch (error: any) {
            console.error('Something went wrong while changing username:', error)
            toast.error('Failed to change username')
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
        name: "profile-storage",

        storage: createJSONStorage(() => localStorage),

        partialize: (state) => ({
            showActiveStatus:
                state.showActiveStatus,
        }),
        onRehydrateStorage: () => {
            return (state, error) => {
                if (error) {
                    console.error('An error occured during showActiveStatus hydration:', error)
                }

                state?.setHasHydrated(true)
            }
        }
    }
)
)

export default updateProfileStore