package ug.sotware.moodle.controller;

import ug.sotware.moodle.entity.EntregaEntity;
import ug.sotware.moodle.repository.EntregaRepository;
import ug.sotware.moodle.security.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/assignments") @RequiredArgsConstructor
public class AssignmentController {
    private final EntregaRepository entregaRepository;
    private final CurrentUser currentUser;

    public record SubmissionRequest(String onlineText) {}

    @PostMapping("/{assignId}/submit")
    public Map<String, String> submit(@PathVariable long assignId, @RequestBody SubmissionRequest body, HttpServletRequest request) {
        var session = currentUser.from(request);
        EntregaEntity e = new EntregaEntity();
        e.setActividadId(assignId);
        e.setUsuarioId(session.usuarioId());
        e.setTextoEntrega(body.onlineText());
        e.setEstado("enviado");
        entregaRepository.save(e);
        return Map.of("status", "ok", "message", "Entrega registrada");
    }
}