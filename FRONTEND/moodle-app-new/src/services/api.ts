import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { BACKEND_URL } from "../config";

export const APP_TOKEN_KEY = "app_token";

export const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000,
});

// Adjunta automáticamente "Authorization: Bearer <appToken>" a cada request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(APP_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el backend responde 401, limpiamos el token para forzar re-login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync(APP_TOKEN_KEY);
    }
    return Promise.reject(error);
  },
);
