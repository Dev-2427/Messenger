import { NavLink, useNavigate } from "react-router-dom"
import useAuthStore from "../../store/authStore";
import {
    MessageCircleMore,
    Users,
    Settings,
    LogOut
} from "lucide-react"

export default function Sidebar() {

    const navigate = useNavigate()

    const user = useAuthStore((s) => s.user)
    const signOut = useAuthStore((s) => s.signOut)

    const navItems = [
        {
            name: "Chats",
            path: "/",
            icon: MessageCircleMore,
        },
        {
            name: "Community",
            path: "/community",
            icon: Users,
        },
        {
            name: "Settings",
            path: "/settings",
            icon: Settings,
        },
    ]

    return (
        <aside className="hidden md:flex lg:w-72 md:w-20 h-screen border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-col transition-all duration-200">
            <div className="px-5 py-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-center lg:justify-start gap-3">
                    {user.avatar ?
                        <img
                            onClick={() => navigate("/settings")}
                            src={user.avatar}
                            alt="profile"
                            className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover cursor-pointer hover:opacity-90 transition-all"
                        />
                        :
                        (
                            <button
                                onClick={() => navigate("/settings")}
                                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center cursor-pointer">

                                <span className="text-lg lg:text-xl font-semibold text-zinc-700 dark:text-zinc-200">                                    {user.name.charAt(0)}
                                </span>

                            </button>
                        )
                    }

                    <div className="hidden lg:block">
                        <h2 className="font-semibold text-[17px] text-zinc-900 dark:text-white">{user.name}</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Online</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1.5">
                {navItems.map((item) => {
                    const Icon = item.icon

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3 px-3 lg:px-4 py-3 rounded-2xl transition-all duration-200 ${isActive
                                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                }`
                            }
                        >
                            <Icon size={22}
                                className="shrink-0"
                            />
                            <span className="hidden lg:block font-medium">
                                {item.name}</span>
                        </NavLink>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => signOut(navigate)}
                    className="w-full flex items-center justify-center py-3 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 font-semibold transition-all cursor-pointer">
                    <div className="flex items-center justify-center gap-3">

                        <LogOut
                            size={20}
                            className="shrink-0"
                        />

                        <span className="hidden lg:block">
                            Logout
                        </span>

                    </div>
                </button>
            </div>
        </aside>
    )
}