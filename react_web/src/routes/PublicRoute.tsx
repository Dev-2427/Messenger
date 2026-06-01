import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";
import FullScreenLoader from "../components/common/FullScreenLoader";

export default function PublicRoute() {
    const { isAuthenticated, isLoading, needsAvatarSetup } = useAuthStore();

    if (isLoading) {
        return <FullScreenLoader />
    }

    if (!isAuthenticated) return <Outlet />

    if (needsAvatarSetup) return <Navigate to="/welcome" replace />


    return <Navigate to="/" replace />;
}