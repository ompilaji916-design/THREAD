import axios from "axios";
import toast from "react-hot-toast";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
});

// Attach the Bearer token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("thread_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Any 401 anywhere -> clear storage, redirect to login, show toast
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("thread_token");
      localStorage.removeItem("thread_user");
      toast.error("Session expired. Please log in again.");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Standard shape every backend response follows
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  code?: string;
}
