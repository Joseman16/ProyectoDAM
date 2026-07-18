package ug.sotware.moodle.repository;

import ug.sotware.moodle.entity.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<UsuarioEntity, Long> {

    // ---- CRUD estándar de Spring Data JPA (select/insert/update/delete) ----
    Optional<UsuarioEntity> findByMoodleUserId(Long moodleUserId);

    // ---- Llamadas explícitas a los procedimientos almacenados (SP) ----

    /** SELECT vía SP (FUNCTION): lista todos los usuarios */
    @Query(value = "SELECT * FROM sp_usuario_listar()", nativeQuery = true)
    List<UsuarioEntity> listarViaSP();

    /**
     * INSERT/UPDATE vía SP (FUNCTION, upsert): se llama en cada login para
     * mantener el usuario local sincronizado con el perfil de Moodle.
     */
    @Query(value = "SELECT * FROM sp_usuario_upsert(:moodleUserId, :username, :email, :nombreCompleto, :rol)",
            nativeQuery = true)
    List<UsuarioEntity> upsertViaSP(
            @Param("moodleUserId") Long moodleUserId,
            @Param("username") String username,
            @Param("email") String email,
            @Param("nombreCompleto") String nombreCompleto,
            @Param("rol") String rol
    );

    /** UPDATE vía SP (PROCEDURE, sin retorno) */
    @Modifying
    @Query(value = "CALL sp_usuario_actualizar(:id, :nombreCompleto, :rol)", nativeQuery = true)
    void actualizarViaSP(@Param("id") Long id, @Param("nombreCompleto") String nombreCompleto, @Param("rol") String rol);

    /** DELETE vía SP (PROCEDURE, sin retorno) */
    @Modifying
    @Query(value = "CALL sp_usuario_eliminar(:id)", nativeQuery = true)
    void eliminarViaSP(@Param("id") Long id);

    /**
     * "Otra función": estadísticas agregadas del usuario (FUNCTION, devuelve
     * filas), calculadas por sp_usuario_estadisticas. Se devuelve como filas
     * crudas porque mezcla columnas que no pertenecen a UsuarioEntity.
     */
    @Query(value = "SELECT * FROM sp_usuario_estadisticas(:usuarioId)", nativeQuery = true)
    List<Object[]> estadisticasViaSP(@Param("usuarioId") Long usuarioId);
}