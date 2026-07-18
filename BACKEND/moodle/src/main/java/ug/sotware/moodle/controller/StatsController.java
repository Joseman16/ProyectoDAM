package ug.sotware.moodle.controller;

import ug.sotware.moodle.repository.UsuarioRepository;
import ug.sotware.moodle.security.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class StatsController {

    private final UsuarioRepository usuarioRepository;
    private final CurrentUser currentUser;

    @GetMapping("/me/estadisticas")
    public Map<String, Object> misEstadisticas(HttpServletRequest request) {
        var session = currentUser.from(request);
        List<Object[]> filas = usuarioRepository.estadisticasViaSP(session.usuarioId());
        if (filas.isEmpty()) {
            return Map.of("mensaje", "Sin datos aún para este usuario");
        }
        Object[] fila = filas.get(0);
        return Map.of(
                "usuarioId", fila[0],
                "nombreCompleto", fila[1],
                "totalEntregas", fila[2],
                "totalParticipacionesForo", fila[3],
                "ultimaEntrega", fila[4] == null ? "N/A" : fila[4]
        );
    }
}