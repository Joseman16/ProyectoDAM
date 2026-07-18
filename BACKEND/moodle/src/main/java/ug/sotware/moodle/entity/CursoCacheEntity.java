package ug.sotware.moodle.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "cursos_cache")
@Getter
@Setter
@NoArgsConstructor
public class CursoCacheEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "moodle_course_id", nullable = false, unique = true)
    private Long moodleCourseId;

    @Column(name = "fullname", nullable = false)
    private String fullname;

    @Column(name = "shortname", nullable = false)
    private String shortname;

    @Column(name = "teacher_name")
    private String teacherName;

    @Column(name = "actualizado_en", insertable = false, updatable = false)
    private LocalDateTime actualizadoEn;
}
