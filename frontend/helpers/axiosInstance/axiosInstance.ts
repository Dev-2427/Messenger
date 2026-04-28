// import axios, { InternalAxiosRequestConfig } from "axios";
// import * as SecureStore from 'expo-secure-store';
// import { router } from 'expo-router';

// // Extend Axios types to include _retry flag
// interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
//     _retry?: boolean;
// }

// const api = axios.create({
//     baseURL: 'http://10.234.242.68:3000',
//     headers: {
//         "x-platform": "mobile"
//     },
//     validateStatus: (status) => status < 500
// });

// // Flag to prevent multiple simultaneous refresh requests
// let isRefreshing = false;
// let failedQueue: Array<{
//     resolve: (value?: any) => void;
//     reject: (reason?: any) => void;
// }> = [];

// // Process all queued requests after token refresh
// const processQueue = (error: any, token: string | null = null) => {
//     failedQueue.forEach(prom => {
//         if (error) {
//             prom.reject(error);
//         } else {
//             prom.resolve(token);
//         }
//     });
//     failedQueue = [];
// };

// // REQUEST INTERCEPTOR - Add token to every request
// api.interceptors.request.use(
//     async (config: CustomAxiosRequestConfig) => {
//         const token = await SecureStore.getItemAsync("accessToken");

//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }

//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// // RESPONSE INTERCEPTOR - Handle token expiration
// api.interceptors.response.use(
//     (response) => {
//         // Check if response has 401 status even when validateStatus allows it
//         if (response.status === 401 && !(response.config as CustomAxiosRequestConfig)._retry) {
//             return Promise.reject({
//                 response,
//                 config: response.config
//             });
//         }
//         return response;
//     },
//     async (error) => {
//         const originalRequest: CustomAxiosRequestConfig = error.config;

//         // Check if error is 401 and we haven't already retried
//         if (error.response?.status === 401 && !originalRequest._retry) {

//             // If already refreshing, queue this request
//             if (isRefreshing) {
//                 return new Promise((resolve, reject) => {
//                     failedQueue.push({ resolve, reject });
//                 })
//                     .then(async (token) => {
//                         originalRequest.headers.Authorization = 'Bearer ' + token;
//                         return api(originalRequest);
//                     })
//                     .catch((err) => {
//                         return Promise.reject(err);
//                     });
//             }

//             originalRequest._retry = true;
//             isRefreshing = true;

//             try {
//                 // Get refresh token from secure store
//                 const refreshToken = await SecureStore.getItemAsync("refreshToken");

//                 if (!refreshToken) {
//                     throw new Error("No refresh token found");
//                 }

//                 // Call refresh endpoint
//                 const response = await axios.post(
//                     'http://10.234.242.68:3000/api/auth/refresh',
//                     {},
//                     {
//                         headers: {
//                             'Authorization': `Bearer ${refreshToken}`,
//                             'x-platform': 'mobile'
//                         }
//                     }
//                 );

//                 if (response.data.success) {
//                     const { accessToken, refreshToken: newRefreshToken } = response.data;

//                     // Save new tokens
//                     await SecureStore.setItemAsync("accessToken", accessToken);
//                     await SecureStore.setItemAsync("refreshToken", newRefreshToken);

//                     // Update the authorization header
//                     api.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
//                     originalRequest.headers.Authorization = 'Bearer ' + accessToken;

//                     // Process all queued requests
//                     processQueue(null, accessToken);

//                     // Retry the original request
//                     return api(originalRequest);
//                 } else {
//                     throw new Error("Token refresh failed");
//                 }

//             } catch (refreshError) {
//                 // Token refresh failed - clear tokens and redirect to login
//                 processQueue(refreshError, null);

//                 await SecureStore.deleteItemAsync("accessToken");
//                 await SecureStore.deleteItemAsync("refreshToken");

//                 // Redirect to login
//                 router.replace('/auth/authentication');

//                 return Promise.reject(refreshError);
//             } finally {
//                 isRefreshing = false;
//             }
//         }

//         // For other errors, just reject
//         return Promise.reject(error);
//     }
// );

// export default api;

import axios, { InternalAxiosRequestConfig } from "axios";
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const URL = process.env.EXPO_PUBLIC_API_URL

