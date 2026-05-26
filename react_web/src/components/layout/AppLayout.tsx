import MobileBottomNav from "./MobileBottomNav"
import Sidebar from "./Sidebar"
import { Outlet } from "react-router-dom"

export default function AppLayout() {
    return (
        <div className="flex h-screen min-h-0 bg-zinc-50 dark:bg-zinc-950">

            <Sidebar />

            <main className="flex-1 min-h-0 overflow-hidden pb-16 md:pb-0">
                <Outlet />
            </main>
            <MobileBottomNav />
        </div>
    )
}