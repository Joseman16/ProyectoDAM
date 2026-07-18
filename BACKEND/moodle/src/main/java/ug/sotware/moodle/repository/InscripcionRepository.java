package ug.sotware.moodle.repository;

import ug.sotware.moodle.entity.InscripcionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InscripcionRepository extends JpaRepository<InscripcionEntity, Long> {
    List<InscripcionEntity> findByCursoId(Long cursoId);
    boolean existsByUsuarioIdAndCursoId(Long usuarioId, Long cursoId);
}
