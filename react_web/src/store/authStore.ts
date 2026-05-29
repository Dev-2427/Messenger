import z from 'zod'
import { create } from "zustand";
import type { sendEmail, sendPassword, signUpSchema, signinSchema, verifyCodeSchema } from '../schemas/schema';
import api from '../helpers/url';
import toast from 'react-hot-toast';
import type { NavigateFunction } from 'react-router-dom';
import chatAndMessageStore from './chatAndMessageStore';

export interface AuthUser {
    id: string,
    name: string,
    email: string,
    avatar?: string,
    avatarId?: string
}

interface AuthStore {
    user: AuthUser,
    isLoading: boolean,
    isAuthenticated: boolean,
    isVerifyingCode: boolean,
    isSigningUp: boolean,
    isSigningin: boolean,
    isVerifyingEmail: boolean,
    isVerifyingPassword: boolean,
    isLoggingout: boolean,
    deletingUser: boolean,
    needsAvatarSetup: boolean,
    setAvatar: (avatar: string, avatarId: string) => void,
    googleAuth: (idToken: string, navigate: NavigateFunction) => Promise<void>,
    signIn: (data: z.infer<typeof signinSchema>, navigate: NavigateFunction) => Promise<void>,
    signUp: (data: z.infer<typeof signUpSchema>, navigate: NavigateFunction) => Promise<void>,
    verifyCode: (data: z.infer<typeof verifyCodeSchema>, userId: string, navigate: NavigateFunction) => Promise<void>,
    verifyEmailSubmit: (data: z.infer<typeof sendEmail>, navigate: NavigateFunction) => Promise<void>,
    resetPasswordSubmit: (data: z.infer<typeof sendPassword>, navigate: NavigateFunction) => Promise<void>,
    signOut: (navigate: NavigateFunction) => Promise<void>,
    checkAuth: () => Promise<void>,
    emptyAvatar: () => void,
    updateUsername: (name: string) => void,
    deleteUser: (navigate: NavigateFunction) => Promise<void>,
    setAuthUser: (user: AuthUser) => void,
    setAuthenticated: (value: boolean) => void,
    completeAvatarSetup: () => void,
    forceLogout: () => void,
}

