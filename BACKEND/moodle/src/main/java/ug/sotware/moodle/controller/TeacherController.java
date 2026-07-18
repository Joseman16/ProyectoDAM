package ug.sotware.moodle.controller;

import ug.sotware.moodle.entity.ActividadEntity;
import ug.sotware.moodle.entity.ForoDiscusionEntity;
import ug.sotware.moodle.entity.ForoMensajeEntity;
import ug.sotware.moodle.repository.ActividadRepository;
import ug.sotware.moodle.repository.ForoDiscusionRepository;
import ug.sotware.moodle.repository.ForoMensajeRepository;
import ug.sotware.moodle.security.RoleGuard;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private final ActividadRepository actividadRepository;
    private final ForoDiscusionRepository discusionRepository;
    private final ForoMensajeRepository mensajeRepository;
    private final RoleGuard roleGuard;

    public record CreateActivityRequest(String nombre, String tipo, String descripcion, Long dueDate) {}
    public record CreateDiscussionRequest(String subject, String message) {}

    @PostMapping("/courses/{courseId}/activities")
    public Map<String, Object> createActivity(
            @PathVariable long courseId,
            @RequestBody CreateActivityRequest body,
            HttpServletRequest request) {
        var session = roleGuard.requireCourseTeacher(request, courseId);
        if (body.nombre() == null || body.nombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la actividad es obligatorio");
        }
        String tipo = body.tipo() != null ? body.tipo() : "tarea";
        if (!List.of("tarea", "foro").contains(tipo)) {
            throw new IllegalArgumentException("Tipo inválido. Use tarea o foro");
        }

        ActividadEntity actividad = new ActividadEntity();
        actividad.setCursoId(courseId);
        actividad.setNombre(body.nombre());
        actividad.setTipo(tipo);
        actividad.setDescripcion(body.descripcion());
        if ("tarea".equals(tipo) && body.dueDate() != null) {
            actividad.setFechaEntrega(LocalDateTime.ofInstant(Instant.ofEpochSecond(body.dueDate()), ZoneOffset.UTC));
        }
        actividad = actividadRepository.save(actividad);

        if ("foro".equals(tipo)) {
            ForoDiscusionEntity discusion = new ForoDiscusionEntity();
            discusion.setActividadId(actividad.getId());
            discusion.setUsuarioId(session.usuarioId());
            discusion.setAsunto("Bienvenido al foro: " + actividad.getNombre());
            discusionRepository.save(discusion);
        }

        return Map.of(
                "status", "ok",
                "message", "Actividad creada",
                "activityId", actividad.getId(),
                "tipo", tipo
        );
    }

    @PostMapping("/forums/{forumId}/discussions")
    public Map<String, Object> createDiscussion(
            @PathVariable long forumId,
            @RequestBody CreateDiscussionRequest body,
            HttpServletRequest request) {
        var session = roleGuard.requireTeacher(request);
        ActividadEntity foro = actividadRepository.findById(forumId)
                .orElseThrow(() -> new IllegalArgumentException("Foro no encontrado"));
        if (!"foro".equals(foro.getTipo())) {
            throw new IllegalArgumentException("La actividad indicada no es un foro");
        }
        roleGuard.requireCourseTeacher(request, foro.getCursoId());

        if (body.subject() == null || body.subject().isBlank()) {
            throw new IllegalArgumentException("El asunto es obligatorio");
        }

        ForoDiscusionEntity discusion = new ForoDiscusionEntity();
        discusion.setActividadId(forumId);
        discusion.setUsuarioId(session.usuarioId());
        discusion.setAsunto(body.subject());
        discusion = discusionRepository.save(discusion);

        if (body.message() != null && !body.message().isBlank()) {
            ForoMensajeEntity mensaje = new ForoMensajeEntity();
            mensaje.setDiscusionId(discusion.getId());
            mensaje.setUsuarioId(session.usuarioId());
            mensaje.setMensaje(body.message());
            mensajeRepository.save(mensaje);
        }

        return Map.of(
                "status", "ok",
                "message", "Discusión creada",
                "discussionId", discusion.getId()
        );
    }
}
