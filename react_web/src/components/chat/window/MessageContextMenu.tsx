import { Copy, Pencil, Trash2, Download } from "lucide-react"

export default function MessageContextMenu({
    x,
    y,
    isMine,
    onClose,
    onDelete,
    onCopy,
    onEdit,
    type,
    onDownload,
    downloading
}) {

    const menuWidth = 192
    const menuHeight = 220

    const safeX =
        window.innerWidth - x < menuWidth
            ? x - menuWidth
            : x

    const safeY =
        window.innerHeight - y < menuHeight
            ? y - menuHeight
            : y

    return (
        <div
            className="fixed inset-0 z-50"
            onClick={onClose}
        >

            <div
                className="absolute z-50 w-48 overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl shadow-zinc-200/40 dark:shadow-black/30 py-2 backdrop-blur-xl transition-colors duration-200"
                style={{
                    top: safeY,
                    left: safeX,
                }}
                onClick={(e) => e.stopPropagation()}
            >

                {type === "text" && (
                    <>
                        <button
                            onClick={onCopy}
                            className="w-full px-4 py-3 flex items-center gap-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                            <Copy size={16} />

                            <span>
                                Copy
                            </span>
                        </button>
                    </>
                )}

                {isMine && type === 'text' && (
                    <button
                        onClick={onEdit}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        <Pencil size={16} />

                        <span>
                            Edit
                        </span>
                    </button>

                )}

                {isMine && (
                    <button
                        onClick={onDelete}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                        <Trash2 size={16} />

                        <span>
                            Delete
                        </span>
                    </button>
                )
                }

                {type === 'media' && (
                    <button
                        onClick={onDownload}
                        disabled={downloading}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={16} />

                        <span>
                            {downloading
                                ? "Downloading..."
                                : "Download"}
                        </span>
                    </button>
                )}

            </div>

        </div>
    )
}