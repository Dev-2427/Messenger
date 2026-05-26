import { NavLink, useNavigate } from "react-router-dom"

import {
    MessageCircleMore,
    Users,
} from "lucide-react"

import useAuthStore
    from "../../store/authStore"

export default function MobileBottomNav() {

    const navigate = useNavigate()

    const user =
        useAuthStore((s) => s.user)

    const navItems = [
        {
            path: "/",
            icon: MessageCircleMore,
        },
        {
            path: "/community",
            icon: Users,
        },
    ]

    return (

        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-around px-4 z-50">

            {navItems.map((item) => {

                const Icon = item.icon

                return (

                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 ${isActive
                                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                                : "text-zinc-500 dark:text-zinc-400"
                            }`
                        }
                    >

                        <Icon size={24} />

                    </NavLink>
                )
            })}

            <button
                onClick={() =>
                    navigate("/settings")
                }
                className="flex items-center justify-center cursor-pointer"
            >

                {user.avatar ? (

                    <img
                        src={user.avatar}
                        alt="profile"
                        className="w-10 h-10 rounded-full object-cover"
                    />

                ) : (

                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">

                        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">

                            {user.name.charAt(0)}

                        </span>

                    </div>

                )}

            </button>

        </div>
    )
}