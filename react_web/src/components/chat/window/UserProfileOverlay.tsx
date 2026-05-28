import { X } from "lucide-react"
interface UserProfileOverlayProps {
    profileData: {
        id: string,
        name: string,
        email: string,
        avatar?: string | null,
        lastSeen?: Date | null
    } | null,
    onClose: () => void

}
export default function UserProfileOverlay({
    profileData,
    onClose,
}: UserProfileOverlayProps) {

    if (!profileData) return null

    return (
        <div className="absolute inset-0 z-50 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 backdrop-blur-xl transition-colors duration-200">

            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 lg:px-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-xl transition-colors duration-200">

                <h2 className="text-xl lg:text-2xl font-semibold text-zinc-900 dark:text-white">
                    Profile
                </h2>

                <button
                    onClick={onClose}
                    className="w-11 h-11 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                >
                    <X size={24} className="text-zinc-700 dark:text-zinc-200"
                    />
                </button>

            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto px-5 py-8 lg:px-8 lg:py-10">

                <div className="rounded-[32px] border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-6 lg:p-8">

                    {/* Avatar */}
                    <div className="flex flex-col items-center">

                        {profileData.avatar ? (
                            <img
                                src={profileData.avatar}
                                alt={profileData.name}
                                className="w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">

                                <span className="text-5xl lg:text-6xl font-semibold text-zinc-700 dark:text-zinc-200">
                                    {profileData.name.charAt(0)}
                                </span>

                            </div>
                        )}

                        <h1 className="mt-5 text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-white text-center">
                            {profileData.name}
                        </h1>

                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-center">
                            Messenger
                        </p>

                    </div>

                    {/* Sections */}
                    <div className="mt-10 lg:mt-14 space-y-8">

                        {/* Email */}
                        <div>

                            <p className="text-zinc-400 dark:text-zinc-500 text-sm mb-2">
                                Email
                            </p>

                            <p className="text-lg lg:text-xl text-zinc-900 dark:text-white wrap-break-word">
                                {profileData.email || "No email"}
                            </p>

                        </div>

                        {/* Actions */}
                        <div>

                            <p className="text-zinc-400 dark:text-zinc-500 text-sm mb-4">
                                Actions
                            </p>

                            <div className="space-y-3">

                                <button className="w-full text-left p-4 rounded-2xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors duration-200 cursor-pointer">
                                    Mute Notifications
                                </button>

                                <button className="w-full text-left p-4 rounded-2xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors duration-200 cursor-pointer">
                                    Block User
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </div>
    )
}