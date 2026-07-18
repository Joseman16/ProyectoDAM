package ug.sotware.moodle.dto;

import jakarta.validation.constraints.NotBlank;

/** Login directo contra Moodle: usuario y contraseña del LMS. */
public record LoginRequest(
        @NotBlank String moodleUsername,
        @NotBlank String moodlePassword
) {
}
