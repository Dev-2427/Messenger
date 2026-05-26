import { create } from "zustand";
import type { Chats, Message } from "../helpers/types";
import toast from "react-hot-toast";
import api from "../helpers/url";
import type { ContextData } from "../components/chat/window/MessageBubble";

export interface FileMeta {
    id: string,
    uri: string,
    file: File
    kind: 'image' | 'video' | 'document'
}

export interface ChatAndMessageStore {
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
    chatIdsToDelete: string[],
    editableMessageId: string | null,
    isSelectingChats: boolean,
    setSelectingChatsFalse: () => void,
    setSelectingChatsTrue: () => void,
    setEditableMessageId: (messageId: string) => void,
    clearMessageState: () => void,
    resetFileAndText: () => void,
    setMessage: (msg: string) => void,
    setReceiverId: (id: string | null) => void,
    setChatId: (id: string | null) => void,
    removeFile: (id: string) => void,
    pickMedia: (event: React.ChangeEvent<HTMLInputElement>) => void,
    sendMessage: () => Promise<void>,
    getRecentChats: () => Promise<void>,
    getMessages: () => Promise<void>,
    deleteMessage: (contextMenu: ContextData) => Promise<void>,
    editMessage: (text: string, messageId: string) => Promise<void>
    handleIncomingMessage: (data: { message: Message, chatId: string, type: string, id: string }) => void,
    handleIncomingDelete: (contextMenu: ContextData) => void,
    handleIncomingEdit: (data: { messageId: string, text: string }) => void,
    putChatIdToDeleteArray: (id: string) => void,
    removeChatIdToDeleteArray: (id: string) => void,
    clearChatIdToDeleteArray: () => void,
    handleDeleteChats: () => Promise<void>
    markMessageAsRead: (chatId: string) => void
    markChatAsRead: (chatId: string) => Promise<void>,
    addFileToArray: (file: FileMeta) => void,
}

