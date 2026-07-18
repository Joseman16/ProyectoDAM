package ug.sotware.moodle.repository;
import ug.sotware.moodle.entity.ForoMensajeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ForoMensajeRepository extends JpaRepository<ForoMensajeEntity, Long> {
    List<ForoMensajeEntity> findByDiscusionId(Long discusionId);
}