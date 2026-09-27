import api from './api'

export const authService = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
}

export const profileService = {
  get: () => api.get('/profile'),
  update: (payload) => api.put('/profile', payload),
}

export const activityService = {
  list: (params) => api.get('/activities', { params }),
  get: (id) => api.get(`/activities/${id}`),
  create: (payload) => api.post('/activities', payload),
  update: (id, payload) => api.put(`/activities/${id}`, payload),
  remove: (id) => api.delete(`/activities/${id}`),
}

export const goalService = {
  list: () => api.get('/goals'),
  active: () => api.get('/goals/active'),
  create: (payload) => api.post('/goals', payload),
  update: (id, payload) => api.put(`/goals/${id}`, payload),
  remove: (id) => api.delete(`/goals/${id}`),
}

export const analyticsService = {
  weekly: () => api.get('/analytics/weekly'),
  monthly: () => api.get('/analytics/monthly'),
  today: () => api.get('/analytics/today'),
}
