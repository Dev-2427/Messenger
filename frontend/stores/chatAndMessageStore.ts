import { create } from "zustand";
import * as ImagePicker from 'expo-image-picker'
import Toast from "react-native-toast-message";
import useUpdateProfile from "./updateProfileStore";
import api from "../helpers/axiosInstance/axiosInstance";
import { Chats, Message } from "../types";
import { router } from "expo-router";
import { contextMenuType } from "../components/messages/messages";
import { sendLocalNotification } from "../helpers/notificationService";

export interface FileMeta {
    uri: string,
    name: string,
    type: string,
    size?: number,
    id: string,
    kind: "image" | 'video' | 'document'
}

export interface ChatAndMessagestore {

    files: FileMeta[],
    text: string,
    chatId: string | null,
    receiverId: string | null,
    chats: Chats[],
    messages: Message[],
    sendingMessage: boolean,
    gettingChats: boolean,
    gettingMessages: boolean,
    deletingMessage: boolean,
    chatIdsToDelete: string[] | null,
    clearMessageState: () => void,
    resetFileAndText: () => void,
    setMessage: (msg: string) => void,
    setReceiverId: (id: string | null) => void,
    setChatId: (id: string | null) => void,
    removeFile: (id: string) => void,
    pickMedia: () => Promise<void>,
    captureMedia: () => Promise<void>,
    sendMessage: () => Promise<void>,
    getRecentChats: () => Promise<void>,
    getMessages: () => Promise<void>,
    deleteMessage: (contextMenu: contextMenuType) => Promise<void>,
    editMessage: (text: string, messageId: string) => Promise<void>
    handleIncomingMessage: (data: { message: Message, chatId: string, type: string, id: string }) => void,
    putChatIdToDeleteArray: (id: string) => void,
    removeChatIdToDeleteArray: (id: string) => void,
    clearChatIdToDeleteArray: () => void,
    handleDeleteChats: () => Promise<void>
    markMessageAsRead: (chatId: string) => void
    markChatAsRead: (chatId: string) => Promise<void>,
    addFileToArray: (file: FileMeta) => void,
}

