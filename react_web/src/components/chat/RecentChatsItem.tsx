import { Check, CheckCheck } from "lucide-react"
import { formatMessageTime } from "../../helpers/formatMessageTime"
import type { Chats } from "../../helpers/types"
import useAuthStore from "../../store/authStore"
import useChatAndMessageStore from "../../store/chatAndMessageStore"
import { useLongPress } from "use-long-press"

function RecentChatsItem({ chat }: { chat: Chats }) {

    const isSelectingChats = useChatAndMessageStore((s) => s.isSelectingChats)
    const chatIdsToDelete = useChatAndMessageStore((s) => s.chatIdsToDelete)
    const setChatId = useChatAndMessageStore((s) => s.setChatId)
    const putChatIdToDeleteArray = useChatAndMessageStore((s) => s.putChatIdToDeleteArray)
    const removeChatIdToDeleteArray = useChatAndMessageStore((s) => s.removeChatIdToDeleteArray)
    const markMessageAsRead = useChatAndMessageStore((s) => s.markMessageAsRead)
    const setSelectingChatsTrue = useChatAndMessageStore((s) => s.setSelectingChatsTrue)
    const setReceiverId = useChatAndMessageStore((s) => s.setReceiverId)
    const chatId = useChatAndMessageStore((s) => s.chatId)
    const user = useAuthStore((s) => s.user)

    const unread =
        chat.lastMessage.senderId !== user.id &&
        chat.lastMessage.status !== "read"

    const longPressHandler = useLongPress(() => {
        setSelectingChatsTrue()
        putChatIdToDeleteArray(chat._id)
    }, { threshold: 500 })

    return (
        <button
            onClick={() => {

                if (isSelectingChats) {
                    if (chatIdsToDelete.includes(chat._id)) {
                        removeChatIdToDeleteArray(chat._id)
                    } else {
                        putChatIdToDeleteArray(chat._id)
                    }

                    return
                }

                setChatId(chat._id)
                setReceiverId(null)
                if (
                    chat.lastMessage.senderId !== user.id
                ) {
                    markMessageAsRead(chat._id)
                }
            }}
            {...longPressHandler()}
            onContextMenu={(e) => {
                e.preventDefault()
                setSelectingChatsTrue()
                putChatIdToDeleteArray(chat._id)
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-3xl transition-colors duration-200 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800  cursor-pointer ${chatId === chat._id
                ? "bg-zinc-100 dark:bg-zinc-800"
                : ""
                }`}
        >
            {isSelectingChats && (
                <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${chatIdsToDelete.includes(chat._id)
                        ? "bg-blue-500 border-blue-500 scale-110"
                        : "border-zinc-300 dark:border-zinc-600"
                        }`}
                >

                    {chatIdsToDelete.includes(chat._id) && (
                        <Check
                            size={14}
                            className="text-white"
                        />
                    )}

                </div>
            )}
            {chat.chatAvatar ? (
                <img
                    src={chat.chatAvatar}
                    alt={chat.chatName}
                    className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover"
                />
            ) : (
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                    <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">
                        {chat.chatName.charAt(0)}
                    </span>

                </div>
            )}

            <div className="flex-1 min-w-0">

                <div className="flex items-center justify-between">

                    <h3 className="font-semibold truncate text-zinc-900 dark:text-white">
                        {chat.chatName}
                    </h3>

                    <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0 ml-3">

                        {formatMessageTime(
                            chat.lastMessage.time
                        )}

                    </span>

                </div>

                <p
                    className={`text-sm truncate mt-1 ${unread
                        ? "text-zinc-900 dark:text-white font-medium"
                        : "text-zinc-500 dark:text-zinc-400"
                        }`}
                >
                    {chat.lastMessage.senderId === user.id && (

                        chat.lastMessage.status === "read"
                            ? (
                                <CheckCheck
                                    size={14}
                                    className="inline mr-1"
                                />
                            )
                            : (
                                <Check
                                    size={14}
                                    className="inline mr-1"
                                />
                            )
                    )}
                    {chat.lastMessage.text || "Media"}
                </p>

            </div>

        </button>
    )
}

export default RecentChatsItem