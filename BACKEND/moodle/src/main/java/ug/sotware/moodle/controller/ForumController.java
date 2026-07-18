package ug.sotware.moodle.controller;

import ug.sotware.moodle.entity.*;
import ug.sotware.moodle.repository.*;
import ug.sotware.moodle.security.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api/forums") @RequiredArgsConstructor
public class ForumController {
    private final ForoDiscusionRepository discusionRepository;
    private final ForoMensajeRepository mensajeRepository;
    private final UsuarioRepository usuarioRepository;
    private final CurrentUser currentUser;

    public record DiscussionDto(long id, long forumId, String name, String subject, String userFullname, long created) {}
    public record PostDto(long id, String subject, String message, String userFullname, long created) {}
    public record NewPostRequest(String subject, String message) {}

    @GetMapping("/{forumId}/discussions")
    public List<DiscussionDto> discussions(@PathVariable long forumId) {
        return discusionRepository.findByActividadId(forumId).stream()
                .map(d -> new DiscussionDto(d.getId(), forumId, d.getAsunto(), d.getAsunto(),
                        nombreDe(d.getUsuarioId()), d.getCreadoEn().toEpochSecond(java.time.ZoneOffset.UTC)))
                .toList();
    }

    @GetMapping("/discussions/{discussionId}/posts")
    public List<PostDto> posts(@PathVariable long discussionId) {
        return mensajeRepository.findByDiscusionId(discussionId).stream()
                .map(m -> new PostDto(m.getId(), "", m.getMensaje(), nombreDe(m.getUsuarioId()),
                        m.getCreadoEn().toEpochSecond(java.time.ZoneOffset.UTC)))
                .toList();
    }

    @PostMapping("/discussions/{discussionId}/posts")
    public Map<String, String> newPost(@PathVariable long discussionId, @RequestBody NewPostRequest body, HttpServletRequest request) {
        var session = currentUser.from(request);
        ForoMensajeEntity m = new ForoMensajeEntity();
        m.setDiscusionId(discussionId);
        m.setUsuarioId(session.usuarioId());
        m.setMensaje(body.message());
        mensajeRepository.save(m);
        return Map.of("status", "ok", "message", "Publicación creada");
    }

    private String nombreDe(Long usuarioId) {
        return usuarioRepository.findById(usuarioId).map(UsuarioEntity::getNombreCompleto).orElse("N/D");
    }
}