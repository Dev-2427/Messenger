import './App.css'
import { Routes, Route } from 'react-router-dom'

import Signup from './pages/auth/Signup'
import Signin from './pages/auth/Signin'
import VerifyCode from './pages/auth/VerifyCode'
import ResetPassword from './pages/auth/ResetPassword'

import Home from './pages/main/Home'
import Welcome from './pages/main/Welcome'
import Community from './pages/main/Community'
import Settings from './pages/main/Settings'

import { Toaster } from 'react-hot-toast'
import AppLayout from './components/layout/AppLayout'
import PublicRoute from './routes/PublicRoute'
import ProtectedRoute from './routes/ProtectedRoutes'
import WelcomeRoute from './routes/WelcomeRoute'
import NotFound from './pages/NotFound'

import useAuthStore from "./store/authStore";
import useThemeStore from './store/useThemeStore'

import { useEffect } from "react";

function App() {

  const checkAuth = useAuthStore((s) => s.checkAuth);
  const mode = useThemeStore((s) => s.mode)

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark")
      document.documentElement.classList.remove("light")
    } else {
      document.documentElement.classList.remove("dark")
      document.documentElement.classList.add("light")
    }
  }, [mode])

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: "20px",
            padding: "14px 16px",
            background: mode === "dark"
              ? "#18181b"
              : "#ffffff",
            color: mode === "dark"
              ? "#f4f4f5"
              : "#18181b",
            border: mode === "dark"
              ? "1px solid #27272a"
              : "1px solid #e4e4e7",
            boxShadow: mode === "dark"
              ? "0 10px 30px rgba(0,0,0,0.35)"
              : "0 10px 30px rgba(0,0,0,0.08)",
          },

          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#ffffff",
            },
          },

          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path='/signup' element={<Signup />} />
          <Route path='/signin' element={<Signin />} />
          <Route path='/verifyCode/:email/:userId/:justSendEmail' element={<VerifyCode />} />
          <Route path='/resetPassword/:userId' element={<ResetPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<WelcomeRoute />}>
            <Route path='/welcome' element={<Welcome />} />
          </Route>

          <Route element={<AppLayout />}>
            <Route path='/' element={<Home />} />
            <Route path='/community' element={<Community />} />
            <Route path='/settings' element={<Settings />} />
          </Route>
        </Route>

        <Route path='*' element={<NotFound />} />

      </Routes>
    </>
  )
}

export default App