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

@Service @RequiredArgsConstructor
public class JwtService {
    private final AppJwtProperties jwtProperties;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String generate(String username, String email, long usuarioId, String rol) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + jwtProperties.expirationMs());
        return Jwts.builder()
                .subject(username)
                .claim("email", email)
                .claim("usuarioId", usuarioId)
                .claim("rol", rol)
                .issuedAt(now).expiration(exp)
                .signWith(key())
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload();
    }
}