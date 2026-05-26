import toast from "react-hot-toast";
import { create } from "zustand";
import api from "../helpers/url";

export interface User {
    _id: string,
    fullName: string,
    avatar?: string,
    email: string,
    lastSeen?: Date | null
}

interface UseGetUsersStore {
    users: User[],
    isGettingUser: boolean,
    getUsers: () => Promise<void>
}

const getUsersStore = create<UseGetUsersStore>((set) => ({
    users: [],
    isGettingUser: false,

    getUsers: async () => {
        set({ isGettingUser: true })

        try {
            const res = await api.get('/api/users/get_users')

            if (res.data.success) {
                set({ users: res.data.users })
            } else {
                toast.error(res.data.message)
            }
        } catch (error) {
            console.error('Error getting users:', error)
            toast.error(error.response?.data?.message || 'Failed to get users')
        }finally{
            set({isGettingUser: false})
        }
    }
}))

export default getUsersStore