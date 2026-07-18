package ug.sotware.moodle.entity;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDateTime;

@Entity @Table(name = "cursos") @Getter @Setter @NoArgsConstructor
public class CursoEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String nombre;
    @Column(nullable = false) private String shortname;
    private String descripcion;
    @Column(name = "docente_id") private Long docenteId;
    @Column(name = "creado_en", insertable = false, updatable = false) private LocalDateTime creadoEn;
}