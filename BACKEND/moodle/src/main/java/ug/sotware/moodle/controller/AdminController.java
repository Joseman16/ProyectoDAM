package ug.sotware.moodle.controller;

import ug.sotware.moodle.entity.CursoEntity;
import ug.sotware.moodle.entity.InscripcionEntity;
import ug.sotware.moodle.entity.UsuarioEntity;
import ug.sotware.moodle.repository.CursoRepository;
import ug.sotware.moodle.repository.InscripcionRepository;
import ug.sotware.moodle.repository.UsuarioRepository;
import ug.sotware.moodle.security.RoleGuard;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final InscripcionRepository inscripcionRepository;
    private final RoleGuard roleGuard;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public record UserDto(long id, String username, String email, String nombreCompleto, String rol) {}
    public record CreateUserRequest(String username, String email, String nombreCompleto, String password, String rol) {}
    public record AdminCourseDto(long id, String fullname, String shortname, String summary, String teacherName, int totalEstudiantes) {}
    public record CreateCourseRequest(String nombre, String shortname, String descripcion, long docenteId, List<Long> estudianteIds) {}

    @GetMapping("/users")
    public List<UserDto> listUsers(@RequestParam String rol, HttpServletRequest request) {
        roleGuard.requireAdmin(request);
        if (!List.of("student", "teacher").contains(rol)) {
            throw new IllegalArgumentException("Rol inválido. Use student o teacher");
        }
        return usuarioRepository.findByRol(rol).stream()
                .map(u -> new UserDto(u.getId(), u.getUsername(), u.getEmail(), u.getNombreCompleto(), u.getRol()))
                .toList();
    }

    @PostMapping("/users")
    public Map<String, String> createUser(@RequestBody CreateUserRequest req, HttpServletRequest request) {
        roleGuard.requireAdmin(request);
        if (req.username() == null || req.username().isBlank()) {
            throw new IllegalArgumentException("El username es obligatorio");
        }
        if (req.password() == null || req.password().length() < 4) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 4 caracteres");
        }
        String rol = req.rol() != null ? req.rol() : "student";
        if (!List.of("student", "teacher").contains(rol)) {
            throw new IllegalArgumentException("Solo se pueden crear usuarios student o teacher");
        }
        if (usuarioRepository.findByUsername(req.username()).isPresent()) {
            throw new IllegalArgumentException("El username ya existe");
        }

        UsuarioEntity u = new UsuarioEntity();
        u.setUsername(req.username());
        u.setEmail(req.email());
        u.setNombreCompleto(req.nombreCompleto());
        u.setPasswordHash(passwordEncoder.encode(req.password()));
        u.setRol(rol);
        usuarioRepository.save(u);
        return Map.of("status", "ok", "message", "Usuario creado");
    }

    @GetMapping("/courses")
    public List<AdminCourseDto> listCourses(HttpServletRequest request) {
        roleGuard.requireAdmin(request);
        return cursoRepository.findAll().stream()
                .map(c -> new AdminCourseDto(
                        c.getId(),
                        c.getNombre(),
                        c.getShortname(),
                        c.getDescripcion(),
                        c.getDocenteId() == null ? "N/D" :
                                usuarioRepository.findById(c.getDocenteId())
                                        .map(UsuarioEntity::getNombreCompleto).orElse("N/D"),
                        inscripcionRepository.findByCursoId(c.getId()).size()))
                .toList();
    }

    @PostMapping("/courses")
    public Map<String, Object> createCourse(@RequestBody CreateCourseRequest req, HttpServletRequest request) {
        roleGuard.requireAdmin(request);
        if (req.nombre() == null || req.nombre().isBlank()) {
            throw new IllegalArgumentException("El nombre del curso es obligatorio");
        }
        if (req.shortname() == null || req.shortname().isBlank()) {
            throw new IllegalArgumentException("El código del curso es obligatorio");
        }

        UsuarioEntity docente = usuarioRepository.findById(req.docenteId())
                .orElseThrow(() -> new IllegalArgumentException("Docente no encontrado"));
        if (!"teacher".equals(docente.getRol())) {
            throw new IllegalArgumentException("El docente asignado debe tener rol teacher");
        }

        CursoEntity curso = new CursoEntity();
        curso.setNombre(req.nombre());
        curso.setShortname(req.shortname());
        curso.setDescripcion(req.descripcion());
        curso.setDocenteId(req.docenteId());
        curso = cursoRepository.save(curso);

        int inscritos = 0;
        if (req.estudianteIds() != null) {
            for (Long estudianteId : req.estudianteIds()) {
                UsuarioEntity estudiante = usuarioRepository.findById(estudianteId)
                        .orElseThrow(() -> new IllegalArgumentException("Estudiante no encontrado: " + estudianteId));
                if (!"student".equals(estudiante.getRol())) {
                    throw new IllegalArgumentException("Solo se pueden inscribir usuarios con rol student");
                }
                if (!inscripcionRepository.existsByUsuarioIdAndCursoId(estudianteId, curso.getId())) {
                    InscripcionEntity inscripcion = new InscripcionEntity();
                    inscripcion.setUsuarioId(estudianteId);
                    inscripcion.setCursoId(curso.getId());
                    inscripcionRepository.save(inscripcion);
                    inscritos++;
                }
            }
        }

        return Map.of(
                "status", "ok",
                "message", "Curso creado",
                "courseId", curso.getId(),
                "estudiantesInscritos", inscritos
        );
    }
}
