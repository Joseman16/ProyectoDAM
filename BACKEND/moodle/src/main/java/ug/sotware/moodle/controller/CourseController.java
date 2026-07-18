package ug.sotware.moodle.controller;

import ug.sotware.moodle.entity.*;
import ug.sotware.moodle.repository.*;
import ug.sotware.moodle.security.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api/courses") @RequiredArgsConstructor
public class CourseController {
    private final CursoRepository cursoRepository;
    private final ActividadRepository actividadRepository;
    private final UsuarioRepository usuarioRepository;
    private final CurrentUser currentUser;

    public record CourseDto(long id, String fullname, String shortname, String summary, String teacherName) {}
    public record ActivityDto(long id, long courseModuleId, String name, String modname, String type, Long dueDate, String status) {}

    @GetMapping
    public List<CourseDto> myCourses(HttpServletRequest request) {
        var session = currentUser.from(request);
        return cursoRepository.findCursosDeUsuario(session.usuarioId()).stream()
                .map(c -> new CourseDto(c.getId(), c.getNombre(), c.getShortname(), c.getDescripcion(),
                        c.getDocenteId() == null ? "N/D" :
                                usuarioRepository.findById(c.getDocenteId()).map(UsuarioEntity::getNombreCompleto).orElse("N/D")))
                .toList();
    }

    @GetMapping("/{courseId}/activities")
    public List<ActivityDto> activities(@PathVariable long courseId) {
        return actividadRepository.findByCursoId(courseId).stream()
                .map(a -> new ActivityDto(a.getId(), a.getId(), a.getNombre(), modname(a.getTipo()), friendly(a.getTipo()),
                        a.getFechaEntrega() == null ? null : a.getFechaEntrega().toEpochSecond(java.time.ZoneOffset.UTC), "N/A"))
                .toList();
    }

    private String modname(String tipo) {
        return switch (tipo) {
            case "tarea" -> "assign";
            case "foro" -> "forum";
            case "recurso" -> "resource";
            default -> tipo;
        };
    }

    private String friendly(String tipo) {
        return switch (tipo) { case "tarea" -> "Tarea"; case "foro" -> "Foro"; case "recurso" -> "Recurso"; default -> tipo; };
    }
}