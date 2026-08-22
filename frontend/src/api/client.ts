import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_URL
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("workout-quest-auth");
      delete api.defaults.headers.common.Authorization;
      window.dispatchEvent(new Event("workout-quest-unauthorized"));
    }
    return Promise.reject(error);
  }
);
