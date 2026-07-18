package ug.sotware.moodle.entity;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDateTime;

@Entity @Table(name = "entregas") @Getter @Setter @NoArgsConstructor
public class EntregaEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "actividad_id", nullable = false) private Long actividadId;
    @Column(name = "usuario_id", nullable = false) private Long usuarioId;
    @Column(name = "texto_entrega", nullable = false) private String textoEntrega;
    @Column(nullable = false) private String estado;
    @Column(name = "fecha_envio", insertable = false, updatable = false) private LocalDateTime fechaEnvio;
}