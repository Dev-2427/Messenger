import { create } from "zustand";
import { Socket, io } from "socket.io-client";
import useChatAndMessageStore from "./chatAndMessageStore";
import * as SecureStore from 'expo-secure-store'
import api from "../helpers/axiosInstance/axiosInstance";
import useAuthStore from "./authStore";

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

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

        const token = await SecureStore.getItemAsync('accessToken')

        if (!token) {
            console.log('No token found')
            return
        }

        const socket = io(BASE_URL, {
            auth: { token }
        })

        socket.on('connect', () => {
            set({ isConnected: true })
            console.log('Connected to real-time server')
        })

        socket.on('connect_error', async (err) => {
            console.log('❌ CONNECTION ERROR:', err.message);

            if (err.message === 'Unauthorized') {
                socket.disconnect()
                set({ socket: null, isConnected: false })
            }
        });

        socket.on('disconnect', () => {
            console.log('Disconnected')
            set({ isConnected: false })

        })

        socket.on('receiveMessage', (data) => {
            console.log("Socket heard a message!", data)

            const handleIncomingMessage = useChatAndMessageStore.getState().handleIncomingMessage

            handleIncomingMessage(data)
        })

        socket.on('getOnlineUsers', (users) => {
            console.log('users', users)
            set({ onlineUsers: users })
            console.log('online users', get().onlineUsers)
        })

        set({ socket })
    },

    disconnectSocket: () => {
        get().socket?.disconnect()
        set({ socket: null, isConnected: false })
    },
}))

export default useSocketStore