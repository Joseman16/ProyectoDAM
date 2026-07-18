package ug.sotware.moodle.dto;

public record ForumPostDto(
        long id,
        String subject,
        String message,
        String userFullname,
        Long created
) {
}
