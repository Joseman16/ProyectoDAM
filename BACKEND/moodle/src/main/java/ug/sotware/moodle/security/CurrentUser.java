package ug.sotware.moodle.security;

import ug.sotware.moodle.service.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUser {

    private final JwtService jwtService;

    public record Session(String username, String email, long moodleUserId, String moodleToken, long usuarioLocalId) {}

    /** Lee "Authorization: Bearer <appToken>" y devuelve los datos de sesión, incluido el wstoken de Moodle */
    public Session from(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Falta el header Authorization: Bearer <token>");
        }
        Claims claims = jwtService.parse(header.substring(7));
        return new Session(
                claims.getSubject(),
                claims.get("email", String.class),
                claims.get("moodleUserId", Long.class),
                claims.get("moodleToken", String.class),
                claims.get("usuarioLocalId", Long.class)
        );
    }
}
