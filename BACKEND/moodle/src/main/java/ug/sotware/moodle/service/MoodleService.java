package ug.sotware.moodle.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import ug.sotware.moodle.config.MoodleProperties;
import ug.sotware.moodle.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;

/**
 * Encapsula TODAS las llamadas al Web Service REST de Moodle.
 * Documentación de referencia de cada función usada:
 * https://docs.moodle.org/dev/Web_service_API_functions
 */
@Service
@RequiredArgsConstructor
public class MoodleService {

    private final WebClient moodleWebClient;
    private final MoodleProperties moodleProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ---------------------------------------------------------------
    // 1) Obtención de token por usuario/contraseña (login/token.php)
    // ---------------------------------------------------------------
    public String fetchUserToken(String username, String password) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("username", username);
        form.add("password", password);
        form.add("service", moodleProperties.serviceName());   // ← corregido

        String body = moodleWebClient.post()
                .uri(moodleProperties.tokenEndpoint())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .bodyValue(form)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        JsonNode json = parse(body);
        if (json.has("error")) {
            throw new MoodleApiException("Credenciales de Moodle inválidas: " + json.get("error").asText());
        }
        return json.get("token").asText();
    }

    // ---------------------------------------------------------------
    // 2) Llamada genérica a cualquier función wsfunction del REST API
    // ---------------------------------------------------------------
    private JsonNode call(String token, String wsFunction, MultiValueMap<String, String> extraParams) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("wstoken", token);
        form.add("wsfunction", wsFunction);
        form.add("moodlewsrestformat", "json");
        if (extraParams != null) {
            form.addAll(extraParams);
        }

        String body = moodleWebClient.post()
                .uri(moodleProperties.restEndpoint())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .bodyValue(form)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        JsonNode json = parse(body);
        if (json.has("exception")) {
            throw new MoodleApiException("Moodle [" + wsFunction + "]: " + json.path("message").asText());
        }
        return json;
    }

    private JsonNode parse(String body) {
        try {
            return objectMapper.readTree(body);
        } catch (Exception e) {
            throw new MoodleApiException("Respuesta inválida de Moodle: " + e.getMessage());
        }
    }

    // ---------------------------------------------------------------
    // 3) core_webservice_get_site_info -> datos del usuario autenticado
    // ---------------------------------------------------------------
    public JsonNode siteInfo(String token) {
        return call(token, "core_webservice_get_site_info", null);
    }

    // ---------------------------------------------------------------
    // 4) core_enrol_get_users_courses -> "Listar cursos del usuario"
    // ---------------------------------------------------------------
    public List<CourseDto> getUserCourses(String token, long userId) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("userid", String.valueOf(userId));

        JsonNode result = call(token, "core_enrol_get_users_courses", params);
        List<CourseDto> courses = new ArrayList<>();
        for (JsonNode c : result) {
            courses.add(new CourseDto(
                    c.get("id").asLong(),
                    c.path("fullname").asText(""),
                    c.path("shortname").asText(""),
                    c.path("summary").asText(""),
                    resolveTeacherName(token, c.get("id").asLong())
            ));
        }
        return courses;
    }

    /** Moodle no da el docente directamente en get_users_courses; se resuelve con core_enrol_get_enrolled_users */
    private String resolveTeacherName(String token, long courseId) {
        try {
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("courseid", String.valueOf(courseId));
            JsonNode users = call(token, "core_enrol_get_enrolled_users", params);
            for (JsonNode u : users) {
                for (JsonNode role : u.path("roles")) {
                    String shortname = role.path("shortname").asText("");
                    if (shortname.equals("editingteacher") || shortname.equals("teacher")) {
                        return u.path("fullname").asText("Docente");
                    }
                }
            }
        } catch (Exception ignored) {
            // Si el usuario no tiene permiso para ver enrolados, se omite silenciosamente
        }
        return "N/D";
    }

    // ---------------------------------------------------------------
    // 5) core_course_get_contents -> "Obtener actividades del curso"
    // ---------------------------------------------------------------
    public List<ActivityDto> getCourseActivities(String token, long courseId) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("courseid", String.valueOf(courseId));

        JsonNode sections = call(token, "core_course_get_contents", params);
        List<ActivityDto> activities = new ArrayList<>();
        for (JsonNode section : sections) {
            for (JsonNode module : section.path("modules")) {
                String modname = module.path("modname").asText("");
                if (!(modname.equals("assign") || modname.equals("forum") || modname.equals("resource")
                        || modname.equals("quiz") || modname.equals("url"))) {
                    continue;
                }
                activities.add(new ActivityDto(
                        module.path("instance").asLong(),
                        module.path("id").asLong(),
                        module.path("name").asText(""),
                        modname,
                        friendlyType(modname),
                        null,
                        "N/A"
                ));
            }
        }
        return activities;
    }

    private String friendlyType(String modname) {
        return switch (modname) {
            case "assign" -> "Tarea";
            case "forum" -> "Foro";
            case "resource" -> "Recurso";
            case "quiz" -> "Cuestionario";
            case "url" -> "Enlace";
            default -> modname;
        };
    }

    // ---------------------------------------------------------------
    // 6) mod_assign_save_submission -> "Envío de tareas" (texto en línea)
    // ---------------------------------------------------------------
    public void submitAssignmentText(String token, long assignId, String onlineText) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("assignmentid", String.valueOf(assignId));
        params.add("plugindata[onlinetext_editor][text]", onlineText);
        params.add("plugindata[onlinetext_editor][format]", "1");
        call(token, "mod_assign_save_submission", params);
    }

    // ---------------------------------------------------------------
    // 7) mod_forum_get_forum_discussions -> "Lectura ... en foros"
    // ---------------------------------------------------------------
    public List<ForumDiscussionDto> getForumDiscussions(String token, long forumId) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("forumid", String.valueOf(forumId));

        JsonNode result = call(token, "mod_forum_get_forum_discussions", params);
        List<ForumDiscussionDto> discussions = new ArrayList<>();
        for (JsonNode d : result.path("discussions")) {
            discussions.add(new ForumDiscussionDto(
                    d.path("discussion").asLong(),
                    d.path("forum").asLong(),
                    d.path("name").asText(""),
                    d.path("subject").asText(""),
                    d.path("userfullname").asText(""),
                    d.path("created").asLong()
            ));
        }
        return discussions;
    }

    // ---------------------------------------------------------------
    // 8) mod_forum_get_discussion_posts -> leer mensajes de una discusión
    // ---------------------------------------------------------------
    public List<ForumPostDto> getDiscussionPosts(String token, long discussionId) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("discussionid", String.valueOf(discussionId));

        JsonNode result = call(token, "mod_forum_get_discussion_posts", params);
        List<ForumPostDto> posts = new ArrayList<>();
        for (JsonNode p : result.path("posts")) {
            posts.add(new ForumPostDto(
                    p.path("id").asLong(),
                    p.path("subject").asText(""),
                    p.path("message").asText(""),
                    p.path("author").path("fullname").asText(""),
                    p.path("timecreated").asLong()
            ));
        }
        return posts;
    }

    // ---------------------------------------------------------------
    // 9) mod_forum_add_discussion_post -> "publicación en foros"
    // ---------------------------------------------------------------
    public void addDiscussionPost(String token, long discussionId, String subject, String message) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("postid", "0");
        params.add("discussionid", String.valueOf(discussionId));
        params.add("subject", subject);
        params.add("message", message);
        params.add("messageformat", "1");
        call(token, "mod_forum_add_discussion_post", params);
    }

    public static class MoodleApiException extends RuntimeException {
        public MoodleApiException(String message) {
            super(message);
        }
    }
}
