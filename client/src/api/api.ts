import { router } from "@/router";
import { routes } from "@/routes";
import { LocalStorageKeys } from "@/types/localStorage";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN);
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    console.log("originalRequest");

    if (
      originalRequest.url === "/auth/refresh" ||
      originalRequest.url === "/auth/signout"
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshRes = await api.post("/auth/refresh");
        localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, refreshRes.data);

        originalRequest.headers["Authorization"] = `Bearer ${refreshRes.data}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem(LocalStorageKeys.ACCESS_TOKEN);

        if (router.state.location.pathname !== routes.login) {
          router.navigate({ to: routes.login });
        }
      }
    }

    return Promise.reject(error);
  }
);

export { api };
