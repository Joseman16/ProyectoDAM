package ug.sotware.moodle.dto;

public record ForumDiscussionDto(
        long id,
        long forumId,
        String name,
        String subject,
        String userFullname,
        Long created
) {
}
