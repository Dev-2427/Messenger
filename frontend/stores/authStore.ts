import z from "zod";
import { create } from "zustand";
import { codeValidation, sendEmail, sendPassword, signinSchema, signupSchema } from "../helpers/schemaValidations/schemaValidation";
import * as SecureStore from "expo-secure-store";
import api from "../helpers/axiosInstance/axiosInstance";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { registerPushNotificationAsync } from "../helpers/notificationService";
import NetInfo from '@react-native-community/netinfo'
import type { ChatAndMessagestore } from "./chatAndMessageStore";
// import { GoogleSignin } from "@react-native-google-signin/google-signin";

interface AuthUser {
    id: string,
    name: string,
    email: string
    avatar?: string,
    avatarId?: string,
    expoToken?: string
};

interface AuthState {
    user: AuthUser;
    isLoading: boolean;
    isAuthenticated: boolean;
    isVerifyingCode: boolean;
    isSigningIn: boolean,
    isSigningUp: boolean,
    isVerifyingEmail: boolean,
    isVerifyingPassword: boolean,
    isLoggingOut: boolean,
    setAvatar: (avatar: string, avatarId: string) => void;
    signIn: (data: z.infer<typeof signinSchema>) => Promise<void>;
    signUp: (data: z.infer<typeof signupSchema>) => Promise<void>;
    verifyCode: (data: z.infer<typeof codeValidation>, userId: string) => Promise<void>;
    verifyEmailSubmit: (data: z.infer<typeof sendEmail>) => Promise<void>;
    resetPasswordSubmit: (data: z.infer<typeof sendPassword>) => Promise<void>;
    signOut: () => Promise<void>;
    checkAuth: () => Promise<void>;
    emptyAvatar: () => void;
    updateUsername: (name: string) => void;
    deleteUser: () => Promise<void>,
    deletingUser: boolean,
    setAuthUser: (user: AuthUser) => void;
    setAuthenticated: (value: boolean) => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
    user: {} as AuthUser,
    isLoading: true,
    isAuthenticated: false,
    isSigningIn: false,
    isVerifyingCode: false,
    isSigningUp: false,
    isVerifyingEmail: false,
    isVerifyingPassword: false,
    isLoggingOut: false,
    deletingUser: false,

    setAvatar: (avatar, avatarId) => {
        set((state) => ({
            user: {
                ...state.user,
                avatar,
                avatarId
            }
        }))
    },

    emptyAvatar: () => {
        set((state) => ({
            user: {
                ...state.user,
                avatar: '',
                avatarId: ''
            }
        }))
    },

    updateUsername: (name) => {
        set((state) => ({
            user: {
                ...state.user,
                name
            }
        }))
    },

    setAuthUser: (user) => {
        set({ user });
    },

    setAuthenticated: (value) => {
        set({ isAuthenticated: value });
    },

    signUp: async (data) => {
        set({ isSigningUp: true })
        try {
            const res = await api.post('/api/auth/sign_up', data)

            if (res.data.success) {
                router.replace({
                    pathname: '/auth/verifyCode',
                    params: {
                        email: data.email,
                        userId: res.data.userId,
                        justSendEmail: "false"
                    }
                })

            } else {
                Toast.show({
                    type: 'success',
                    text1: res.data.message || "Something went wrong"
                })

            }
        } catch (error) {
            console.error("Signup failed", error)
            Toast.show({
                type: "error",
                text1: 'Something went wrong'
            })
        } finally {
            set({ isSigningUp: false })
        }
    },

    signIn: async (data) => {
        set({ isSigningIn: true })
        try {
            const res = await api.post(`/api/auth/sign_in`, data);

            if (res.data.success) {
                await SecureStore.setItemAsync("accessToken", res.data.accessToken)
                await SecureStore.setItemAsync("refreshToken", res.data.refreshToken);
                console.log("access", res.data.accessToken, "refresh", res.data.refreshToken)

                set({ user: res.data.userData, isAuthenticated: true })

                Toast.show({
                    type: "success",
                    text1: res.data.message
                })
                console.log('userData', res.data.userData)
                router.replace('/home/chats')
            } else {
                Toast.show({
                    type: "error",
                    text1: res.data.message || "Something went wrong"
                })
            }
        } catch (error) {
            console.error('signin failed', error)
            Toast.show({
                type: "error",
                text1: "Something went wrong"
            })
        } finally {
            set({ isSigningIn: false });
        }
    },

    verifyCode: async (data, userId) => {
        set({ isVerifyingCode: true });
        try {
            const res = await api.post('/api/auth/verify_code', { ...data, userId })

            if (res.data.success) {
                if (data.justSendEmail === 'false') {
                    await SecureStore.setItemAsync("accessToken", res.data.accessToken)
                    await SecureStore.setItemAsync("refreshToken", res.data.refreshToken)
                    console.log("access", res.data.accessToken, "refresh", res.data.refreshToken)
                }
                Toast.show({
                    type: "success",
                    text1: res.data.message
                })

                if (data.justSendEmail === 'false') {
                    set({ user: res.data.userData, isAuthenticated: true })
                    router.replace('/welcome/welcomeScreen')
                } else {
                    router.replace({
                        pathname: '/auth/resetPassword',
                        params: {
                            userId
                        }
                    })
                }
            } else {
                Toast.show({
                    type: "error",
                    text1: res.data.message || 'Something went wrong'
                })
            }

        } catch (error) {
            console.error('Failed to send verification request:', error);
            Toast.show({
                type: "error",
                text1: 'Something went wrong'
            })
        } finally {
            set({ isVerifyingCode: false })
        }
    },

