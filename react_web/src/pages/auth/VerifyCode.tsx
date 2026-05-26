import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { verifyCodeSchema } from '../../schemas/schema'
import authStore from '../../store/authStore'
import { useNavigate, useParams } from 'react-router-dom'
import { Moon, Sun } from "lucide-react"
import useThemeStore from "../../store/useThemeStore"

type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>

export default function VerifyCode() {

  const navigate = useNavigate()
  const params = useParams()

  const mode = useThemeStore((s) => s.mode)
  const toggleMode = useThemeStore((s) => s.toggleMode)

  const verifyCode = authStore((s) => s.verifyCode)
  const isVerifyingCode = authStore((s) => s.isVerifyingCode)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<VerifyCodeFormData>({
    resolver: zodResolver(verifyCodeSchema)
  })

  const onSubmit = async (data: VerifyCodeFormData) => {
    await verifyCode(data, params.userId, navigate)
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
            Verify OTP
          </h1>

          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Enter the 6 digit verification code
          </p>
        </div>

        <div className='flex flex-col gap-2'>

          <label
            htmlFor='code'
            className='text-sm font-medium text-zinc-700 dark:text-zinc-300'
          >
            Verification Code
          </label>

          <input
            id='code'
            type='text'
            maxLength={6}
            placeholder='OTP'
            {...register('code')}
            className='w-full h-14 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 text-center text-lg tracking-[0.45em] font-semibold text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 transition-colors duration-200'
          />

          {errors.code && (
            <p className='text-red-500 dark:text-red-400 text-sm'>
              {errors.code.message}
            </p>
          )}

        </div>

        <button
          disabled={isVerifyingCode}
          type='submit'
          className='w-full h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-200 text-white dark:text-zinc-900 font-semibold transition-colors duration-200 hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isVerifyingCode ? 'Verifying...' : 'Verify Code'}
        </button>

      </form>

    </div>
  )
}