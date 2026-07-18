package ug.sotware.moodle.security;

import ug.sotware.moodle.service.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component @RequiredArgsConstructor
public class CurrentUser {
    private final JwtService jwtService;

    public record Session(String username, String email, long usuarioId, String rol) {}

    public Session from(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Falta el header Authorization: Bearer <token>");
        }
        Claims claims = jwtService.parse(header.substring(7));
        return new Session(claims.getSubject(), claims.get("email", String.class),
                claims.get("usuarioId", Long.class), claims.get("rol", String.class));
    }
}