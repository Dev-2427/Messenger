import { useEffect } from "react"
import getUsersStore from "../../store/getUsersStore"
import useChatAndMessageStore from "../../store/chatAndMessageStore"
import useSocketStore from "../../store/useSocketStore"
import useUpdateProfile from "../../store/updateProfileStore"

export default function AllUsers() {

    const users = getUsersStore((s) => s.users)
    const isGettingUser = getUsersStore((s) => s.isGettingUser)
    const getUsers = getUsersStore((s) => s.getUsers)

    const setReceiverId = useChatAndMessageStore((s) => s.setReceiverId)
    const setChatId = useChatAndMessageStore((s) => s.setChatId)
    const onlineUsers = useSocketStore((s) => s.onlineUsers)
    const showActiveStatus = useUpdateProfile((s) => s.showActiveStatus)

    useEffect(() => {
        getUsers()
    }, [])

    if (isGettingUser) {
        return (
            <div className="flex gap-3 overflow-x-auto scroll-smooth px-4 py-3">

                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="animate-pulse">

                        <div className="w-14 h-14 rounded-full bg-zinc-200 dark:bg-zinc-800" />

                        <div className="w-14 h-3 bg-zinc-200 dark:bg-zinc-800 rounded mt-2 mx-auto" />

                    </div>
                ))}

            </div>
        )
    }

    return (
        <div className="flex gap-3 overflow-x-auto px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 scrollbar-hide">

            {users.map((user) => (
                <button
                    key={user._id}
                    onClick={() => {
                        setReceiverId(user._id)
                        setChatId(null)
                    }}
                    className="flex flex-col items-center gap-2 min-w-[68px] shrink-0 transition-transform duration-200 hover:scale-[1.03] hover:cursor-pointer"
                >

                    <div className='relative'>
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.fullName}
                                className="w-14 h-14 lg:w-16 lg:h-16 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">

                                <span className="text-lg lg:text-xl font-semibold text-zinc-700 dark:text-zinc-200">
                                    {user.fullName.charAt(0)}
                                </span>

                            </div>
                        )}
                        {showActiveStatus &&
                            onlineUsers.includes(user._id) && (
                                <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-zinc-900" />
                            )
                        }
                    </div>


                    <p className="text-xs lg:text-sm text-zinc-600 dark:text-zinc-400 max-w-[70px] truncate text-center">
                        {user.fullName}
                    </p>

                </button>
            ))}

        </div>
    )
}