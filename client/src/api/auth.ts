import { api } from "@/api";

export const loginUser = (values: { email: string; password: string }) => {
  return api.post("/auth/login", values);
};

export const registerUser = (values: { email: string; password: string }) => {
  return api.post("/auth/register", values);
};

export const refreshAccessToken = () => {
  return api.post("/auth/refresh");
};
