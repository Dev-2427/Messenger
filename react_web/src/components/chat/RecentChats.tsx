import { useEffect } from "react"
import useChatAndMessageStore from "../../store/chatAndMessageStore"
import RecentChatsItem from "./RecentChatsItem"


export default function RecentChats({ search }: { search: string }) {

    const searchTerm = search.trim().toLowerCase()

    const isSelectingChats = useChatAndMessageStore((s) => s.isSelectingChats)
    const chats = useChatAndMessageStore((s) => s.chats)
    const gettingChats = useChatAndMessageStore((s) => s.gettingChats)
    const getRecentChats = useChatAndMessageStore((s) => s.getRecentChats)
    const setSelectingChatsFalse = useChatAndMessageStore((s) => s.setSelectingChatsFalse)
    const chatIdsToDelete = useChatAndMessageStore((s) => s.chatIdsToDelete)
    const handleDeleteChats = useChatAndMessageStore((s) => s.handleDeleteChats)

    useEffect(() => {
        getRecentChats()
    }, [])

    if (gettingChats) {
        return (
            <div className="p-4 space-y-4">

                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="flex items-center gap-4 animate-pulse"
                    >

                        <div className="w-14 h-14 rounded-full bg-zinc-200 dark:bg-zinc-800" />

                        <div className="flex-1">

                            <div className="w-32 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />

                            <div className="w-24 h-3 bg-zinc-100 dark:bg-zinc-900 rounded mt-2" />

                        </div>

                    </div>
                ))}

            </div>
        )
    }

    if (chats.length === 0) {
        return (

            <div className="flex-1 flex items-center justify-center p-8">

                <div className="text-center">

                    <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 mx-auto flex items-center justify-center">

                        <span className="text-4xl">
                            💬
                        </span>

                    </div>

                    <h2 className="text-xl font-semibold text-zinc-700 dark:text-white mt-6">
                        No conversations yet
                    </h2>

                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs">
                        Start chatting with people from the community section.
                    </p>

                </div>

            </div>
        )
    }

    return (
        <>
            {isSelectingChats && (

                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors duration-200">

                    <p className="font-medium text-zinc-900 dark:text-white">
                        {chatIdsToDelete.length}
                        {" "}
                        selected
                    </p>

                    <div className="flex gap-3">

                        <button className="cursor-pointer text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors duration-200"
                            onClick={() =>
                                setSelectingChatsFalse()
                            }
                        >
                            Cancel
                        </button>

                        <button
                            onClick={() =>
                                handleDeleteChats()
                            }
                            className="text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer font-medium"
                        >
                            Delete
                        </button>

                    </div>

                </div>
            )}

            <div className="flex-1 overflow-y-auto px-2 py-2">
                {chats
                    .filter((chat) =>
                        !searchTerm ||
                        chat.chatName.toLowerCase().includes(searchTerm) ||
                        (chat.lastMessage.text || "").toLowerCase().includes(searchTerm)
                    )
                    .map((chat) => (
                        <RecentChatsItem key={chat._id} chat={chat} />
                    ))}
                {searchTerm && !chats.some((chat) =>
                    chat.chatName.toLowerCase().includes(searchTerm) ||
                    (chat.lastMessage.text || "").toLowerCase().includes(searchTerm)
                ) && (
                        <p className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                            No chats found
                        </p>
                    )}

            </div>
        </>
    )
}