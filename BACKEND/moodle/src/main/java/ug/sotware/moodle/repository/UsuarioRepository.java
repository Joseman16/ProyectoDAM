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

    // ---- CRUD estándar de Spring Data JPA ----
    // findAll(), findById(id), save(entity), deleteById(id) ya incluidos.
    Optional<UsuarioEntity> findByUsername(String username);

    List<UsuarioEntity> findByRol(String rol);

    // ---- Llamadas explícitas a los procedimientos almacenados (SP) ----

    /** SELECT vía SP (FUNCTION) */
    @Query(value = "SELECT * FROM sp_usuario_listar()", nativeQuery = true)
    List<UsuarioEntity> listarViaSP();

    /** INSERT vía SP (FUNCTION): usado al registrar un usuario nuevo */
    @Query(value = "SELECT * FROM sp_usuario_insertar(:username, :email, :nombreCompleto, :passwordHash, :rol)",
            nativeQuery = true)
    List<UsuarioEntity> insertarViaSP(
            @Param("username") String username,
            @Param("email") String email,
            @Param("nombreCompleto") String nombreCompleto,
            @Param("passwordHash") String passwordHash,
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

    /** "Otra función": estadísticas agregadas del usuario (entregas + foro) */
    @Query(value = "SELECT * FROM sp_usuario_estadisticas(:usuarioId)", nativeQuery = true)
    List<Object[]> estadisticasViaSP(@Param("usuarioId") Long usuarioId);
}