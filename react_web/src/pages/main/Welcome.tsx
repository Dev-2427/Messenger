import { useNavigate } from "react-router-dom"
import { FaUserLarge } from "react-icons/fa6"
import { MdCloudUpload } from "react-icons/md"
import { LoaderCircle } from "lucide-react"

import useUpdateProfile from "../../store/updateProfileStore"
import useAuthStore from "../../store/authStore"

export default function Welcome() {

  const navigate = useNavigate()

  const localFile =
    useUpdateProfile((s) => s.localFile)

  const pickAvatar =
    useUpdateProfile((s) => s.pickAvatar)

  const isUploading =
    useUpdateProfile((s) => s.isUploading)

  const uploadAvatar =
    useUpdateProfile((s) => s.uploadAvatar)

  const avatar =
    useAuthStore((s) => s.user.avatar)

  const completeAvatarSetup =
    useAuthStore((s) => s.completeAvatarSetup)

  return (

    <div className="h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950 px-4 py-6 flex items-start md:items-center justify-center transition-colors duration-200">

      <div className="w-full max-w-md">

        {/* Card */}
        <div className="rounded-[32px] border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl shadow-zinc-200/20 dark:shadow-black/20 p-6 lg:p-8 transition-colors duration-200">

          <div className="flex justify-center mb-6">

            <img
              src="/logo.png"
              alt="Logo"
              className="w-16 h-16 object-contain"
            />

          </div>

          {/* Title */}
          <div className="text-center">

            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">

              Setup your avatar

            </h1>

            <p className="text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">

              Add a profile picture so people
              can recognize you easily.

            </p>

          </div>

          {/* Avatar Preview */}
          <div className="mt-10 flex justify-center">

            <div className="w-40 h-40 lg:w-44 lg:h-44 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-lg shadow-zinc-200/30 dark:shadow-black/20 transition-all duration-200 hover:scale-[1.01]">

              {localFile?.uri ? (

                <img
                  src={localFile.uri}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />

              ) : avatar ? (

                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />

              ) : (

                <FaUserLarge
                  size={64}
                  className="text-zinc-400 dark:text-zinc-500"
                />

              )}

            </div>

          </div>

          {/* Actions */}
          <div className="mt-10 flex flex-col gap-4">

            {/* Hidden Input */}
            <input
              id="avatar-input"
              hidden
              type="file"
              accept="image/*"
              onChange={pickAvatar}
            />

            {/* Choose Button */}
            <label
              htmlFor="avatar-input"
              className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 transition-colors duration-200 ${isUploading
                ? "bg-zinc-300 dark:bg-zinc-700 pointer-events-none"
                : "bg-zinc-900 dark:bg-zinc-200 hover:opacity-90 cursor-pointer"
                }`}
            >

              <span className="text-white dark:text-zinc-900 font-semibold text-base lg:text-lg">

                {localFile
                  ? "Choose another"
                  : "Choose from gallery"}

              </span>

              <MdCloudUpload
                size={24}
                className="shrink-0 text-white dark:text-zinc-900" />

            </label>

            {/* Upload Button */}
            {localFile && (

              <button
                disabled={isUploading}

                onClick={() =>
                  uploadAvatar()
                }

                className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 transition-colors duration-200 ${isUploading
                  ? "bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed"
                  : "bg-zinc-800 dark:bg-zinc-100 hover:opacity-90 cursor-pointer"
                  }`}
              >

                {isUploading ? (

                  <LoaderCircle
                    size={26}
                    className="animate-spin text-white dark:text-zinc-900"
                  />

                ) : (

                  <span className="text-white dark:text-zinc-900 font-semibold text-base lg:text-lg">

                    Upload avatar

                  </span>

                )}

              </button>
            )}

          </div>

          {/* Continue / Skip */}
          <button
            disabled={isUploading}

            onClick={() => {
              completeAvatarSetup()
              navigate("/", {
                replace: true
              })
            }}

            className={`w-full mt-8 text-base lg:text-lg font-medium transition-colors duration-200 ${isUploading
              ? "text-zinc-400 cursor-not-allowed"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              }`}
          >

            {avatar
              ? "Continue"
              : "Skip for now"}

          </button>

        </div>

      </div>

    </div>
  )
}