import AllUsers from "../../components/chat/AllUsers";
import ChatWindow from "../../components/chat/window/ChatWindow";
import RecentChats from "../../components/chat/RecentChats";
import useChatAndMessageStore from "../../store/chatAndMessageStore"

export default function Home() {

  const chatId = useChatAndMessageStore((s) => s.chatId)
  const receiverId = useChatAndMessageStore((s) => s.receiverId)

  const hasActiveChat = chatId || receiverId

  return (
    <div className="h-full flex bg-zinc-50 dark:bg-zinc-950">

      {/* Left Chat List Section */}
      <section className={` ${hasActiveChat ? "hidden md:flex" : "flex"} w-full md:w-[360px] lg:w-[420px] border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-col transition-colors duration-200
  `}
      >

        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors duration-200">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
            Chats
          </h1>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 outline-none transition-all"
          />
        </div>

        {/* Horizontal Users */}
        <AllUsers />

        {/* Recent Chats */}
        <RecentChats />

      </section>

      {/* Right Chat Window */}
      <div className={`${hasActiveChat ? "flex" : "hidden md:flex"} flex-1`}>
        <ChatWindow />
      </div>

    </div>
  )
}