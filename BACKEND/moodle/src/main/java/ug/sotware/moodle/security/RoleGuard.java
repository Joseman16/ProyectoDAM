package ug.sotware.moodle.security;

import ug.sotware.moodle.entity.CursoEntity;
import ug.sotware.moodle.repository.CursoRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoleGuard {
    private final CurrentUser currentUser;
    private final CursoRepository cursoRepository;

    public CurrentUser.Session requireAdmin(HttpServletRequest request) {
        return requireRole(request, "admin");
    }

    public CurrentUser.Session requireTeacher(HttpServletRequest request) {
        return requireRole(request, "teacher", "admin");
    }

    public CurrentUser.Session requireCourseTeacher(HttpServletRequest request, long courseId) {
        var session = requireTeacher(request);
        if ("admin".equals(session.rol())) return session;

        CursoEntity curso = cursoRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado"));
        if (curso.getDocenteId() == null || curso.getDocenteId() != session.usuarioId()) {
            throw new AccessDeniedException("No eres docente de este curso");
        }
        return session;
    }

    private CurrentUser.Session requireRole(HttpServletRequest request, String... roles) {
        var session = currentUser.from(request);
        for (String rol : roles) {
            if (rol.equals(session.rol())) return session;
        }
        throw new AccessDeniedException("No tienes permiso para esta acción");
    }

    public static class AccessDeniedException extends RuntimeException {
        public AccessDeniedException(String message) {
            super(message);
        }
    }
}
