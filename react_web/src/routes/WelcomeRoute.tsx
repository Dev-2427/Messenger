import { Navigate, Outlet } from "react-router-dom"
import useAuthStore from "../store/authStore"

export default function WelcomeRoute() {

    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
    const needsAvatarSetup = useAuthStore((s) => s.needsAvatarSetup)

    if (!isAuthenticated) {
        return (<Navigate to={"/signin"} replace />)
    }

    if (!needsAvatarSetup) {
        return (<Navigate to={"/"} replace />)
    }

    return <Outlet />
}
