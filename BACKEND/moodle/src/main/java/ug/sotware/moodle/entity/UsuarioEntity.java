package ug.sotware.moodle.entity;

import jakarta.persistence.*;
import lombok.Getter; import lombok.Setter; import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity @Table(name = "usuarios") @Getter @Setter @NoArgsConstructor
public class UsuarioEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true) private String username;
    @Column(nullable = false, unique = true) private String email;
    @Column(name = "nombre_completo", nullable = false) private String nombreCompleto;
    @Column(name = "password_hash", nullable = false) private String passwordHash;
    @Column(nullable = false) private String rol;
    @Column(name = "creado_en", insertable = false, updatable = false) private LocalDateTime creadoEn;
}