package ug.sotware.moodle.repository;

import ug.sotware.moodle.entity.EntregaLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntregaLogRepository extends JpaRepository<EntregaLogEntity, Long> {

    // ---- CRUD estándar JPA ----
    List<EntregaLogEntity> findByUsuarioIdOrderByFechaEnvioDesc(Long usuarioId);

    // ---- SP ----

    /** SELECT vía SP: historial de entregas de un usuario */
    @Query(value = "CALL sp_entrega_listar_por_usuario(:usuarioId)", nativeQuery = true)
    List<EntregaLogEntity> listarPorUsuarioViaSP(@Param("usuarioId") Long usuarioId);

    /** INSERT vía SP: se llama justo después de que Moodle confirma la entrega */
    @Query(value = "CALL sp_entrega_insertar(:usuarioId, :moodleAssignId, :textoEntrega)", nativeQuery = true)
    List<Object[]> insertarViaSP(
            @Param("usuarioId") Long usuarioId,
            @Param("moodleAssignId") Long moodleAssignId,
            @Param("textoEntrega") String textoEntrega
    );

    /** UPDATE vía SP */
    @Modifying
    @Query(value = "CALL sp_entrega_actualizar_estado(:id, :estado)", nativeQuery = true)
    void actualizarEstadoViaSP(@Param("id") Long id, @Param("estado") String estado);

    /** DELETE vía SP */
    @Modifying
    @Query(value = "CALL sp_entrega_eliminar(:id)", nativeQuery = true)
    void eliminarViaSP(@Param("id") Long id);
}
