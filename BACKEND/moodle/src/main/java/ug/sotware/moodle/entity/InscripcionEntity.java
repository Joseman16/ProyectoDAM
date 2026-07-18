package ug.sotware.moodle.entity;
import jakarta.persistence.*; import lombok.*;

@Entity @Table(name = "inscripciones") @Getter @Setter @NoArgsConstructor
public class InscripcionEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "usuario_id", nullable = false) private Long usuarioId;
    @Column(name = "curso_id", nullable = false) private Long cursoId;
}