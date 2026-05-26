import { Socket, io } from "socket.io-client"
import { create } from "zustand"
import useChatAndMessageStore from "./chatAndMessageStore";

export const BASE_URL = import.meta.env.VITE_URL

interface SocketStore {
    socket: Socket | null,
    onlineUsers: string[],
    isConnected: boolean,
    connectSocket: () => void,
    disconnectSocket: () => void
}

const useSocketStore = create<SocketStore>((set, get) => ({
    socket: null,
    isConnected: false,
    onlineUsers: [],

    connectSocket: async () => {
        if (get().socket?.connected) return

        const socket = io(BASE_URL, {
            withCredentials: true
        })

        socket.on('connect', () => {
            set({ isConnected: true })
            console.log('Connected to real-time server')
        })

        socket.on('connect_error', async (err) => {
            console.log('❌ CONNECTION ERROR:', err.message)

            if (err.message === 'Unauthorized') {
                set({ socket: null, isConnected: false })
            }
        })

        socket.on('disconnect', () => {
            console.log('Disconnected')
            set({ isConnected: false })
        })

        socket.on('receiveMessage', (data) => {
            console.log('Socket heard a message!', data)

            const handleIncomingMessage = useChatAndMessageStore.getState().handleIncomingMessage

            handleIncomingMessage(data)
        })

        socket.on('getOnlineUsers', (users) => {
            console.log('users', users)
            set({ onlineUsers: users })
            console.log('Online users', get().onlineUsers)
        })

        socket.on("messageDeleted", (data) => {
            console.log("delete", data)
            const handleIncomingDelete = useChatAndMessageStore.getState().handleIncomingDelete

            handleIncomingDelete(data.contextMenu)
        })

        socket.on("messageEdited", (data) => {
            console.log("edit", data)
            const handleIncomingEdit = useChatAndMessageStore.getState().handleIncomingEdit

            handleIncomingEdit(data)
        })

        set({ socket })
    },

    disconnectSocket: async () => {
        get().socket?.disconnect()
        set({ socket: null, isConnected: false })
    }
}))

export default useSocketStore