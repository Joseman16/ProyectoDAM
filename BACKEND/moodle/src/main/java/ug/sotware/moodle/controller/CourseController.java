package ug.sotware.moodle.controller;

import ug.sotware.moodle.dto.ActivityDto;
import ug.sotware.moodle.dto.CourseDto;
import ug.sotware.moodle.repository.CursoCacheRepository;
import ug.sotware.moodle.security.CurrentUser;
import ug.sotware.moodle.service.MoodleService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final MoodleService moodleService;
    private final CurrentUser currentUser;
    private final CursoCacheRepository cursoCacheRepository;

    /** 5.1.2 Lista de cursos: nombre, shortname, docente. Cachea cada curso vía SP (sp_curso_upsert). */
    @GetMapping
    public List<CourseDto> myCourses(HttpServletRequest request) {
        CurrentUser.Session session = currentUser.from(request);
        List<CourseDto> courses = moodleService.getUserCourses(session.moodleToken(), session.moodleUserId());
        courses.forEach(c -> cursoCacheRepository.upsertViaSP(c.id(), c.fullname(), c.shortname(), c.teacherName()));
        return courses;
    }

    /** 5.1.3 Actividades del curso: tareas, foros y recursos */
    @GetMapping("/{courseId}/activities")
    public List<ActivityDto> activities(@PathVariable long courseId, HttpServletRequest request) {
        CurrentUser.Session session = currentUser.from(request);
        return moodleService.getCourseActivities(session.moodleToken(), courseId);
    }
}