    verifyEmailSubmit: async (data) => {
        set({ isVerifyingEmail: true })

        try {
            const res = await api.post('/api/auth/send_email', data)

            if (res.data.success) {
                Toast.show({
                    type: "success",
                    text1: res.data.message
                })
                // router.replace({
                //     pathname: '/auth/verifyCode',
                //     params: {
                //         email: data.email,
                //         userId: res.data.userId,
                //         justSendEmail: "true"
                //     }
                // })

                router.replace(`/auth/verifyCode?email=${data.email}&userId=${res.data.userId}&justSendEmail=true`)
            } else {
                Toast.show({
                    type: 'error',
                    text1: res.data.message
                })
            }
        } catch (error) {
            console.error("Failed to send verification code", error)
            Toast.show({
                type: 'error',
                text1: "Somrthing went wrong"
            })
        } finally {
            set({ isVerifyingEmail: false })
        }
    },

    resetPasswordSubmit: async (data) => {
        set({ isVerifyingPassword: true })

        try {

            if (data.password !== data.confirmPassword) {
                Toast.show({
                    type: 'error',
                    text1: 'Passwords do not match'
                })
                return
            }
            const res = await api.post('/api/auth/reset_password', data)

            if (res.data.success) {

                await SecureStore.deleteItemAsync("accessToken")
                await SecureStore.deleteItemAsync("refreshToken")

                console.log(await SecureStore.getItemAsync('accessToken'))
                console.log(await SecureStore.getItemAsync('refreshToken'))
                Toast.show({
                    type: 'success',
                    text1: res.data.message + ', Please sign in again.'
                })

                router.replace('/auth/authentication')
            } else {
                Toast.show({
                    type: 'error',
                    text1: res.data.message
                })
            }
        } catch (error) {
            console.error('Failed to reset password')
            Toast.show({
                type: 'error',
                text1: 'Something went wrong'
            })
        } finally {
            set({ isVerifyingPassword: false })
        }
    },

    signOut: async () => {
        set({ isLoggingOut: true })

        try {
            const res = await api.post('/api/auth/sign_out')

            if (res.data.success) {
                await SecureStore.deleteItemAsync('accessToken')
                await SecureStore.deleteItemAsync('refreshToken')

                // try {
                //     await GoogleSignin.signOut()
                // } catch (error) {
                //     console.error('Google log out failed', error)
                // }

                router.replace('/auth/authentication')
                set({ user: { email: '', name: '', id: '', avatar: '', avatarId: '', expoToken: '' } as AuthUser, isAuthenticated: false })

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
            console.error('Error on logout', error)
            Toast.show({
                type: "error",
                text1: "Something went wrong"
            })
        } finally {
            set({ isLoggingOut: false })
        }
    },

    checkAuth: async () => {
        const isAuthenticated = get().isAuthenticated
        if (isAuthenticated) return

        set({ isLoading: true })

        const networkInfo = await NetInfo.fetch()

        if (!networkInfo.isConnected) {
            set({ isLoading: false })
            return
        }

        try {
            const token = await SecureStore.getItemAsync('accessToken');
            console.log("token", token)

            if (token) {
                const res = await api.get('/api/auth/health_check')

                if (res.data.success) {
                    set({ user: res.data.userData, isAuthenticated: true })

                    try {
                        const pushToken = await registerPushNotificationAsync()
                        const currentToken = res.data.expoToken || null

                        if (pushToken && pushToken !== currentToken) {
                            const updateRes = await api.post('/api/auth/update_push_token', { pushToken })

                            if (updateRes.data.success) {
                                set({
                                    user: {
                                        ...res.data.userData,
                                        expoToken: pushToken
                                    }
                                })
                            } else {
                                console.log('error', updateRes.data.message)
                            }
                        }

                    } catch (error) {
                        console.error('Failed to handle push notifications:', error)
                    }

                } else {
                    Toast.show({
                        type: 'error',
                        text1: res.data.message
                    })
                }
            } else {
                set({ isLoading: false })
                return
            }
        } catch (error) {
            console.error('Api request failed:', error)
            Toast.show({
                type: "error",
                text1: 'Session has been expired'
            })
        } finally {
            set({ isLoading: false })
        }
    },

    deleteUser: async () => {
        try {

            const chatStore = require("./chatAndMessageStore").default;
            const chats = (chatStore.getState() as ChatAndMessagestore).chats;

            if (chats.length > 0) {
                Toast.show({
                    type: 'info',
                    text1: 'Please delete chats before account'
                })
                return
            }

            set({ deletingUser: true })

            const res = await api.delete("/api/auth/delete_user")

            if (res.data.success) {

                // try {
                //     await GoogleSignin.revokeAccess()
                //     await GoogleSignin.signOut()
                // } catch (error) {
                //     console.error('Google logout failed during user deletion', error)
                // }

                set({
                    user: { email: '', id: '', name: '', avatar: '', avatarId: '', expoToken: '' } as AuthUser,
                    isAuthenticated: false
                })

                await SecureStore.deleteItemAsync('accessToken')
                await SecureStore.deleteItemAsync('refreshToken')

                router.replace('/auth/authentication')

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
            console.error('Something went wrong while deleting account:', error)
            Toast.show({
                type: 'error',
                text1: 'Something went wrong'
            })
        } finally {
            set({ deletingUser: false })
        }

    }
}));

export default useAuthStore