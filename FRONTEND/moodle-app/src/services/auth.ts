import * as SecureStore from "expo-secure-store";
import { api, APP_TOKEN_KEY } from "./api";
import { decodeJwtPayload } from "../utils/jwt";

export interface AuthUser {
  token: string;
  username: string;
  email: string;
  moodleUserId: number;
  usuarioLocalId: number;
}

export const AuthService = {
  /** Login con credenciales de Moodle → POST /api/auth/login */
  async login(username: string, password: string): Promise<AuthUser> {
    const { data } = await api.post<{ token: string }>("/api/auth/login", {
      username,
      password,
    });

    await SecureStore.setItemAsync(APP_TOKEN_KEY, data.token);
    const payload = decodeJwtPayload(data.token);

    return {
      token: data.token,
      username: payload.sub,
      email: payload.email ?? "",
      moodleUserId: payload.moodleUserId ?? 0,
      usuarioLocalId: payload.usuarioLocalId ?? 0,
    };
  },

  async logout() {
    await SecureStore.deleteItemAsync(APP_TOKEN_KEY);
  },

  async getStoredToken(): Promise<string | null> {
    return SecureStore.getItemAsync(APP_TOKEN_KEY);
  },

  userFromToken(token: string): AuthUser {
    const payload = decodeJwtPayload(token);
    return {
      token,
      username: payload.sub,
      email: payload.email ?? "",
      moodleUserId: payload.moodleUserId ?? 0,
      usuarioLocalId: payload.usuarioLocalId ?? 0,
    };
  },
};