// Extend Axios types to include _retry flag
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

const api = axios.create({
    baseURL: URL,
    headers: {
        "x-platform": "mobile"
    },
    validateStatus: (status) => true
});

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

// Process all queued requests after token refresh
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// REQUEST INTERCEPTOR - Add token to every request
api.interceptors.request.use(
    async (config: CustomAxiosRequestConfig) => {
        const token = await SecureStore.getItemAsync("accessToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// RESPONSE INTERCEPTOR - Handle token expiration
api.interceptors.response.use(
    async (response) => {
        const config = response.config as CustomAxiosRequestConfig;

        // Check if response has 401 status even when validateStatus allows it
        if (response.status === 408 && !config._retry) {
            config._retry = true;

            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(async (token) => {
                        config.headers.Authorization = 'Bearer ' + token;
                        return api(config);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            isRefreshing = true;

            try {
                // Get refresh token from secure store
                const refreshToken = await SecureStore.getItemAsync("refreshToken");

                if (!refreshToken) {
                    throw new Error("No refresh token found");
                }

                console.log("🔄 Refreshing tokens...");

                // Call refresh endpoint
                const refreshResponse = await axios.post(
                    `${URL}/api/auth/refresh`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${refreshToken}`,
                            'x-platform': 'mobile'
                        }
                    }
                );

                if (refreshResponse.data.success) {
                    const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

                    console.log("✅ Tokens refreshed successfully");

                    // Save new tokens
                    await SecureStore.setItemAsync("accessToken", accessToken);
                    await SecureStore.setItemAsync("refreshToken", newRefreshToken);

                    // Update the authorization header
                    api.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
                    config.headers.Authorization = 'Bearer ' + accessToken;

                    const SocketStore = require('../../stores/chatAndMessageStore').default

                    SocketStore.getState().disconnectSocket()
                    SocketStore.getState().connectSocket()

                    // Process all queued requests
                    processQueue(null, accessToken);

                    // Retry the original request
                    return api(config);
                } else {
                    throw new Error("Token refresh failed");
                }

            } catch (refreshError) {
                console.log("❌ Token refresh failed:", refreshError);

                // Token refresh failed - clear tokens and redirect to login
                processQueue(refreshError, null);

                await SecureStore.deleteItemAsync("accessToken");
                await SecureStore.deleteItemAsync("refreshToken");

                // Redirect to login
                router.replace('/auth/authentication');

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return response;
    },
    async (error) => {
        const originalRequest: CustomAxiosRequestConfig = error.config;

        // Check if error is 401 and we haven't already retried
        if (error.response?.status === 408 && !originalRequest._retry) {

            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(async (token) => {
                        originalRequest.headers.Authorization = 'Bearer ' + token;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Get refresh token from secure store
                const refreshToken = await SecureStore.getItemAsync("refreshToken");

                if (!refreshToken) {
                    throw new Error("No refresh token found");
                }

                // Call refresh endpoint
                const response = await axios.post(
                    `${URL}/api/auth/refresh`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${refreshToken}`,
                            'x-platform': 'mobile'
                        }
                    }
                );

                if (response.data.success) {
                    const { accessToken, refreshToken: newRefreshToken } = response.data;

                    // Save new tokens
                    await SecureStore.setItemAsync("accessToken", accessToken);
                    await SecureStore.setItemAsync("refreshToken", newRefreshToken);

                    // Update the authorization header
                    api.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
                    originalRequest.headers.Authorization = 'Bearer ' + accessToken;

                    const SocketStore = require('../../stores/chatAndMessageStore').default

                    SocketStore.getState().disconnectSocket()
                    SocketStore.getState().connectSocket()

                    // Process all queued requests
                    processQueue(null, accessToken);

                    // Retry the original request
                    return api(originalRequest);
                } else {
                    throw new Error("Token refresh failed");
                }

            } catch (refreshError) {
                // Token refresh failed - clear tokens and redirect to login
                processQueue(refreshError, null);

                await SecureStore.deleteItemAsync("accessToken");
                await SecureStore.deleteItemAsync("refreshToken");

                // Redirect to login
                router.replace('/auth/authentication');

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // For other errors, just reject
        return Promise.reject(error);
    }
);

export default api;