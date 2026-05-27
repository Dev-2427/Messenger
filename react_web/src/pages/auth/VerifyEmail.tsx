import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { Moon, Sun } from "lucide-react"

import useThemeStore from "../../store/useThemeStore"
import useAuthStore from "../../store/authStore"
import { sendEmail } from "../../schemas/schema"

type ForgotPasswordFormData =
    z.infer<typeof sendEmail>

export default function VerifyEmail() {

    const navigate = useNavigate()

    const mode = useThemeStore((s) => s.mode)

    const toggleMode = useThemeStore((s) => s.toggleMode)

    const verifyEmailSubmit = useAuthStore((s) => s.verifyEmailSubmit)

    const isVerifyingEmail = useAuthStore((s) => s.isVerifyingEmail)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ForgotPasswordFormData>({
        resolver:
            zodResolver(
                sendEmail
            )
    })

    async function onSubmit(
        data: ForgotPasswordFormData
    ) {

        await verifyEmailSubmit(
            data,
            navigate
        )
    }

    return (

        <div className="h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950 flex justify-center items-start md:items-center px-4 py-6 transition-colors duration-200">

            <form
                noValidate
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-md rounded-[32px] border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl shadow-zinc-200/20 dark:shadow-black/20 p-6 lg:p-8 flex flex-col gap-6 transition-colors duration-200"
            >

                {/* Theme Toggle */}
                <div className="flex justify-end">

                    <button
                        type="button"
                        onClick={toggleMode}
                        className="w-11 h-11 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200 cursor-pointer"
                    >

                        {mode === "dark"
                            ? <Sun size={20} />
                            : <Moon size={20} />
                        }

                    </button>

                </div>

                {/* Logo */}
                <div className="flex justify-center mb-1">

                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="w-16 h-16 object-contain"
                    />

                </div>

                {/* Heading */}
                <div className="text-center">

                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                        Verify Email
                    </h1>

                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                        Enter your email and we’ll
                        send you a verification code
                        to reset your password.
                    </p>

                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">

                    <label
                        htmlFor="email"
                        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                    >
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        {...register("email")}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 transition-colors duration-200"
                    />

                    {errors.email && (
                        <p className="text-sm text-red-500 dark:text-red-400">
                            {errors.email.message}
                        </p>
                    )}

                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isVerifyingEmail}
                    className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-200 text-white dark:text-zinc-900 font-semibold transition-colors duration-200 hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >

                    {isVerifyingEmail
                        ? "Sending..."
                        : "Send Verification Code"}

                </button>

                {/* Back */}
                <Link
                    to="/signin"
                    className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200 text-center underline underline-offset-4"
                >
                    Back to signin
                </Link>

            </form>

        </div>
    )
}