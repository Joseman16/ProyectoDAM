package ug.sotware.moodle.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "entregas_log")
@Getter
@Setter
@NoArgsConstructor
public class EntregaLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "moodle_assign_id", nullable = false)
    private Long moodleAssignId;

    @Column(name = "texto_entrega", nullable = false)
    private String textoEntrega;

    @Column(name = "estado", nullable = false)
    private String estado;

    @Column(name = "fecha_envio", insertable = false, updatable = false)
    private LocalDateTime fechaEnvio;
}
