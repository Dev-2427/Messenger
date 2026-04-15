import { create } from "zustand"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createJSONStorage, persist } from "zustand/middleware"

type ThemeMode = 'light' | 'dark'

type ThemeState = {
    mode: ThemeMode,
    hydrated: boolean,
    toggleMode: () => Promise<void>,
    setHydrated: (status: boolean) => void,
}

export const useThemeStore = create(persist<ThemeState>((set, get) => ({
    mode: 'light',
    hydrated: false,

    toggleMode: async () => {
        const next = get().mode === 'dark' ? 'light' : 'dark'
        set({ mode: next })
        await AsyncStorage.setItem('theme', next)
    },

    setHydrated: (status) => {
        set({ hydrated: status })
    }

}
),
    {
        name: 'theme-store',
        storage: createJSONStorage(() => AsyncStorage),

        onRehydrateStorage: () => {
            return (state, error) => {
                if (error) {
                    console.log('Error on theme hydration:', error)
                }
                state?.setHydrated(true)
            }
        },
    }
)
)