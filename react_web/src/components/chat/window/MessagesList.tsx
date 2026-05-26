import useAuthStore from "../../../store/authStore"
import useChatAndMessageStore from "../../../store/chatAndMessageStore"
import MessageBubble from "./MessageBubble"
import { useEffect, useRef } from "react"

export default function MessagesList() {

  const messages = useChatAndMessageStore((s) => s.messages)

  const gettingMessages = useChatAndMessageStore(
    (s) => s.gettingMessages
  )

  const user = useAuthStore((s) => s.user)
  const bottomRef = useRef(null)

  useEffect(() => {
    const timeout = setTimeout(() => {

      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      })
    }, 100)

    return () => clearTimeout(timeout)
  }, [messages])


  if (gettingMessages) {
    return (
      <div className="flex-1 px-3 py-4 lg:px-6 lg:py-6 space-y-3 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="w-52 h-14 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"
          />
        ))}

      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">

        <div className="text-center">

          <h2 className="text-2xl lg:text-3xl font-semibold text-zinc-700 dark:text-white">
            Start Conversation
          </h2>

          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Send your first message
          </p>

        </div>

      </div>
    )
  }

  const orderedMessages =
    [...messages].reverse()

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 lg:px-6 lg:py-6 space-y-3 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      {orderedMessages
        .map((message) => {
          const isMine =
            message.sender?._id === user.id

          return (
            <MessageBubble
              key={message._id}
              message={message}
              isMine={isMine}
            />
          )
        })}

      <div ref={bottomRef} />

    </div>
  )
}