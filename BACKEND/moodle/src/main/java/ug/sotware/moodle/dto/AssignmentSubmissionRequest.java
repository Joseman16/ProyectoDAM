package ug.sotware.moodle.dto;

import jakarta.validation.constraints.NotBlank;

public record AssignmentSubmissionRequest(
        @NotBlank String onlineText   // contenido de texto de la entrega
        // Para adjuntar archivos: primero subir con mod_assign_save_submission
        // usando el itemid de un draft creado vía core_files_upload (ver README)
) {
}
