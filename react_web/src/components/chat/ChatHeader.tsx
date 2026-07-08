import useSocketStore from "../../store/useSocketStore"
import useUpdateProfile from "../../store/updateProfileStore"
import { formatMessageTime } from "../../helpers/formatMessageTime"
import { ArrowLeft } from "lucide-react"
import useChatAndMessageStore from "../../store/chatAndMessageStore"

interface HeaderProps {
    avatar?: string
    name: string
    id: string
    lastSeen?: Date | null,
    onOpenProfile: () => void
}

export default function ChatHeader({
    avatar,
    name,
    id,
    lastSeen,
    onOpenProfile
}: HeaderProps) {
    const onlineUsers = useSocketStore((s) => s.onlineUsers)

    const showActiveStatus = useUpdateProfile((s) => s.showActiveStatus)

    const setChatId = useChatAndMessageStore((s) => s.setChatId)
    const setReceiverId = useChatAndMessageStore((s) => s.setReceiverId)

    const isOnline = onlineUsers.includes(id)

    return (
        <div className="h-20 border-b border-zinc-200 dark:border-zinc-800 shadow-sm shadow-zinc-100/50 dark:shadow-none bg-white dark:bg-zinc-900 px-4 lg:px-6 flex items-center justify-between transition-colors duration-200">

            <div className="flex items-center gap-3">

                <button
                    onClick={() => {
                        setChatId(null)
                        setReceiverId(null)
                    }}
                    className="md:hidden w-10 h-10 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition-all cursor-pointer"
                >
                    <ArrowLeft size={22} />
                </button>

                <button
                    onClick={onOpenProfile}
                    className="flex items-center gap-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl px-2 py-2 transition-all cursor-pointer"
                >

                    {avatar ? (
                        <img
                            src={avatar}
                            alt={name}
                            className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">

                            <span className="text-lg lg:text-xl font-semibold text-zinc-700 dark:text-zinc-200">
                                {name.charAt(0)}
                            </span>

                        </div>
                    )}

                    <div className="text-left">

                        <h2 className="font-semibold text-base lg:text-lg text-zinc-900 dark:text-white">
                            {name}
                        </h2>

                        {showActiveStatus && (
                            isOnline ? (
                                <p className="text-sm text-green-500">
                                    Online
                                </p>
                            ) : (
                                lastSeen && (
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        {formatMessageTime(lastSeen.toString())}
                                    </p>
                                )
                            )
                        )}

                    </div>

                </button>

            </div>
        </div>
    )
}