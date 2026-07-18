package ug.sotware.moodle.repository;
import ug.sotware.moodle.entity.CursoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CursoRepository extends JpaRepository<CursoEntity, Long> {
    @org.springframework.data.jpa.repository.Query(
            "SELECT DISTINCT c FROM CursoEntity c LEFT JOIN InscripcionEntity i ON i.cursoId = c.id "
                    + "WHERE i.usuarioId = :usuarioId OR c.docenteId = :usuarioId")
    List<CursoEntity> findCursosDeUsuario(Long usuarioId);
}