const chatAndMessageStore = create<ChatAndMessageStore>((set, get) => ({
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
    chatIdsToDelete: [],
    editableMessageId: null,
    isSelectingChats: false,

    setSelectingChatsTrue: () => {
        set({ isSelectingChats: true })
    },

    setSelectingChatsFalse: () => {
        set({
            isSelectingChats: false,
            chatIdsToDelete: []
        })
    },

    setEditableMessageId: (messageId) => {
        set({ editableMessageId: messageId })
    },

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

    pickMedia: (event) => {
        const selectedFiles = Array.from(event.target.files || [])

        if (selectedFiles.length === 0) return

        const currentFiles = get().files

        const totalFiles = currentFiles.length + selectedFiles.length

        if (totalFiles > 5) {
            toast.error("You can upload maximum 5 files")
            return
        }

        const mappedFiles: FileMeta[] = selectedFiles.map((file) => ({
            id: crypto.randomUUID(),
            uri: URL.createObjectURL(file),
            file,
            kind: file.type.startsWith("image") ? "image" : file.type.startsWith("video") ? "video" : "document"
        }))

        set((state) => ({
            files: [...state.files, ...mappedFiles]
        }))
    },

    removeFile: (id) => {
        const targetFile = get().files.find((file) => file.id === id)

        if (targetFile) {
            URL.revokeObjectURL(targetFile.uri)
        }

        set((state) => ({
            files: state.files.filter((file) => file.id !== id)
        }))
    },

    sendMessage: async () => {
        const text = get().text
        const receiverId = get().receiverId
        const chatId = get().chatId
        const files = get().files

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
            form.append("files", file.file)
        })

        try {
            const res = await api.post('/api/chat/send_message', form)

            if (res.data.success) {
                toast.success(res.data.message)

                set((state) => ({
                    messages: [res.data.data.message, ...state.messages]
                }))

                set({ files: [] })
                set({ text: '' })
            } else {
                toast.error(res.data.message)
            }
        } catch (error) {
            console.error('Could not send message:', error)
            toast.error(error.response?.data?.message || 'Failed to send message')
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
                res.data.message !== "No chat found" && toast.error(res.data.message)
            }
        } catch (error) {
            console.error('Failed to get chats:', error)
            toast.error(error.response?.data?.message || 'Failed to get chats')
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
                if (res.data.message === 'Chat does not eist') {
                    return
                }
                set({ messages: res.data.messages })
            } else {
                toast.error(res.data.message)
                set({ messages: [] })
            }
        } catch (error) {
            console.error('Error getting messages:', error)
            toast.error(error.response?.data?.message)
        } finally {
            set({ gettingMessages: false })
        }
    },

    deleteMessage: async (contextMenu) => {
        set({ deletingMessage: true })

        try {
            const res = await api.post('/api/chat/delete_message', contextMenu)

            if (res.data.success) {

                set((state) => {

                    let updatedMessages = state.messages.map((m) => {

                        if (m._id !== contextMenu.messageId) {
                            return m
                        }

                        if (contextMenu.type === "text") {
                            return {
                                ...m,
                                text: null,
                            }
                        }

                        if (contextMenu.type === "media") {
                            return {
                                ...m,
                                media: m.media.filter(
                                    (file) =>
                                        file.fileId !== contextMenu.mediaId
                                ),
                            }
                        }

                        return m
                    })

                    updatedMessages = updatedMessages.filter(
                        (m) =>
                            m.text ||
                            m.media.length > 0
                    )

                    return {
                        messages: updatedMessages,
                    }
                })
            } else {
                toast.error(res.data.message)
            }
        } catch (error) {
            console.error('Could not send request, try again.', error)
            toast.error(error.response?.data?.message)
        } finally {
            set({ deletingMessage: false })
        }
    },

    editMessage: async (text, messageId) => {
        const chatId = get().chatId

        if (!chatId) {
            toast.error('Invalid chat')
            return
        }

        if (!messageId) {
            toast.error('Invalid message')
            return
        }

        if (!text || !text.trim()) {
            toast.error('Message is empty')
            return
        }

        set({ sendingMessage: true })

        try {
            const res = await api.post('/api/chat/edit_message', { chatId, text, messageId })

            if (res.data.success) {
                set((state) => ({
                    editableMessageId: null,
                    text: "",

                    messages: state.messages.map((m) =>
                        m._id === messageId
                            ? {
                                ...m,
                                text,
                            }
                            : m
                    ),
                }))
                toast.success(res.data.message)
            } else {
                toast.error(res.data.message)
            }
        } catch (error) {
            console.error('Failed to edit the message:', error)
            toast.error(error.response?.data?.message || 'Failed to edit the message')
        } finally {
            set({ sendingMessage: false })
        }
    },

    handleIncomingMessage: (data) => {
        const { chatId, message, id } = data

        const currentChatId = get().chatId
        const currentReceiverId = get().receiverId

        const chat = get().chats.find((chat) => chat._id === chatId)
        if (id === currentReceiverId || id === currentChatId || chatId === currentChatId || currentReceiverId === chat?.otherUser?._id) {
            set((state) => ({
                messages: [message, ...state.messages]
            }))
        } else {
            set((state) => {

                const updatedChats =
                    state.chats.map((chat) => {

                        if (chat._id === chatId) {

                            return {
                                ...chat,

                                lastMessage: {
                                    text:
                                        message.text ||

                                        (message.media?.length
                                            ? "Media"
                                            : ""),

                                    senderId:
                                        message.sender._id,

                                    time:
                                        message.createdAt,

                                    status:
                                        message.status,
                                }
                            }
                        }

                        return chat
                    })

                const targetChat =
                    updatedChats.find(
                        (chat) => chat._id === chatId
                    )

                const remainingChats =
                    updatedChats.filter(
                        (chat) => chat._id !== chatId
                    )

                return {
                    chats: targetChat
                        ? [
                            targetChat,
                            ...remainingChats
                        ]
                        : state.chats
                }
            })

            toast.success(
                `${message.sender.fullName}: ${message.text || "Media"
                }`
            )
        }
    },

    handleIncomingDelete: (contextMenu) => {
        set((state) => {
            let updatedMessages = state.messages.map((m) => {
                if (m._id !== contextMenu.messageId) {
                    return m
                }
                if (contextMenu.type === "text") {
                    return { ...m, text: null }
                }

                if (contextMenu.type === "media") {
                    return { ...m, media: m.media.filter((file) => file.fileId !== contextMenu.mediaId) }
                }

                return m
            })

            updatedMessages = updatedMessages.filter((m) => m.text || m.media.length > 0)

            return { messages: updatedMessages }
        })
    },

    handleIncomingEdit: ({ messageId, text }) => {
        set((state) => ({
            messages: state.messages.map((m) => m._id === messageId ? { ...m, text } : m)
        }))
    },

    putChatIdToDeleteArray: (id) => {
        set((state) => {
            if (state.chatIdsToDelete.includes(id)) return state

            return { chatIdsToDelete: [...state.chatIdsToDelete, id] }

        })
    },

    removeChatIdToDeleteArray: (id) => {
        set((state) => ({
            chatIdsToDelete: state.chatIdsToDelete?.filter((value) => value !== id)
        }))
    },

    clearChatIdToDeleteArray: () => {
        set({ chatIdsToDelete: [] })
    },

    handleDeleteChats: async () => {
        try {
            const chatIdsToDelete = get().chatIdsToDelete
            const activeChatId = get().chatId
            const chats = get().chats

            if (chatIdsToDelete.length === 0) return

            set((state) => ({
                chats: state.chats.filter((chat) => !chatIdsToDelete.includes(chat._id)),
                chatIdsToDelete: []
            }))

            if (activeChatId && chatIdsToDelete.includes(activeChatId)) {
                set({ chatId: null, receiverId: null, messages: null })
            }

            const res = await api.delete('/api/chat/delete_chats', { data: { chatIds: chatIdsToDelete } })

            if (res.data.success) {
                toast.success(res.data.message)
                set({ chatIdsToDelete: [] })
            } else {
                set({ chats, chatIdsToDelete: [] })
                toast.error(res.data.message)
            }
        } catch (error) {
            console.error('Could not delete chats:', error)
            toast.error(error.response?.data?.message || 'Could not delete chats')
        }
    },

    markMessageAsRead: async (chatId) => {
        set((state) => ({
            chats: state.chats.map(chat => chat._id === chatId ? { ...chat, lastMessage: { ...chat.lastMessage, status: 'read' } } : chat)
        }))

        get().markChatAsRead(chatId)
    },

    markChatAsRead: async (chatId) => {
        await api.post('/api/chat/mark_as_read', { chatId })
    },
}))


export default chatAndMessageStore