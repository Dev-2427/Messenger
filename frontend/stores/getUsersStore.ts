import { create } from "zustand";
import api from "../helpers/axiosInstance/axiosInstance";

export interface User {
    _id: string;
    fullName: string;
    avatar?: string;
    email: string;
    lastSeen?: Date | null
}

interface UseGetUsersStore {
    users: User[];
    isGettingUser: boolean;
    getUsers: () => Promise<void>;
}

const useGetUsers = create<UseGetUsersStore>((set, get) => ({
    users: [],
    isGettingUser: false,

    getUsers: async () => {
        set({ isGettingUser: true });

        try {
            const res = await api.get("/api/users/get_users");
            if (res.data.success) {
                set({ users: res.data.users });
            }
        } catch (error) {
            console.error("Error getting user", error);
        } finally {
            set({ isGettingUser: false });
        }
    },
}));

export default useGetUsers;
