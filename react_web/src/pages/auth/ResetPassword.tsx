import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sendPassword } from '../../schemas/schema'
import authStore from '../../store/authStore'
import { Moon, Sun } from "lucide-react"
import useThemeStore from "../../store/useThemeStore"
import { useNavigate } from 'react-router-dom'


type ResetPasswordFormData = z.infer<typeof sendPassword>

export default function ResetPassword() {

  const navigate = useNavigate()

  const mode = useThemeStore((s) => s.mode)
  const toggleMode = useThemeStore((s) => s.toggleMode)

  const resetPasswordSubmit = authStore((s) => s.resetPasswordSubmit)
  const isVerifyingPassword = authStore((s) => s.isVerifyingPassword)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(sendPassword)
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    await resetPasswordSubmit(data, navigate)
  }

  return (

    <div className='h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950 flex justify-center items-start md:items-center px-4 py-6 transition-colors duration-200'>

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className='w-full max-w-md rounded-[32px] border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl shadow-zinc-200/20 dark:shadow-black/20 p-6 lg:p-8 flex flex-col gap-6 transition-colors duration-200'
      >

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

        <div className='flex justify-center mb-1'>
          <img
            src='/logo.png'
            alt='Logo'
            className='w-16 h-16 object-contain'
          />
        </div>

        <div className='text-center'>
          <h1 className='text-3xl font-bold text-zinc-900 dark:text-white'>
            Reset Password
          </h1>

          <p className='text-zinc-500 dark:text-zinc-400 mt-2'>
            Enter your new password
          </p>
        </div>

        <div className='flex flex-col gap-2'>
          <label
            className='text-sm font-medium text-zinc-700 dark:text-zinc-300'
            htmlFor='password'>
            New Password
          </label>

          <input
            id='password'
            type='password'
            placeholder='Enter new password'
            {...register('password')}
            className='w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 transition-colors duration-200'
          />

          {errors.password && (
            <p className='text-red-500 dark:text-red-400 text-sm'>
              {errors.password.message}
            </p>
          )}
        </div>

        <div className='flex flex-col gap-2'>
          <label
            className='text-sm font-medium text-zinc-700 dark:text-zinc-300'
            htmlFor='confirmPassword'>
            Confirm Password
          </label>

          <input
            id='confirmPassword'
            type='password'
            placeholder='Confirm password'
            {...register('confirmPassword')}
            className='w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 transition-colors duration-200'
          />

          {errors.confirmPassword && (
            <p className='text-red-500 dark:text-red-400 text-sm'>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          disabled={isVerifyingPassword}
          type='submit'
          className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50'
        >
          {isVerifyingPassword ? 'Updating...' : 'Update Password'}
        </button>

      </form>

    </div>
  )
}