const authStore = create<AuthStore>((set) => ({
    user: {} as AuthUser,
    isLoading: true,
    isAuthenticated: false,
    isSigningin: false,
    isVerifyingCode: false,
    isSigningUp: false,
    isVerifyingEmail: false,
    isVerifyingPassword: false,
    isLoggingout: false,
    deletingUser: false,
    needsAvatarSetup: false,

    setAvatar: (avatar, avatarId) => {
        set((state) => ({
            user: {
                ...state.user,
                avatar, avatarId
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
        set({ user })
    },

    setAuthenticated: (value) => {
        set({ isAuthenticated: value })
    },

    completeAvatarSetup: () => {
        set({ needsAvatarSetup: false })
    },

    googleAuth: async (idToken, navigate) => {
        try {
            const res = await api.post("/api/auth/google_auth", { idToken })

            if (res.data.success) {
                set({ user: res.data.userData, isAuthenticated: true })
                toast.success(res.data.message)

                navigate("/", { replace: true })
            } else {
                toast.error(res.data.message)
            }
        } catch (error: any) {
            console.error("Google signin failed", error)
            toast.error(error.response?.data?.message || "Google signin failed")
        }
    },

    signUp: async (data, navigate) => {
        set({ isSigningUp: true })

        try {
            const res = await api.post('/api/auth/sign_up', data)

            if (res.data.success) {
                navigate(`/verifyCode/${res.data.userId}/false`)
            } else {
                toast.error(res.data.message)
            }
        } catch (error: any) {
            console.error('Signup failed', error)
            toast.error(error.response?.data?.message || 'Signup failed')
        } finally {
            set({ isSigningUp: false })
        }
    },

    signIn: async (data, navigate) => {
        set({ isSigningin: true })

        try {
            const res = await api.post('/api/auth/sign_in', data)

            if (res.data.success) {
                console.log(res.data)
                set({ user: res.data.userData, isAuthenticated: true })

                toast.success(res.data.message)
                navigate('/', { replace: true })
            } else {
                toast.error(res.data.message)
            }
            console.log(res.data)
        } catch (error: any) {
            console.error('Signin Failed:', error)
            toast.error(error.response?.data?.message || 'Signin failed')
        } finally {
            set({ isSigningin: false })
        }
    },

    verifyCode: async (data, userId, navigate) => {
        set({ isVerifyingCode: true })

        try {
            const res = await api.post('/api/auth/verify_code', { ...data, userId })

            if (res.data.success) {
                if (data.justSendEmail === 'false') {
                    set({ user: res.data.userData, isAuthenticated: true, needsAvatarSetup: true })
                    toast.success(res.data.message)
                    navigate('/welcome', { replace: true })
                } else if (data.justSendEmail === 'true') {
                    navigate(`/resetPassword/${userId}`)
                }
            } else {
                toast.error(res.data.message)
            }
        } catch (error: any) {
            console.error('Verification failed:', error)
            toast.error(error.response?.data?.message || 'Verification failed')
        } finally {
            set({ isVerifyingCode: false })
        }
    },

    verifyEmailSubmit: async (data, navigate) => {
        set({ isVerifyingEmail: true })

        try {
            const res = await api.post('/api/auth/send_email', data)

            if (res.data.success) {
                toast.success(res.data.message)
                navigate(`/verifyCode/${res.data.userId}/true`)
            } else {
                console.log("errrrrrr", res.data)
                toast.error(res.data.message)
            }
        } catch (error: any) {
            console.error('Failed to verify email:', error)
            toast.error(error.response?.data?.message || 'Failed to verify email')
        } finally {
            set({ isVerifyingEmail: false })
        }
    },

    resetPasswordSubmit: async (data, navigate) => {
        set({ isVerifyingPassword: true })

        try {
            const res = await api.post('/api/auth/reset_password', data)

            if (res.data.success) {
                toast.success(res.data.message)
                navigate('/signin')
            } else {
                toast.error(res.data.message)
            }
        } catch (error: any) {
            console.error('Failed to reset password:', error)
            toast.error(error.response?.data?.message || 'Failed to reset password')
        } finally {
            set({ isVerifyingPassword: false })
        }
    },

    signOut: async (navigate) => {
        set({ isLoggingout: true })

        try {
            const res = await api.post('/api/auth/sign_out')

            if (res.data.success) {
                navigate('/signin')

                set({ user: { email: '', id: '', name: '', avatar: '', avatarId: '' }, isAuthenticated: false })

                toast.success(res.data.message)
            } else {
                toast.error(res.data.message)
            }
        } catch (error: any) {
            console.error('Error on logout:', error)
            toast.error(error.response?.data?.message || 'Failed to logout')
        } finally {
            set({ isLoggingout: false })
        }
    },

    forceLogout: () => {
        set({ user: { email: "", id: "", name: "", avatar: "", avatarId: "" }, isAuthenticated: false })
    },

    checkAuth: async () => {
        set({ isLoading: true })

        try {
            const res = await api.get('/api/auth/health_check')

            if (res.data.success) {
                set({ user: res.data.userData, isAuthenticated: true })
            } else {
                res.data.message !== "Session expired" &&
                    toast.error(res.data.message)
            }
        } catch (error: any) {
            console.error('Something went wrong:', error)
            set({
                user: {} as AuthUser,
                isAuthenticated: false
            })
        } finally {
            set({ isLoading: false })
        }
    },

    deleteUser: async (navigate) => {
        try {
            const chats = chatAndMessageStore.getState().chats

            if (chats.length > 0) {
                toast.error("Please delete chats before account")
                return
            }

            set({ deletingUser: true })

            const res = await api.delete("/api/auth/delete_user")

            if (res.data.success) {
                set({ user: { email: '', id: '', name: '', avatar: '', avatarId: '' }, isAuthenticated: false })
                navigate('/signin', { replace: true })
                toast.success(res.data.message)
            } else {
                toast.error(res.data.message)
            }
        } catch (error: any) {
            console.error('Something went wrong while deleting account:', error)
            toast.error(error.response?.data?.message || 'Error on account deletion')
        } finally {
            set({ deletingUser: false })
        }
    },


}))

export default authStore