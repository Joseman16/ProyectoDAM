package ug.sotware.moodle.dto;

public record CourseDto(
        long id,
        String fullname,
        String shortname,
        String summary,
        String teacherName
) {
}
