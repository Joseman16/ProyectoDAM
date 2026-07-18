package ug.sotware.moodle.dto;

public record AuthResponse(
        String appToken,     // JWT propio del backend (lo usa la app en el header Authorization)
        String fullName,
        String email,
        String moodleUserId,
        String role          // "student" | "teacher" | "admin" (heurística simple)
) {
}
