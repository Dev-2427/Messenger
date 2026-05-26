import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";
import FullScreenLoader from "../components/common/FullScreenLoader";

export default function PublicRoute() {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return <FullScreenLoader />
    }

    return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}