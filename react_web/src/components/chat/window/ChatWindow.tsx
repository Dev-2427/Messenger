import { useEffect, useState } from "react"

import useChatAndMessageStore from "../../../store/chatAndMessageStore"
import MessageInput from "../MessageInput"
import ChatHeader from "../ChatHeader"
import getUsersStore from "../../../store/getUsersStore"
import MessagesList from "./MessagesList"
import UserProfileOverlay from "./UserProfileOverlay"

export default function ChatWindow() {

    const chatId = useChatAndMessageStore((s) => s.chatId)
    const receiverId = useChatAndMessageStore((s) => s.receiverId)

    const chats = useChatAndMessageStore((s) => s.chats)

    const users = getUsersStore((s) => s.users)

    const getMessages = useChatAndMessageStore((s) => s.getMessages)

    const gettingMessages = useChatAndMessageStore(
        (s) => s.gettingMessages
    )
    const [showProfile, setShowProfile] =
        useState<boolean>(false)

    useEffect(() => {

        if (chatId || receiverId) {
            getMessages()
        }

    }, [chatId, receiverId])

    if (!chatId && !receiverId) {
        return (
            <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-6 transition-colors duration-200">

                <div className="text-center">

                    <h2 className="text-2xl lg:text-3xl font-semibold text-zinc-700 dark:text-white">
                        Welcome
                    </h2>

                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                        Select a conversation
                    </p>

                </div>

            </div>
        )
    }

    if (gettingMessages) {
        return (
            <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
    
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
    
                    <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
    
                    <div className="flex-1">
    
                        <div className="w-32 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
    
                        <div className="w-20 h-3 rounded-full bg-zinc-100 dark:bg-zinc-900 mt-2 animate-pulse" />
    
                    </div>
    
                </div>
    
                {/* Messages */}
                <div className="flex-1 px-4 py-5 space-y-4 overflow-hidden">
    
                    {/* Receiver */}
                    <div className="flex justify-start">
    
                        <div className="w-52 h-16 rounded-3xl rounded-bl-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
    
                    </div>
    
                    {/* Sender */}
                    <div className="flex justify-end">
    
                        <div className="w-40 h-14 rounded-3xl rounded-br-md bg-zinc-300 dark:bg-zinc-700 animate-pulse" />
    
                    </div>
    
                    {/* Receiver */}
                    <div className="flex justify-start">
    
                        <div className="w-64 h-20 rounded-3xl rounded-bl-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
    
                    </div>
    
                    {/* Sender */}
                    <div className="flex justify-end">
    
                        <div className="w-32 h-12 rounded-3xl rounded-br-md bg-zinc-300 dark:bg-zinc-700 animate-pulse" />
    
                    </div>
    
                </div>
    
                {/* Input */}
                <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
    
                    <div className="h-14 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
    
                </div>
    
            </div>
        )
    }


    const activeChat = chats.find(
        (chat) => chat._id === chatId
    )

    const activeUser = users.find(
        (user) => user._id === receiverId
    )

    const profileData = activeChat
        ? {
            id: activeChat.otherUser._id,
            name: activeChat.chatName,
            email: activeChat.otherUser.email,
            avatar: activeChat.chatAvatar,
            lastSeen: activeChat.otherUser.lastSeen
        }
        : activeUser
            ? {
                id: activeUser._id,
                name: activeUser.fullName,
                email: activeUser.email,
                avatar: activeUser.avatar,
                lastSeen: activeUser.lastSeen
            }
            : null
    return (
        <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 flex flex-col relative transition-colors duration-200">
            {/* Chat Header */}
            {profileData && (
                <ChatHeader
                    id={profileData.id}
                    name={profileData.name}
                    email={profileData.email}
                    avatar={profileData.avatar}
                    lastSeen={profileData.lastSeen}
                    onOpenProfile={() => setShowProfile(true)}
                />
            )}

            {/* Messages */}
            <MessagesList />

            {/* Input */}
            <MessageInput />

            {showProfile && (
                <UserProfileOverlay
                    profileData={profileData}
                    onClose={() =>
                        setShowProfile(false)
                    }
                />
            )}
        </div>
    )
}