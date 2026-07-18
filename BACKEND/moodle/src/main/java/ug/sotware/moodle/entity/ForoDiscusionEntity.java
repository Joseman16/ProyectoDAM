package ug.sotware.moodle.entity;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDateTime;

@Entity @Table(name = "foro_discusiones") @Getter @Setter @NoArgsConstructor
public class ForoDiscusionEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "actividad_id", nullable = false) private Long actividadId;
    @Column(name = "usuario_id", nullable = false) private Long usuarioId;
    @Column(nullable = false) private String asunto;
    @Column(name = "creado_en", insertable = false, updatable = false) private LocalDateTime creadoEn;
}