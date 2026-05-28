import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FcGoogle } from 'react-icons/fc'
import authStore from '../store/authStore'

const useGoogleAuth = () => {
    const { googleAuth } = authStore()
    const navigate = useNavigate()

    const GoogleAuthButton = () => (
        <div className="relative w-full">

            {/* Hidden Google Button */}
            <div className="absolute inset-0 opacity-0">
                <GoogleLogin
                    onSuccess={(res) => {
                        if (!res.credential) return
                        googleAuth(res.credential, navigate)
                    }}
                    onError={() => toast.error('Google login failed')}
                />
            </div>

            {/* Custom Button */}
            <button
                type="button"
                className="w-full h-14 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold flex items-center justify-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200 cursor-pointer"
            >
                <FcGoogle size={22} />
                Continue with Google
            </button>

        </div>
    )

    return { GoogleAuthButton }
}

export default useGoogleAuth