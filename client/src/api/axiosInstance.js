import axios from "axios";
import { useAuthStore } from "../store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

// Add a request interceptor to include the auth token in every request.
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;