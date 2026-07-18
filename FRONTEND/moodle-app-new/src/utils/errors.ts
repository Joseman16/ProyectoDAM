export function getApiErrorMessage(err: unknown, fallback = "Ocurrió un error inesperado"): string {
  if (err && typeof err === "object" && "response" in err) {
    const data = (err as { response?: { data?: unknown; status?: number } }).response?.data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      if (typeof obj.message === "string") return obj.message;
      if (typeof obj.error === "string") return obj.error;
      if (typeof obj.mensaje === "string") return obj.mensaje;
    }
    const status = (err as { response?: { status?: number } }).response?.status;
    if (status === 401) return "Credenciales incorrectas o sesión expirada.";
    if (status === 403) return "No tienes permiso para esta acción.";
    if (status === 404) return "Recurso no encontrado.";
    if (status && status >= 500) return "Error del servidor. Intenta más tarde.";
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
