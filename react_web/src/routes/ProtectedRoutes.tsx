import { Navigate, Outlet } from "react-router-dom"
import { useEffect } from "react"

import useAuthStore from "../store/authStore"
import useSocketStore from "../store/useSocketStore"
import useThemeStore from "../store/useThemeStore"
import useUpdateProfile from "../store/updateProfileStore"
import FullScreenLoader from "../components/common/FullScreenLoader"

export default function ProtectedRoute() {

    const { isAuthenticated, isLoading } =
        useAuthStore()

    const connectSocket = useSocketStore(
        (s) => s.connectSocket
    )

    const disconnectSocket = useSocketStore(
        (s) => s.disconnectSocket
    )

    const hydrated = useThemeStore(
        (s) => s.hydrated
    )

    const hasHydrated =
        useUpdateProfile(
            (s) => s.hasHydrated
        )

    useEffect(() => {

        if (isAuthenticated) {
            connectSocket()
        }

        return () => {
            disconnectSocket()
        }

    }, [isAuthenticated])


    const ready = !isLoading && hydrated && hasHydrated

    if (!ready) {
        return <FullScreenLoader />
    }

    return isAuthenticated
        ? <Outlet />
        : <Navigate to="/signin" replace />
}