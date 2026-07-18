package ug.sotware.moodle.dto;

public record ActivityDto(
        long id,
        long courseModuleId, // cmid, se usa para enviar tareas / abrir foro
        String name,
        String modname,      // "assign", "forum", "resource", "quiz", etc.
        String type,         // etiqueta amigable: "Tarea", "Foro", "Recurso"
        Long dueDate,         // timestamp unix (solo assign), puede ser null
        String status         // "pendiente" | "entregado" | "N/A"
) {
}
