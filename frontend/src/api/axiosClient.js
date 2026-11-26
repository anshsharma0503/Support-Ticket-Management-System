import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Enables sending and receiving HTTP-only cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for centralized error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status,
      errors: error.response?.data?.errors || null
    };
    return Promise.reject(customError);
  }
);

export default api;
