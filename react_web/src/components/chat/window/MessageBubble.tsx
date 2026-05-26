import { useState } from "react"
import MessageContextMenu from "./MessageContextMenu"
import useChatAndMessageStore from "../../../store/chatAndMessageStore"
import { formatMessageTime } from "../../../helpers/formatMessageTime"
import type { Media, Message } from "../../../helpers/types"
import MediaPreviewModal from "./MediaPreviewModal"
import axios from "axios"
import { useLongPress } from "use-long-press"
import MessageMediaItem from "./MessageMediaItem"

interface TextContextData {
    chatId: string,
    type: "text",
    messageId: string
}

interface MediaContextData {
    chatId: string,
    type: "media",
    messageId: string,
    mediaId: string,
    mediaUrl: string
}

export type ContextData = TextContextData | MediaContextData

interface MessageBubbleProps {
    message: Message
    isMine: boolean
}

interface MenuPosition {
    x: number
    y: number
}

export default function MessageBubble({
    message,
    isMine,
}: MessageBubbleProps) {

    const deleteMessage = useChatAndMessageStore((s) => s.deleteMessage)
    const setEditableMessageId = useChatAndMessageStore((s) => s.setEditableMessageId)
    const setMessage = useChatAndMessageStore((s) => s.setMessage)

    const [menu, setMenu] = useState<MenuPosition | null>(null)
    const [contextData, setContextData] = useState<ContextData | null>(null)
    const [previewMedia, setPreviewMedia] = useState<Media | null>(null)
    const [downloading, setDownloading] = useState(false)

    function openMenu(x: number, y: number, data: ContextData) {
        setMenu({ x, y })
        setContextData(data)
    }

    const textLongPress = useLongPress((event) => {
        let x = window.innerWidth / 2
        let y = window.innerHeight / 2

        if ("clientX" in event) {
            x = event.clientX
            y = event.clientY
        }
        openMenu(x, y, {
            chatId: message.chatId,
            messageId: message._id,
            type: "text"
        })

    }, { threshold: 500, cancelOnMovement: true })

    return (
        <>
            <div
                className={`flex
                     ${isMine
                        ? "justify-end"
                        : "justify-start"
                    }`}
            >

                <div
                    className={`max-w-[88%] sm:max-w-[75%] lg:max-w-[65%] px-4 py-3 rounded-3xl shadow-sm shadow-zinc-200/50 dark:shadow-none ${isMine
                        ? "bg-zinc-900 dark:bg-zinc-200 text-white dark:text-zinc-900 rounded-br-md"
                        : "bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-white rounded-bl-md"
                        }`}
                >

                    {/* Text */}
                    {/* Media */}
                    {message.media?.length > 0 && (

                        <div
                            className={`grid gap-2 mb-2.5 ${message.media.length === 1
                                ? "grid-cols-1"
                                : "grid-cols-2"
                                }`}
                        >

                            {message.media.map((mediaItem: Media) => (
                                <MessageMediaItem
                                    key={mediaItem._id}
                                    mediaItem={mediaItem}
                                    message={message}
                                    openMenu={openMenu}
                                    setPreviewMedia={setPreviewMedia}
                                />

                            ))}

                        </div>
                    )}

                    {/* Text */}
                    {message.text && (
                        <div className="hover:cursor-pointer"
                            onTouchEnd={(e) => e.preventDefault()}
                            {...textLongPress()}
                            onContextMenu={(e) => {
                                e.preventDefault()

                                setMenu({
                                    x: e.clientX,
                                    y: e.clientY,
                                })

                                setContextData({
                                    chatId: message.chatId,
                                    type: "text",
                                    messageId: message._id,
                                })
                            }}
                        >
                            <p className="wrap-break-word leading-relaxed text-[15px]">
                                {message.text}
                            </p>
                        </div>
                    )}

                    <div
                        className={`flex items-center gap-1 mt-2.5 text-xs ${isMine
                            ? "text-zinc-300 dark:text-zinc-600 justify-end"
                            : "text-zinc-500 dark:text-zinc-400 justify-end"}`}
                    >

                        <span>
                            {formatMessageTime(message.createdAt)}
                        </span>

                    </div>
                </div>
            </div >

            {menu && (
                <MessageContextMenu
                    x={menu.x}
                    y={menu.y}
                    isMine={isMine}

                    type={contextData?.type}

                    onClose={() => setMenu(null)}

                    onCopy={() => {
                        navigator.clipboard.writeText(
                            message.text || ""
                        )

                        setMenu(null)
                    }}

                    onEdit={() => {
                        setEditableMessageId(message._id)
                        setMessage(message.text || "")
                        setMenu(null)
                    }}

                    onDelete={() => {
                        if (!contextData) return
                        deleteMessage(contextData)

                        setMenu(null)
                    }}

                    onDownload={async () => {
                        if (contextData?.type !== 'media') return
                        if (downloading) return

                        try {
                            setDownloading(true)

                            const res = await axios.get(contextData.mediaUrl, { responseType: 'blob' })

                            const blobUrl = window.URL.createObjectURL(res.data)

                            const link = document.createElement("a")

                            link.href = blobUrl

                            link.download = contextData.mediaUrl.split('/').pop() || "media"

                            document.body.appendChild(link)

                            link.click()

                            document.body.removeChild(link)

                            window.URL.revokeObjectURL(blobUrl)

                        } catch (error) {
                            console.error("Failed to download media:", error)
                        } finally {
                            setDownloading(false)
                            setMenu(null)
                        }

                    }}

                    downloading={downloading}
                />
            )
            }

            <MediaPreviewModal
                media={previewMedia}
                onClose={() => setPreviewMedia(null)}
            />
        </>
    )
}