import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware";

type ThemeMode = 'light' | 'dark'

interface ThemeStore {
    mode: ThemeMode,
    hydrated: boolean,
    toggleMode: () => void,
    setHydrated: (status: boolean) => void
}

const useThemeStore = create(persist<ThemeStore, [], [], Pick<ThemeStore, "mode">>((set, get) => ({
    mode: 'light',
    hydrated: false,

    toggleMode: () => {
        const next = get().mode === 'dark' ? 'light' : 'dark'

        set({ mode: next })
    },

    setHydrated: (status) => {
        set({ hydrated: status })
    }
}),
    {
        name: 'theme-store',

        storage: createJSONStorage(() => localStorage),

        partialize: (state) => ({
            mode: state.mode
        }),

        onRehydrateStorage: () => {
            return (state, error) => {
                if (error) {
                    console.error('Error on theme hydration:', error)
                }

                state?.setHydrated(true)
            }
        }
    }
)
)

export default useThemeStore