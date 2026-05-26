import { useEffect, useState } from "react"

import getUsersStore from "../../store/getUsersStore"
import useSocketStore from "../../store/useSocketStore"
import useUpdateProfile from "../../store/updateProfileStore"
import useChatAndMessageStore from "../../store/chatAndMessageStore"
import { useNavigate } from "react-router-dom"

export default function Community() {
    const navigate = useNavigate()
    const [search, setSearch] =
        useState("")

    const users = getUsersStore(
        (s) => s.users
    )

    const getUsers = getUsersStore(
        (s) => s.getUsers
    )

    const isGettingUser = getUsersStore(
        (s) => s.isGettingUser
    )

    const onlineUsers = useSocketStore(
        (s) => s.onlineUsers
    )

    const showActiveStatus =
        useUpdateProfile(
            (s) => s.showActiveStatus
        )

    const setReceiverId =
        useChatAndMessageStore(
            (s) => s.setReceiverId
        )

    const setChatId =
        useChatAndMessageStore(
            (s) => s.setChatId
        )

    useEffect(() => {
        getUsers()
    }, [])

    const filteredUsers = users.filter(
        (user) =>
            user.fullName
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                )
    )

    return (
        <div className="h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
            {/* Header */}
            <div className="sticky top-0 z-10 px-4 py-5 lg:px-8 lg:py-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-xl transition-colors duration-200">

                <h1 className="text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-white">
                    Community
                </h1>

                <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                    Discover people
                </p>

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    className="mt-6 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 px-5 py-4 text-zinc-900 dark:text-white outline-none backdrop-blur-xl focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 transition-colors duration-200"
                />

            </div>

            {/* Users */}
            <div className="px-4 py-5 lg:px-8 lg:py-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">

                {isGettingUser
                    ? (
                        [1, 2, 3, 4, 5, 6].map((item) => (
                            <div
                                key={item}
                                className="h-28 rounded-[28px] bg-zinc-200 dark:bg-zinc-800 animate-pulse"
                            />
                        ))
                    )
                    : (
                        filteredUsers.map((user) => (

                            <button
                                key={user._id}
                                onClick={() => {
                                    setReceiverId(user._id)
                                    setChatId(null)
                                    navigate('/')
                                }}
                                className="p-5 rounded-[28px] border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 backdrop-blur-xl transition-colors duration-200 flex items-center gap-4 text-left cursor-pointer"
                            >

                                {/* Avatar */}
                                <div className="relative">

                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.fullName}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">

                                            <span className="text-2xl font-semibold text-zinc-700 dark:text-zinc-200">
                                                {user.fullName.charAt(0)}
                                            </span>

                                        </div>
                                    )}

                                    {showActiveStatus &&
                                        onlineUsers.includes(user._id) && (
                                            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-zinc-900" />
                                        )}

                                </div>

                                {/* Info */}
                                <div>

                                    <h2 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                        {user.fullName}
                                    </h2>

                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                                        {onlineUsers.includes(user._id)
                                            ? "Online"
                                            : "Offline"}
                                    </p>

                                </div>

                            </button>

                        ))
                    )}

            </div>

        </div>
    )
}