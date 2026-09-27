import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wellness_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Something went wrong. Please try again.'

    // FastAPI validation errors often return an array of objects
    if (Array.isArray(message)) {
      const formatted = message
        .map((item) => {
          const loc = Array.isArray(item.loc) ? item.loc.slice(1).join('.') : ''
          return loc ? `${loc}: ${item.msg}` : item.msg
        })
        .join(' | ')
      return Promise.reject(new Error(formatted))
    }

    if (typeof message === 'object' && message !== null) {
      return Promise.reject(new Error(JSON.stringify(message)))
    }

    return Promise.reject(new Error(message))
  },
)

export default api
