export default function FullScreenLoader() {

    return (

        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center transition-colors duration-200">

            <div className="flex flex-col items-center">

                {/* Logo */}
                <div className="relative">

                    {/* Soft Glow */}
                    <div className="absolute inset-0 blur-3xl bg-zinc-300/30 dark:bg-zinc-700/20 rounded-full scale-150" />

                    {/* Logo */}
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="relative w-20 h-20 object-contain"
                    />

                </div>

                {/* App Name */}
                <h2 className="mt-8 text-2xl font-semibold text-zinc-900 dark:text-white">

                    Messenger

                </h2>

                {/* Subtitle */}
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">

                    Loading your conversations

                </p>

                {/* Progress Bar */}
                <div className="mt-6 w-40 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">

                    <div className="h-full w-1/2 rounded-full bg-zinc-900 dark:bg-zinc-200 animate-loader" />

                </div>

            </div>

        </div>
    )
}