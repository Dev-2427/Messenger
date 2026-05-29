import { X } from "lucide-react"
import type { Media } from "../../../helpers/types"

interface MediaPreviewModalProps {
    media: Media | null,
    onClose: () => void
}

export default function MediaPreviewModal({ media, onClose }: MediaPreviewModalProps) {

    if (!media) return null

    return (
        <div
            className="fixed inset-0 bg-black/80 z-100 flex items-center justify-center p-6"
            onClick={onClose}
        >

            {/* Close */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white cursor-pointer"
            >
                <X size={32} />
            </button>

            {/* Prevent Close */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="max-w-6xl max-h-full"
            >

                {/* Image */}
                {media.type === "image" && (
                    <img
                        src={media.url}
                        alt=""
                        className="max-h-[90vh] rounded-2xl"
                    />
                )}

                {/* Video */}
                {media.type === "video" && (
                    <video
                        controls
                        autoPlay
                        className="max-h-[90vh] rounded-2xl"
                    >
                        <source src={media.url} />
                    </video>
                )}

            </div>

        </div>
    )
}