import { ImagePlus, Loader2, Send, X } from "lucide-react"

import useChatAndMessageStore from "../../store/chatAndMessageStore"

export default function MessageInput() {

    const text = useChatAndMessageStore((s) => s.text)

    const files = useChatAndMessageStore((s) => s.files)

    const setMessage = useChatAndMessageStore((s) => s.setMessage)

    const removeFile = useChatAndMessageStore((s) => s.removeFile)

    const sendMessage = useChatAndMessageStore((s) => s.sendMessage)

    const sendingMessage = useChatAndMessageStore(
        (s) => s.sendingMessage
    )

    const deletingMessage = useChatAndMessageStore(
        (s) => s.deletingMessage
    )

    const pickMedia = useChatAndMessageStore(
        (s) => s.pickMedia
    )
    const editableMessageId =
        useChatAndMessageStore(
            (s) => s.editableMessageId
        )

    const editMessage =
        useChatAndMessageStore(
            (s) => s.editMessage
        )

    const setEditableMessageId =
        useChatAndMessageStore(
            (s) => s.setEditableMessageId
        )

    const disabled =
        (!text.trim() && files.length === 0) ||
        sendingMessage ||
        deletingMessage

    return (
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-3 lg:px-4 lg:py-4 transition-colors duration-200">

            {/* File Preview */}
            {files.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">

                    {files.map((file) => (

                        <div
                            key={file.id}
                            className="relative"
                        >

                            <img
                                src={file.uri}
                                alt=""
                                className="w-20 h-20 rounded-2xl object-cover"
                            />

                            <button
                                onClick={() => removeFile(file.id)}
                                className="absolute -top-2 -right-2 bg-zinc-900 dark:bg-zinc-700 text-white shadow-md rounded-full p-1 cursor-pointer"
                            >
                                <X size={14} />
                            </button>

                        </div>

                    ))}

                </div>
            )}

            {/* Input Area */}
            {editableMessageId && (
                <div className="mb-2 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-300">

                    <span>
                        Editing message
                    </span>

                    <button
                        onClick={() => {
                            setEditableMessageId(null)
                            setMessage("")
                        }}
                        className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>

                </div>
            )}
            <div className="flex items-end gap-2 lg:gap-3">

                {/* Upload */}
                <label className="cursor-pointer w-11 h-11 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors shrink-0">

                    <ImagePlus
                        size={24}
                        className="text-zinc-600 dark:text-zinc-300"
                    />

                    <input
                        type="file"
                        multiple
                        hidden
                        accept="image/*,video/mp4"
                        onChange={pickMedia}
                    />

                </label>

                {/* Textarea */}
                <textarea
                    value={text}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 resize-none rounded-3xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 max-h-40 min-h-[48px] transition-colors duration-200"
                />

                {/* Send */}
                <button
                    disabled={disabled}
                    onClick={() => {
                        if (editableMessageId) {

                            editMessage(
                                text,
                                editableMessageId
                            )
                            return
                        }
                        sendMessage()
                    }}
                    className={`w-12 h-12 flex items-center justify-center shrink-0 rounded-2xl transition-all ${disabled
                        ? "bg-zinc-200 dark:bg-zinc-800 cursor-not-allowed"
                        : "bg-zinc-900 dark:bg-white hover:opacity-90 cursor-pointer"
                        }`}
                >

                    {sendingMessage ? (
                        <Loader2
                            size={20}
                            className="animate-spin text-white dark:text-zinc-900"
                        />
                    ) : (
                        <Send
                            size={20}
                            className="text-white dark:text-zinc-900"
                        />
                    )
                    }


                </button>

            </div>

        </div>
    )
}