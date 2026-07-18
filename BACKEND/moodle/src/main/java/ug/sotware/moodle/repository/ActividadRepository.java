package ug.sotware.moodle.repository;
import ug.sotware.moodle.entity.ActividadEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActividadRepository extends JpaRepository<ActividadEntity, Long> {
    List<ActividadEntity> findByCursoId(Long cursoId);
}