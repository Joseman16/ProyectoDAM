package ug.sotware.moodle.entity;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDateTime;

@Entity @Table(name = "foro_mensajes") @Getter @Setter @NoArgsConstructor
public class ForoMensajeEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "discusion_id", nullable = false) private Long discusionId;
    @Column(name = "usuario_id", nullable = false) private Long usuarioId;
    @Column(nullable = false) private String mensaje;
    @Column(name = "creado_en", insertable = false, updatable = false) private LocalDateTime creadoEn;
}