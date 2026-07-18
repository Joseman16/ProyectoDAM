package ug.sotware.moodle.repository;

import ug.sotware.moodle.entity.ForoPostLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForoPostLogRepository extends JpaRepository<ForoPostLogEntity, Long> {

    // ---- CRUD estándar JPA ----
    List<ForoPostLogEntity> findByUsuarioIdOrderByFechaPublicacionDesc(Long usuarioId);

    // ---- SP ----

    /** SELECT vía SP */
    @Query(value = "CALL sp_foro_post_listar_por_usuario(:usuarioId)", nativeQuery = true)
    List<ForoPostLogEntity> listarPorUsuarioViaSP(@Param("usuarioId") Long usuarioId);

    /** INSERT vía SP: se llama justo después de publicar en el foro de Moodle */
    @Query(value = "CALL sp_foro_post_insertar(:usuarioId, :discussionId, :asunto, :mensaje)", nativeQuery = true)
    List<Object[]> insertarViaSP(
            @Param("usuarioId") Long usuarioId,
            @Param("discussionId") Long discussionId,
            @Param("asunto") String asunto,
            @Param("mensaje") String mensaje
    );

    /** UPDATE vía SP */
    @Modifying
    @Query(value = "CALL sp_foro_post_actualizar(:id, :asunto, :mensaje)", nativeQuery = true)
    void actualizarViaSP(@Param("id") Long id, @Param("asunto") String asunto, @Param("mensaje") String mensaje);

    /** DELETE vía SP */
    @Modifying
    @Query(value = "CALL sp_foro_post_eliminar(:id)", nativeQuery = true)
    void eliminarViaSP(@Param("id") Long id);
}
