import axios from 'axios'
import authStore from '../store/authStore'

const api = axios.create({
    baseURL: import.meta.env.VITE_URL,
    withCredentials: true,
    validateStatus: () => true
})

declare module 'axios' {
    interface InternalAxiosRequestConfig {
        _retry?: boolean
    }
}

let isRefreshing = false
let failedQueue: { resolve: (value: unknown) => void, reject: (reason?: unknown) => void }[] = []

function processQueue(error: unknown) {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(null)
        }
    })
    failedQueue = []
}

api.interceptors.response.use(
    async (response) => {
        if (response.status === 408) {
            const originalRequest = response.config

            if (!originalRequest._retry) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject })
                    }).then(() => api(originalRequest))
                        .catch((err) => Promise.reject(err))
                }

                originalRequest._retry = true
                isRefreshing = true

                try {
                    await api.post('/api/auth/refresh')
                    processQueue(null)
                    return api(originalRequest)
                } catch (refreshError) {
                    processQueue(refreshError)
                    authStore.getState().forceLogout()
                    return Promise.reject(refreshError)
                } finally {
                    isRefreshing = false
                }
            }
        }

        return response
    },
    (error) => Promise.reject(error)
)

export default api