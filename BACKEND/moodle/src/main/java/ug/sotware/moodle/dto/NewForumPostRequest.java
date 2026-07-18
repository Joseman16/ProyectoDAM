package ug.sotware.moodle.dto;

import jakarta.validation.constraints.NotBlank;

public record NewForumPostRequest(
        @NotBlank String subject,
        @NotBlank String message
) {
}
