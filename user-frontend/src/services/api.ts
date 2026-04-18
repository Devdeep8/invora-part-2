import axios from 'axios'
import { storage } from '@/utils/storage'
import { API_BASE_URL } from '@/utils/constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// ✅ Request Interceptor — attach Bearer token from cookie
api.interceptors.request.use((config) => {
  const token = storage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log('API Request:', config.method?.toUpperCase(), config.url)
  return config
})

// ✅ Response Interceptor — always reject with a real Error object
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    })

    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      'Something went wrong'

    // Always reject with a proper Error so catch blocks get error.message
    const err = new Error(message)
    ;(err as Error & { status?: number; data?: unknown }).status = error.response?.status
    ;(err as Error & { status?: number; data?: unknown }).data = error.response?.data
    return Promise.reject(err)
  }
)

export default api