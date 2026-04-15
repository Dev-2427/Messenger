import { create } from "zustand";
import { Socket, io } from "socket.io-client";
import useChatAndMessageStore from "./chatAndMessageStore";
import Toast from "react-native-toast-message";
import * as SecureStore from 'expo-secure-store'
import api from "../helpers/axiosInstance/axiosInstance";
import useAuthStore from "./authStore";

export const BASE_URL = 'http://10.227.94.68:3000';

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
                try {
                    console.log("🔄 Refreshing token...")
                    const refreshToken = await SecureStore.getItemAsync('refreshToken')
                    console.log('refreshToken', refreshToken)
                    const res = await api.post('/api/auth/refresh', {}, {
                        headers: {
                            Authorization: `Bearer ${refreshToken}`,
                            'x-platform': 'mobile'
                        }
                    })

                    if (!res.data.success) {
                        useAuthStore.getState().signOut()
                        throw new Error(res.data.message)
                    }

                    await SecureStore.setItemAsync('accessToken', res.data.accessToken)
                    await SecureStore.setItemAsync('refreshToken', res.data.refreshToken)

                    socket.auth.token = res.data.accessToken
                    socket.connect()
                } catch (error) {
                    console.error('❌ Refresh token failed from socket')
                }
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