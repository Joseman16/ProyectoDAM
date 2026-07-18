package ug.sotware.moodle.service;

import ug.sotware.moodle.config.AppJwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * El backend emite su PROPIO JWT tras validar las credenciales contra Moodle.
 * Dentro va embebido el wstoken de Moodle del usuario, así el backend
 * no necesita una base de datos de sesiones para esta versión académica.
 * En producción: guardar el wstoken en una tabla/sesión server-side en vez
 * del JWT, y el JWT solo referenciar un sessionId.
 */
@Service
@RequiredArgsConstructor
public class JwtService {

    private final AppJwtProperties jwtProperties;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String generate(String username, String email, long moodleUserId, String moodleToken, long usuarioLocalId) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + jwtProperties.expirationMs());

        return Jwts.builder()
                .subject(username)
                .claim("email", email)
                .claim("moodleUserId", moodleUserId)
                .claim("moodleToken", moodleToken)
                .claim("usuarioLocalId", usuarioLocalId)
                .issuedAt(now)
                .expiration(exp)
                .signWith(key())
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
