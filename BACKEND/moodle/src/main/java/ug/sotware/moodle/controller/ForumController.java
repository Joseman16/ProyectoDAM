package ug.sotware.moodle.controller;

import ug.sotware.moodle.dto.ForumDiscussionDto;
import ug.sotware.moodle.dto.ForumPostDto;
import ug.sotware.moodle.dto.NewForumPostRequest;
import ug.sotware.moodle.repository.ForoPostLogRepository;
import ug.sotware.moodle.security.CurrentUser;
import ug.sotware.moodle.service.MoodleService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forums")
@RequiredArgsConstructor
public class ForumController {

    private final MoodleService moodleService;
    private final CurrentUser currentUser;
    private final ForoPostLogRepository foroPostLogRepository;

    /** 5.1.5 Listar discusiones de un foro (forumId = "instance" del módulo "forum") */
    @GetMapping("/{forumId}/discussions")
    public List<ForumDiscussionDto> discussions(@PathVariable long forumId, HttpServletRequest request) {
        CurrentUser.Session session = currentUser.from(request);
        return moodleService.getForumDiscussions(session.moodleToken(), forumId);
    }

    /** 5.1.5 Leer mensajes de una discusión */
    @GetMapping("/discussions/{discussionId}/posts")
    public List<ForumPostDto> posts(@PathVariable long discussionId, HttpServletRequest request) {
        CurrentUser.Session session = currentUser.from(request);
        return moodleService.getDiscussionPosts(session.moodleToken(), discussionId);
    }

    /**
     * 5.1.5 Publicar una participación (respuesta) en una discusión existente.
     * Tras publicar en Moodle, se registra en la BD local vía SP (sp_foro_post_insertar).
     */
    @PostMapping("/discussions/{discussionId}/posts")
    public Map<String, String> newPost(@PathVariable long discussionId,
                                        @Valid @RequestBody NewForumPostRequest body,
                                        HttpServletRequest request) {
        CurrentUser.Session session = currentUser.from(request);
        moodleService.addDiscussionPost(session.moodleToken(), discussionId, body.subject(), body.message());
        foroPostLogRepository.insertarViaSP(session.usuarioLocalId(), discussionId, body.subject(), body.message());
        return Map.of("status", "ok", "message", "Publicación creada");
    }
}
