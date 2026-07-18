package ug.sotware.moodle.repository;

import ug.sotware.moodle.entity.CursoCacheEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CursoCacheRepository extends JpaRepository<CursoCacheEntity, Long> {

    // ---- CRUD estándar JPA ----
    Optional<CursoCacheEntity> findByMoodleCourseId(Long moodleCourseId);

    // ---- SP ----

    /** SELECT vía SP */
    @Query(value = "CALL sp_curso_listar()", nativeQuery = true)
    List<CursoCacheEntity> listarViaSP();

    /** INSERT/UPDATE vía SP (upsert): se llama cada vez que la app pide "mis cursos" */
    @Modifying
    @Query(value = "CALL sp_curso_upsert(:moodleCourseId, :fullname, :shortname, :teacherName)", nativeQuery = true)
    void upsertViaSP(
            @Param("moodleCourseId") Long moodleCourseId,
            @Param("fullname") String fullname,
            @Param("shortname") String shortname,
            @Param("teacherName") String teacherName
    );

    /** DELETE vía SP */
    @Modifying
    @Query(value = "CALL sp_curso_eliminar(:id)", nativeQuery = true)
    void eliminarViaSP(@Param("id") Long id);
}
