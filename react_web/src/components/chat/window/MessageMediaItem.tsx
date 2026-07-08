import type { Media, Message } from "../../../helpers/types"
import type { ContextData } from "./MessageBubble"
import { useLongPress } from "use-long-press"

interface MessageMediaItemProps {
    mediaItem: Media
    message: Message
    openMenu: (
        x: number,
        y: number,
        data: ContextData
    ) => void
    setPreviewMedia: (
        media: Media | null
    ) => void
}

export default function MessageMediaItem({
    mediaItem,
    message,
    openMenu,
    setPreviewMedia
}: MessageMediaItemProps) {

    const mediaLongPress = useLongPress((event) => {
        let x = window.innerWidth / 2
        let y = window.innerHeight / 2

        if ("clientX" in event) {
            x = event.clientX
            y = event.clientY
        }

        openMenu(
            x, y,
            {
                chatId: message.chatId,
                type: "media",
                mediaId: mediaItem.fileId!,
                messageId: message._id,
                mediaUrl: mediaItem.url
            }
        )

    }, {
        threshold: 500, cancelOnMovement: true
    })

    return (
        <div
            {...mediaLongPress()}
            className="rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900"
        >

            {mediaItem.type === "image" && (
                <div
                    onContextMenu={(e) => {
                        e.preventDefault()

                        openMenu(
                            e.clientX,
                            e.clientY,
                            {
                                chatId: message.chatId,
                                type: "media",
                                mediaId: mediaItem.fileId!,
                                messageId: message._id,
                                mediaUrl: mediaItem.url
                            }
                        )
                    }}
                >

                    <img
                        onClick={() =>
                            setPreviewMedia(mediaItem)
                        }
                        src={mediaItem.url}
                        alt=""
                        className="w-full max-h-[320px] object-cover hover:cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
                    />

                </div>
            )}

            {mediaItem.type === "video" && (
                <div
                    onContextMenu={(e) => {
                        e.preventDefault()

                        openMenu(
                            e.clientX,
                            e.clientY,
                            {
                                chatId: message.chatId,
                                type: "media",
                                mediaId: mediaItem.fileId!,
                                messageId: message._id,
                                mediaUrl: mediaItem.url
                            }
                        )
                    }}
                >

                    <video
                        onClick={() =>
                            setPreviewMedia(mediaItem)
                        }
                        controls
                        className="w-full max-h-[320px] object-cover hover:cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
                    >

                        <source src={mediaItem.url} />

                    </video>

                </div>
            )}

        </div>
    )
}
