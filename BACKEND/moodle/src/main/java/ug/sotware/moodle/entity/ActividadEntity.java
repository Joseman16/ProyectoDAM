package ug.sotware.moodle.entity;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDateTime;

@Entity @Table(name = "actividades") @Getter @Setter @NoArgsConstructor
public class ActividadEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "curso_id", nullable = false) private Long cursoId;
    @Column(nullable = false) private String nombre;
    @Column(nullable = false) private String tipo; // tarea | foro | recurso
    private String descripcion;
    @Column(name = "fecha_entrega") private LocalDateTime fechaEntrega;
}