import { useNavigate } from "react-router-dom"
import authStore from "../../store/authStore"
import useUpdateProfile from "../../store/updateProfileStore"
import useThemeStore from "../../store/useThemeStore"
import { useState } from "react"
import { Camera, Trash2, LoaderCircle } from "lucide-react"

export default function Settings() {

  const user = authStore((s) => s.user)
  const signOut = authStore((s) => s.signOut)
  const isLoggingout = authStore((s) => s.isLoggingout)
  const deleteUser = authStore((s) => s.deleteUser)
  const deletingUser = authStore((s) => s.deletingUser)

  const showActiveStatus = useUpdateProfile((s) => s.showActiveStatus)
  const changeAvatar = useUpdateProfile((s) => s.changeAvatar)
  const changingAvatar = useUpdateProfile((s) => s.changingAvatar)
  const isDeletingAvatar = useUpdateProfile((s) => s.isDeletingAvatar)
  const toggleActiveStatus = useUpdateProfile((s) => s.toggleActiveStatus)
  const isUsernameEditable = useUpdateProfile((s) => s.isUsernameEditable)
  const setUsernameEditableTrue = useUpdateProfile((s) => s.setUsernameEditableTrue)
  const setUsernameEditableFalse = useUpdateProfile((s) => s.setUsernameEditableFalse)
  const changingUsername = useUpdateProfile((s) => s.changingUsername)
  const changeUsername = useUpdateProfile((s) => s.changeUsername)
  const deleteAvatar = useUpdateProfile((s) => s.deleteAvatar)

  const mode = useThemeStore((s) => s.mode)
  const toggleMode = useThemeStore((s) => s.toggleMode)

  const navigate = useNavigate()
  const [username, setUsername] = useState(user.name || "")

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)

  const avatarLoading = changingAvatar || isDeletingAvatar

  return (
    <div className="h-full overflow-y-auto scroll-smooth bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-6 lg:px-8 lg:py-8">

        {/* Page Title */}
        <div className="mb-10">

          <h1 className="text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-white">
            Settings
          </h1>

          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Manage your account settings
          </p>

        </div>

        {/* Profile Card */}
        <div className="bg-white/80 dark:bg-zinc-900/80 rounded-[32px] border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl transition-colors duration-200 p-8">

          <div className="flex flex-col items-center">

            {/* Avatar */}
            <div className="w-32 h-32 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">

              <button
                onClick={() =>
                  setShowAvatarModal(true)
                }
                className="w-32 h-32 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              >

                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">

                    <span className="text-5xl font-semibold text-zinc-700 dark:text-zinc-200">
                      {user.name?.charAt(0)}
                    </span>

                  </div>
                )}

              </button>
            </div>

            {/* Name */}
            <h2 className="text-2xl lg:text-3xl font-bold mt-5 text-zinc-900 dark:text-white">
              {user.name}
            </h2>

          </div>

        </div>

        {/* General Settings */}
        <div className="mt-8 bg-white/80 dark:bg-zinc-900/80 rounded-[32px] border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl transition-colors duration-200 p-8">

          <h3 className="text-lg lg:text-xl font-semibold text-zinc-900 dark:text-white mb-6">
            General
          </h3>

          <div className="space-y-6">

            {/* Dark Mode */}
            <div className="flex items-center justify-between">

              <div>

                <p className="font-medium text-zinc-900 dark:text-white">
                  Dark Mode
                </p>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Switch app appearance
                </p>

              </div>

              <button
                onClick={() =>
                  toggleMode()
                }
                className={`w-16 h-9 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer ${mode === "dark"
                  ? "bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  }`}
              >

                {mode === "dark"
                  ? "On"
                  : "Off"}

              </button>

            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">

              <div>

                <p className="font-medium text-zinc-900 dark:text-white">
                  Active Status
                </p>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Show when you're online
                </p>

              </div>

              <button
                onClick={() =>
                  toggleActiveStatus()
                }
                className={`w-16 h-9 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer ${showActiveStatus
                  ? "bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  }`}
              >

                {showActiveStatus
                  ? "On"
                  : "Off"}

              </button>

            </div>

            {/* Email */}
            <div className="flex items-center justify-between">

              <div>

                <p className="font-medium text-zinc-900 dark:text-white">
                  Email
                </p>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  {user.email}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Account Settings */}
        <div className="mt-8 bg-white/80 dark:bg-zinc-900/80 rounded-[32px] border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl transition-colors duration-200 p-8">

          <h3 className="text-lg lg:text-xl font-semibold text-zinc-900 dark:text-white mb-6">
            Account Settings
          </h3>

          <div className="space-y-4">

            <div className="p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50">

              <div className="flex items-center justify-between">

                <div>

                  <p className="font-medium text-zinc-900 dark:text-white">
                    Username
                  </p>

                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Change your display name
                  </p>

                </div>

                {!isUsernameEditable && (
                  <button
                    onClick={() =>
                      setUsernameEditableTrue()
                    }
                    className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200 cursor-pointer"
                  >
                    Edit
                  </button>
                )}

              </div>

              {isUsernameEditable && (

                <div className="mt-5 flex flex-col sm:flex-row gap-3">

                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value)
                    }
                    className="flex-1 px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 transition-colors duration-200"
                  />

                  <button
                    onClick={() =>
                      changeUsername({
                        name: username,
                      })
                    }
                    disabled={changingUsername}
                    className="sm:w-auto w-full px-5 py-3 rounded-xl bg-zinc-900 dark:bg-zinc-200 text-white dark:text-zinc-900 hover:opacity-90 transition-colors duration-200 cursor-pointer  disabled:opacity-50"
                  >

                    {changingUsername
                      ? "Saving..."
                      : "Save"}

                  </button>

                  <button
                    onClick={() => {
                      setUsername(
                        user.name
                      )

                      setUsernameEditableFalse()
                    }}
                    className="sm:w-auto w-full px-5 py-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:opacity-90 transition-colors duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>

                </div>

              )}

            </div>

            <button
              onClick={() =>
                setShowAvatarModal(true)
              }
              className="w-full text-left p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors duration-200 cursor-pointer"
            >

              Change Avatar

            </button>

          </div>

        </div>

        {/* Danger Zone */}
        <div className="mt-8 bg-white/80 dark:bg-zinc-900/80 rounded-[32px] border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl transition-colors duration-200 p-8">

          <h3 className="text-lg lg:text-xl font-semibold text-red-500 mb-6">
            Danger Zone
          </h3>

          <div className="space-y-4">

            <button
              onClick={() =>
                signOut(navigate)
              }
              disabled={isLoggingout}
              className="w-full text-left p-5 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors duration-200 disabled:opacity-50 cursor-pointer"
            >

              {isLoggingout
                ? "Logging out..."
                : "Logout"}

            </button>

            <button
              onClick={() =>
                setShowDeleteModal(true)
              }
              className="w-full text-left p-5 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors duration-200 cursor-pointer"
            >

              Delete Account

            </button>

          </div>

        </div>

      </div>

      {showAvatarModal && (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">

          <div className="w-full max-w-sm rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl transition-colors duration-200 p-6">

            <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-white">

              Profile picture

            </h2>

            <div className="mt-8 space-y-3">

              {/* Change Avatar */}
              <label className={`flex items-center gap-4 p-4 rounded-2xl transition-colors duration-200 ${avatarLoading
                ? "pointer-events-none opacity-60"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                }`}>

                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">

                  {changingAvatar ? (
                    <LoaderCircle
                      size={22}
                      className="animate-spin text-zinc-500"
                    />
                  ) : (
                    <Camera
                      size={22}
                      className="text-zinc-700 dark:text-zinc-200"
                    />
                  )}

                </div>

                <span className="font-medium text-zinc-900 dark:text-white">

                  {changingAvatar
                    ? "Uploading..."
                    : "Change avatar"}

                </span>

                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {

                    changeAvatar(e)
                  }}
                />

              </label>

              {/* Remove Avatar */}
              {user.avatar && (

                <button
                  disabled={avatarLoading}
                  onClick={() => {

                    deleteAvatar(
                      user.avatar!,
                      user.avatarId!
                    )
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 transition-colors duration-200 ${avatarLoading
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
                    }`}
                >

                  <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/10 flex items-center justify-center">

                    {isDeletingAvatar ? (
                      <LoaderCircle
                        size={22}
                        className="animate-spin text-red-500"
                      />
                    ) : (
                      <Trash2
                        size={22}
                        className="text-red-500"
                      />
                    )}

                  </div>

                  <span className="font-medium text-red-500">

                    Remove avatar

                  </span>

                </button>
              )}

              {/* Cancel */}
              <button
                disabled={avatarLoading}
                onClick={() =>
                  setShowAvatarModal(false)
                }
                className={`w-full mt-4 p-4 rounded-2xl transition-colors ${avatarLoading
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200 cursor-pointer"
                  }`}
              >

                Cancel

              </button>

            </div>

          </div>

        </div>
      )}

      {showDeleteModal && (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">

          <div className="w-full max-w-md rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl transition-colors duration-200 p-8">

            <h2 className="text-2xl font-bold text-red-500">
              Delete Account
            </h2>

            <p className="text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">

              This action cannot be undone.
              Your account and messages will be permanently deleted.

            </p>

            <div className="flex justify-end gap-3 mt-8">

              <button
                onClick={() =>
                  setShowDeleteModal(false)
                }
                className="px-5 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  deleteUser(navigate)
                }
                disabled={deletingUser}
                className="px-5 py-3 rounded-2xl bg-red-500 hover:bg-red-600 transition-colors duration-200s text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >

                {deletingUser
                  ? "Deleting..."
                  : "Delete"}

              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  )
}