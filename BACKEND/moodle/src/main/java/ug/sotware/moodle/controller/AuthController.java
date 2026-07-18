package ug.sotware.moodle.controller;

import ug.sotware.moodle.entity.UsuarioEntity;
import ug.sotware.moodle.repository.UsuarioRepository;
import ug.sotware.moodle.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public record LoginRequest(String username, String password) {}
    public record RegisterRequest(String username, String email, String nombreCompleto, String password, String rol) {}

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody LoginRequest req) {
        UsuarioEntity usuario = usuarioRepository.findByUsername(req.username())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (!passwordEncoder.matches(req.password(), usuario.getPasswordHash())) {
            throw new IllegalArgumentException("Contraseña incorrecta");
        }

        String jwt = jwtService.generate(usuario.getUsername(), usuario.getEmail(), usuario.getId(), usuario.getRol());
        return Map.of("token", jwt);
    }

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody RegisterRequest req) {
        UsuarioEntity u = new UsuarioEntity();
        u.setUsername(req.username());
        u.setEmail(req.email());
        u.setNombreCompleto(req.nombreCompleto());
        u.setPasswordHash(passwordEncoder.encode(req.password()));
        u.setRol(req.rol() != null ? req.rol() : "student");
        usuarioRepository.save(u);
        return Map.of("status", "ok", "message", "Usuario creado");
    }
}