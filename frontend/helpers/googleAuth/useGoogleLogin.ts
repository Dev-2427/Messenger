import * as SecureStore from "expo-secure-store";
import useAuthStore from "../../stores/authStore";
import { googleSignIn } from "./googleAuth";
import api from "../axiosInstance/axiosInstance";
import Toast from "react-native-toast-message";
import { router } from "expo-router";

interface GoogleAuthResponse {
    success: boolean,
    message: string,
    accessToken: string,
    refreshToken: string,

    userData: {
        id: string,
        name: string,
        email: string,
        avatar?: string,
        avatarId?: string
        expoToken?: string
    }
}

export function useGoogleLogin() {
    const setAuthUser = useAuthStore((s) => s.setAuthUser)
    const setAuthenticated = useAuthStore((s) => s.setAuthenticated)

    async function signInWithGoogle() {
        try {
            const idToken = await googleSignIn()

            if (!idToken) {
                throw new Error('Google token missing')
            }

            const res = await api.post<GoogleAuthResponse>('/api/auth/google_auth', { idToken })

            if (res.data.success) {
                Toast.show({ type: 'success', text1: res.data.message })
                await SecureStore.setItemAsync('accessToken', res.data.accessToken)
                await SecureStore.setItemAsync('refreshToken', res.data.refreshToken)

                setAuthUser(res.data.userData)
                setAuthenticated(true)
                router.replace('/home/chats')
            } else {
                Toast.show({ type: 'success', text1: res.data.message })
                router.replace('/auth')
                throw new Error(res.data.message)
            }

        } catch (error) {
            console.error('Google Login Error:', error)
            Toast.show({
                type: 'error',
                text1: 'Google login failed'
            })
            router.replace('/auth')
        }

    }

    return { signInWithGoogle }

}