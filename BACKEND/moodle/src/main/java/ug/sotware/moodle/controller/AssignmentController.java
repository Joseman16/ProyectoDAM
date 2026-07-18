package ug.sotware.moodle.controller;

import ug.sotware.moodle.dto.AssignmentSubmissionRequest;
import ug.sotware.moodle.repository.EntregaLogRepository;
import ug.sotware.moodle.security.CurrentUser;
import ug.sotware.moodle.service.MoodleService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final MoodleService moodleService;
    private final CurrentUser currentUser;
    private final EntregaLogRepository entregaLogRepository;

    /**
     * 5.1.4 Envío de tareas (texto). assignId = "instance" del módulo "assign".
     * Tras confirmar el envío en Moodle, se registra en la BD local vía SP
     * (sp_entrega_insertar) para tener historial/auditoría propio.
     */
    @PostMapping("/{assignId}/submit")
    public Map<String, String> submit(@PathVariable long assignId,
                                       @Valid @RequestBody AssignmentSubmissionRequest body,
                                       HttpServletRequest request) {
        CurrentUser.Session session = currentUser.from(request);
        moodleService.submitAssignmentText(session.moodleToken(), assignId, body.onlineText());
        entregaLogRepository.insertarViaSP(session.usuarioLocalId(), assignId, body.onlineText());
        return Map.of("status", "ok", "message", "Entrega enviada correctamente");
    }
}
