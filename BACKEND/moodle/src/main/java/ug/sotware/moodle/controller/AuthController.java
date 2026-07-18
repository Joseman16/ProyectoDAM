package ug.sotware.moodle.controller;

import com.fasterxml.jackson.databind.JsonNode;
import ug.sotware.moodle.entity.UsuarioEntity;
import ug.sotware.moodle.repository.UsuarioRepository;
import ug.sotware.moodle.service.JwtService;
import ug.sotware.moodle.service.MoodleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final MoodleService moodleService;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    public record LoginRequest(String username, String password) {}

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody LoginRequest req) {
        // 1) Autenticar contra Moodle y obtener el wstoken del usuario
        String moodleToken = moodleService.fetchUserToken(req.username(), req.password());

        // 2) Obtener datos del usuario autenticado (id, email, nombre, rol)
        JsonNode info = moodleService.siteInfo(moodleToken);
        long moodleUserId = info.get("userid").asLong();
        String email = info.path("useremail").asText("");
        String nombreCompleto = info.path("fullname").asText(req.username());
        // Moodle no da un "rol" simple aquí; puedes ajustarlo según tu lógica
        String rol = "student";

        // 3) Sincronizar (upsert) el usuario local vía el SP
        var filas = usuarioRepository.upsertViaSP(moodleUserId, req.username(), email, nombreCompleto, rol);
        UsuarioEntity usuario = filas.get(0);

        // 4) Generar el JWT propio del backend, embebiendo el wstoken de Moodle
        String jwt = jwtService.generate(
                req.username(),
                email,
                moodleUserId,
                moodleToken,
                usuario.getId()
        );

        return Map.of("token", jwt);
    }
}