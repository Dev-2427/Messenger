import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { signUpSchema } from '../../schemas/schema'
import authStore from '../../store/authStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Moon, Sun } from "lucide-react"
import useThemeStore from "../../store/useThemeStore"

type SignupFormData = z.infer<typeof signUpSchema>

export default function Signup() {

    const mode = useThemeStore((s) => s.mode)
    const toggleMode = useThemeStore((s) => s.toggleMode)

    const signup = authStore((s) => s.signUp)
    const isSigningUp = authStore((s) => s.isSigningUp)

    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({ resolver: zodResolver(signUpSchema) })

    const onSubmit = async (data: SignupFormData) => {
        await signup(data, navigate)
    }

    return (

        <div className='relative h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950 flex justify-center items-start md:items-center px-4 py-6 transition-colors duration-200'>

            <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className='w-full max-w-md rounded-[32px] border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 shadow-xl shadow-zinc-200/20 dark:shadow-black/20 backdrop-blur-xl p-6 lg:p-8 flex flex-col gap-6 transition-colors duration-200'
            >

                <div className="absolute top-5 right-5">

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

                <div className='flex justify-center mb-1'>
                    <img
                        src='/logo.png'
                        alt='Logo'
                        className='w-16 h-16 object-contain'
                    />
                </div>

                <div className='text-center'>
                    <h1 className='text-3xl font-bold text-zinc-900 dark:text-white'>
                        Create Account
                    </h1>

                    <p className='text-zinc-500 dark:text-zinc-400 mt-2'>
                        Signup to continue
                    </p>
                </div>

                <div className='flex flex-col gap-2'>
                    <label
                        className='text-sm font-medium text-zinc-700 dark:text-zinc-300'
                        htmlFor='fullName'>
                        Full Name
                    </label>

                    <input
                        id='fullName'
                        placeholder='Enter your full name'
                        {...register('fullName')}
                        type='text'
                        className='w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 transition-colors duration-200'
                    />

                    {errors.fullName && (
                        <p className='text-red-500 dark:text-red-400 text-sm'>{errors.fullName.message}</p>
                    )}
                </div>

                <div className='flex flex-col gap-2'>

                    <label
                        htmlFor='email'
                        className='text-sm font-medium text-zinc-700 dark:text-zinc-300'
                    >
                        Email
                    </label>

                    <input
                        id='email'
                        type='email'
                        {...register('email')}
                        placeholder='Enter your email'
                        className='w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 transition-colors duration-200'
                    />

                    {errors.email && (
                        <p className='text-sm text-red-500 dark:text-red-400'>{errors.email.message}</p>
                    )}

                </div>

                <div className='flex flex-col gap-2'>

                    <label
                        htmlFor='password'
                        className='text-sm font-medium text-zinc-700 dark:text-zinc-300'                    >
                        Password
                    </label>

                    <input
                        id='password'
                        type='password'
                        {...register('password')}
                        placeholder='Enter your password'
                        className='w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 transition-colors duration-200'
                    />

                    {errors.password && (
                        <p className='text-red-500 dark:text-red-400 text-sm'>{errors.password.message}</p>
                    )}

                </div>

                <button
                    disabled={isSigningUp}
                    type='submit'
                    className='w-full h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-200 text-white dark:text-zinc-900 font-semibold transition-colors duration-200 hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    {isSigningUp ? 'Creating...' : 'Signup'}
                </button>

                <Link to={'/signin'} className='text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200 text-center underline underline-offset-4'>Already have an account?</Link>
            </form>


        </div>

    )
}