const useChatAndMessageStore = create<ChatAndMessagestore>((set, get) => ({

    files: [],
    text: '',
    messages: [],
    chats: [],
    chatId: null,
    receiverId: null,
    sendingMessage: false,
    gettingChats: false,
    gettingMessages: false,
    deletingMessage: false,
    chatIdsToDelete: null,

    addFileToArray: (file) => {
        set((state) => ({
            files: [...state.files, file]
        }))
    },

    clearMessageState: () => {
        set({ messages: [] })
    },

    resetFileAndText: () => {
        set({ files: [], text: '' })
    },

    setMessage: (msg) => {
        set({ text: msg })
    },

    setReceiverId: (id: string | null) => {
        set({ receiverId: id })
    },

    setChatId: (id: string | null) => {
        set({ chatId: id })
    },

    pickMedia: async () => {
        const ok = await useUpdateProfile.getState().askMediaPermission()

        if (!ok) {
            Toast.show({
                type: 'info',
                text1: 'Permission is required'
            })
            return
        }

        try {
            const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images", 'videos'],
                allowsMultipleSelection: true,
                selectionLimit: 5,
                quality: 0.8
            })

            if (res.canceled) return

            const picked: FileMeta[] = res.assets.map((asset) => ({
                uri: asset.uri,
                name: asset.fileName || asset.uri.split('/').pop() || `${Date.now()}`,
                type: asset.type && asset.uri
                    ? `${asset.type}/${asset.uri.split(".").pop() || ""}`
                    : asset.mimeType || "application/octet-stream",
                size: asset.fileSize,
                id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                kind: asset.type === 'image' ? 'image' : asset.type === 'video' ? 'video' : 'image'
            }))

            set((state) => ({
                files: [...state.files, ...picked]
            }))

        } catch (error) {
            console.error('Document picker failed', error)
        }
    },

    captureMedia: async () => {

        const ok = await useUpdateProfile.getState().askCameraPermission()


        if (!ok) {
            return
        }

        try {
            const res = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                mediaTypes: ["images"],
                quality: 0.8,
            })

            if (res.canceled) return


            const picked: FileMeta[] = res.assets.map((asset) => ({
                uri: asset.uri,
                name: asset.fileName || asset.uri.split('/').pop() || `${Date.now()}`,
                type: asset.type && asset.uri
                    ? `${asset.type}/${asset.uri.split(".").pop() || ""}`
                    : asset.mimeType || "application/octet-stream",
                size: asset.fileSize,
                id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                kind: asset.type === 'image' ? 'image' : asset.type === 'video' ? 'video' : 'image'
            }))

            set((state) => ({
                files: [...state.files, ...picked]
            }))

        } catch (error) {
            console.error('Camera error:', error)
            Toast.show({
                type: 'error',
                text1: 'Could not open camera'
            })
        }
    },

    removeFile: (id) => {
        set((state) => ({
            files: state.files.filter((file) => file.id !== id)
        }))
    },

    sendMessage: async () => {

        const text = get().text
        const receiverId = get().receiverId
        const chatId = get().chatId
        const files = get().files

        if (!text.trim() && files.length === 0) return

        set({ sendingMessage: true })

        const form = new FormData()

        if (text.trim()) {
            form.append('text', text)
        }

        if (receiverId) {
            form.append('receiverId', receiverId)
        }

        if (chatId) {
            form.append('chatId', chatId)
        }

        files.forEach((file) => {
            form.append('files', {
                uri: file.uri,
                name: file.name,
                type: file.type || "application/octet-stream",
            } as any)
        })

        try {
            const res = await api.post('/api/chat/send_message', form, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })

            if (res.data.success) {
                Toast.show({
                    type: 'success',
                    text1: res.data.message
                })
                set((state) => ({
                    messages: [res.data.data.message, ...state.messages],
                    // chatId: res.data.chatId,
                    // receiverId: null
                }))
                // router.setParams({ id: res.data.data.chatId, type: res.data.data.type })
                set({ files: [] })
                set({ text: '' })
            } else {
                Toast.show({
                    type: 'error',
                    text1: res.data.message
                })
            }
        } catch (error) {
            console.error("Could not send message", error)
            Toast.show({
                type: "error",
                text1: 'Something went wrong'
            })
        } finally {
            set({ sendingMessage: false })
        }
    },

    getRecentChats: async () => {
        set({ gettingChats: true })

        try {
            const res = await api.get('/api/chat/get_chats')

            if (res.data.success && res.data.message === 'Chats found successfully') {
                set({ chats: res.data.formattedChats })
            } else {
                Toast.show({
                    type: 'error',
                    text1: res.data.message,
                })
            }
        } catch (error) {
            console.error('Failed to get chats', error)
            Toast.show({
                type: 'error',
                text1: 'Something went wrong'
            })
        } finally {
            set({ gettingChats: false })
        }
    },

    getMessages: async () => {

        const { chatId, receiverId, gettingMessages } = get()

        if (!chatId && !receiverId || gettingMessages) return

        set({ gettingMessages: true })

        try {

            const res = await api.get('/api/chat/get_messages', {
                params: chatId ? { chatId } : { receiverId }
            })

            if (res.data.success) {
                if (res.data.message === 'Chat does not exist') {
                    return Toast.show({
                        type: 'success',
                        text1: 'Chat does not exist'
                    })
                }
                set({ messages: res.data.messages })
            } else {
                Toast.show({
                    type: 'error',
                    text1: res.data.message
                })
                set({ messages: [] })
                router.replace('/home')
            }
        } catch (error) {
            console.error('Error getting messages', error)
            Toast.show({
                type: "error",
                text1: 'Something went wrong'
            })
        } finally {
            set({ gettingMessages: false })
        }
    },

    deleteMessage: async (contextMenu) => {
        set({ deletingMessage: true })

        try {
            const res = await api.post('/api/chat/delete_message', contextMenu)

            if (res.data.success) {
                const isText = contextMenu.type === "text"
                const isMedia = contextMenu.type === "media"

                if (isText) {
                    set((state) => ({
                        messages: state.messages.map((m) => m._id === contextMenu.messageId ? { ...m, text: null } : m)
                    }))
                }

                if (isMedia) {
                    set((state) => ({
                        messages: state.messages.map((m) => m._id === contextMenu.messageId ? { ...m, media: m.media.filter((file) => file.fileId !== contextMenu.mediaId) } : m)
                    }))
                }
            }
            else {
                !res.data.success
                Toast.show({
                    type: 'error',
                    text1: res.data.message
                })
            }
        } catch (error) {
            console.error('Could not send request, Try again.')
        } finally {
            set({ deletingMessage: false })
        }
    },

    editMessage: async (text, messageId) => {
        const chatId = get().chatId

        if (!chatId) {
            Toast.show({
                type: 'error',
                text1: 'Invalid chat'
            })
            return
        }

        if (!messageId) {
            Toast.show({
                type: 'error',
                text1: 'Invalid message'
            })
            return
        }

        if (!text || !text.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Message is empty'
            })
            return
        }
        set({ sendingMessage: true })

        try {
            const res = await api.post('/api/chat/edit_message', { chatId, text, messageId })

            if (res.data.success) {
                Toast.show({
                    type: "success",
                    text1: res.data.message
                })
            }
            if (!res.data.success) {
                Toast.show({
                    type: "error",
                    text1: res.data.message
                })
            }
        } catch (error) {
            console.error("Failed to edit the message", error)
            Toast.show({
                type: 'success',
                text1: 'Failed to edit the message'
            })
        } finally {
            set({ sendingMessage: false })
        }
    },

    handleIncomingMessage: (data) => {
        const { chatId, message, type, id } = data

        const currentChatId = get().chatId
        const currentReceiverID = get().receiverId

        const chat = get().chats.find((chat) => chat._id === chatId)
        if (id === currentReceiverID || id === currentChatId || chatId === currentChatId || currentReceiverID === chat?.otherUser?._id) {
            set((state) => ({
                messages: [message, ...state.messages]
            }))
            get().getRecentChats()
        } else {
            sendLocalNotification(
                message.sender.fullName,
                message.text || `${message.media.length} media`,
                {
                    chatId,
                    type,
                    receiverId: id
                }
            )
        }

    },

    putChatIdToDeleteArray: (id) => {
        set((state) => ({
            chatIdsToDelete: [...(state.chatIdsToDelete ?? []), id]
        }))
    },

    removeChatIdToDeleteArray: (id) => {
        set((state) => ({
            chatIdsToDelete: state.chatIdsToDelete?.filter((value) => value !== id)
        }))
    },

    clearChatIdToDeleteArray: () => {
        set({ chatIdsToDelete: null })
    },

    handleDeleteChats: async () => {
        try {
            const chatIdsToDelete = get().chatIdsToDelete
            const chats = get().chats

            if (!chatIdsToDelete || chatIdsToDelete?.length === 0) return

            set((state) => ({
                chats: state.chats.filter((chat) => !chatIdsToDelete.includes(chat._id)),
                chatIdsToDelete: null
            }))


            const res = await api.delete('/api/chat/delete_chats', { data: { chatIds: chatIdsToDelete } })

            if (res.data.success) {
                Toast.show({
                    type: 'success',
                    text1: res.data.message
                })
            } else {
                set({ chats })
                Toast.show({
                    type: 'error',
                    text1: res.data.message
                })
            }
        } catch (error) {
            console.error('Could not delete chats', error)
            Toast.show({
                type: 'error',
                text1: 'Something went wrong'
            })
        }
    },

    markMessageAsRead: (chatId) => {
        set((state) => ({
            chats: state.chats.map(chat =>
                chat._id === chatId ?
                    {
                        ...chat,
                        lastMessage: {
                            ...chat.lastMessage,
                            status: 'read'
                        }
                    } : chat
            )
        }))
        get().markChatAsRead(chatId)
    },

    markChatAsRead: async (chatId) => {
        await api.post('/api/chat/mark_as_read', { chatId })
    }
}))

export default useChatAndMessageStore