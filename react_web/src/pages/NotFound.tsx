import { useNavigate } from 'react-router-dom'

export default function NotFound() {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-6 transition-colors duration-200">

            <div className="max-w-md w-full text-center rounded-[32px] border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 lg:p-10 transition-colors duration-200">

                {/* 404 */}
                <h1 className="text-8xl font-bold text-zinc-900 dark:text-white">

                    404

                </h1>

                {/* Title */}
                <h2 className="mt-6 text-3xl font-semibold text-zinc-800 dark:text-white">

                    Page not found

                </h2>

                {/* Description */}
                <p className="mt-4 text-zinc-500 dark:text-zinc-400 leading-relaxed">

                    The page you’re looking for
                    doesn’t exist or may have
                    been moved.

                </p>

                {/* Button */}
                <button
                    onClick={() =>
                        navigate("/", {
                            replace: true
                        })
                    }
                    className="mt-10 h-14 px-8 rounded-2xl bg-zinc-900 dark:bg-zinc-200 text-white dark:text-zinc-900 font-semibold text-lg hover:opacity-90 transition-colors duration-200 cursor-pointer"
                >

                    Go Home

                </button>

            </div>

        </div>
    )
}
