package ug.sotware.moodle.repository;
import ug.sotware.moodle.entity.ForoDiscusionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ForoDiscusionRepository extends JpaRepository<ForoDiscusionEntity, Long> {
    List<ForoDiscusionEntity> findByActividadId(Long actividadId);
}