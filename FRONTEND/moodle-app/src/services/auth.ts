import * as SecureStore from "expo-secure-store";
import { api, APP_TOKEN_KEY } from "./api";
import { decodeJwtPayload } from "../utils/jwt";

export type UserRole = "admin" | "teacher" | "student";

export interface AuthUser {
  token: string;
  username: string;
  email: string;
  usuarioId: number;
  rol: UserRole;
}

function userFromPayload(token: string, payload: ReturnType<typeof decodeJwtPayload>): AuthUser {
  return {
    token,
    username: payload.sub,
    email: payload.email ?? "",
    usuarioId: payload.usuarioId ?? 0,
    rol: (payload.rol as UserRole) ?? "student",
  };
}

export const AuthService = {
  async login(username: string, password: string): Promise<AuthUser> {
    const { data } = await api.post<{ token: string }>("/api/auth/login", { username, password });
    await SecureStore.setItemAsync(APP_TOKEN_KEY, data.token);
    return userFromPayload(data.token, decodeJwtPayload(data.token));
  },

  async logout() {
    await SecureStore.deleteItemAsync(APP_TOKEN_KEY);
  },

  async getStoredToken(): Promise<string | null> {
    return SecureStore.getItemAsync(APP_TOKEN_KEY);
  },

  userFromToken(token: string): AuthUser {
    return userFromPayload(token, decodeJwtPayload(token));
  },
};
