-- =====================================================================
-- Ejecutar conectado a moodle_app_db, después de 01_schema.sql:
--   psql -U postgres -d moodle_app_db -f 02_functions_and_procedures.sql
--
-- Convención usada (equivalente a los "SP" de MySQL):
--   - FUNCTION  -> para todo lo que necesita DEVOLVER filas (listar, upsert)
--   - PROCEDURE -> para DML puro sin retorno (actualizar, eliminar)
-- Ambos se invocan como procedimientos almacenados desde el backend
-- (FUNCTION con "SELECT * FROM fn(...)", PROCEDURE con "CALL sp(...)").
-- =====================================================================

-- =====================================================================
-- USUARIOS
-- =====================================================================

-- SELECT: listar todos los usuarios
CREATE OR REPLACE FUNCTION sp_usuario_listar()
RETURNS SETOF usuarios AS $$
BEGIN
    RETURN QUERY SELECT * FROM usuarios ORDER BY nombre_completo;
END;
$$ LANGUAGE plpgsql;

-- SELECT: obtener un usuario por su moodle_user_id
CREATE OR REPLACE FUNCTION sp_usuario_obtener_por_moodle_id(p_moodle_user_id BIGINT)
RETURNS SETOF usuarios AS $$
BEGIN
    RETURN QUERY SELECT * FROM usuarios WHERE moodle_user_id = p_moodle_user_id;
END;
$$ LANGUAGE plpgsql;

-- INSERT/UPDATE (upsert): se llama en cada login para sincronizar con Moodle
CREATE OR REPLACE FUNCTION sp_usuario_upsert(
    p_moodle_user_id BIGINT,
    p_username VARCHAR,
    p_email VARCHAR,
    p_nombre_completo VARCHAR,
    p_rol VARCHAR
)
RETURNS SETOF usuarios AS $$
BEGIN
    RETURN QUERY
    INSERT INTO usuarios (moodle_user_id, username, email, nombre_completo, rol, ultimo_login)
    VALUES (p_moodle_user_id, p_username, p_email, p_nombre_completo, p_rol, CURRENT_TIMESTAMP)
    ON CONFLICT (moodle_user_id) DO UPDATE
        SET email = EXCLUDED.email,
            nombre_completo = EXCLUDED.nombre_completo,
            rol = EXCLUDED.rol,
            ultimo_login = CURRENT_TIMESTAMP
    RETURNING *;
END;
$$ LANGUAGE plpgsql;

-- UPDATE puro
CREATE OR REPLACE PROCEDURE sp_usuario_actualizar(
    p_id BIGINT,
    p_nombre_completo VARCHAR,
    p_rol VARCHAR
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE usuarios
       SET nombre_completo = p_nombre_completo,
           rol = p_rol
     WHERE id = p_id;
END;
$$;

-- DELETE puro
CREATE OR REPLACE PROCEDURE sp_usuario_eliminar(p_id BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM usuarios WHERE id = p_id;
END;
$$;

-- =====================================================================
-- CURSOS_CACHE
-- =====================================================================

CREATE OR REPLACE FUNCTION sp_curso_listar()
RETURNS SETOF cursos_cache AS $$
BEGIN
    RETURN QUERY SELECT * FROM cursos_cache ORDER BY fullname;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_curso_upsert(
    p_moodle_course_id BIGINT,
    p_fullname VARCHAR,
    p_shortname VARCHAR,
    p_teacher_name VARCHAR
)
RETURNS SETOF cursos_cache AS $$
BEGIN
    RETURN QUERY
    INSERT INTO cursos_cache (moodle_course_id, fullname, shortname, teacher_name)
    VALUES (p_moodle_course_id, p_fullname, p_shortname, p_teacher_name)
    ON CONFLICT (moodle_course_id) DO UPDATE
        SET fullname = EXCLUDED.fullname,
            shortname = EXCLUDED.shortname,
            teacher_name = EXCLUDED.teacher_name
    RETURNING *;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE sp_curso_eliminar(p_id BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM cursos_cache WHERE id = p_id;
END;
$$;

-- =====================================================================
-- ENTREGAS_LOG
-- =====================================================================

CREATE OR REPLACE FUNCTION sp_entrega_listar_por_usuario(p_usuario_id BIGINT)
RETURNS SETOF entregas_log AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM entregas_log WHERE usuario_id = p_usuario_id ORDER BY fecha_envio DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_entrega_insertar(
    p_usuario_id BIGINT,
    p_moodle_assign_id BIGINT,
    p_texto_entrega TEXT
)
RETURNS SETOF entregas_log AS $$
BEGIN
    RETURN QUERY
    INSERT INTO entregas_log (usuario_id, moodle_assign_id, texto_entrega, estado)
    VALUES (p_usuario_id, p_moodle_assign_id, p_texto_entrega, 'enviado')
    RETURNING *;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE sp_entrega_actualizar_estado(
    p_id BIGINT,
    p_estado VARCHAR
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE entregas_log SET estado = p_estado WHERE id = p_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_entrega_eliminar(p_id BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM entregas_log WHERE id = p_id;
END;
$$;

-- =====================================================================
-- FORO_POSTS_LOG
-- =====================================================================

CREATE OR REPLACE FUNCTION sp_foro_post_listar_por_usuario(p_usuario_id BIGINT)
RETURNS SETOF foro_posts_log AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM foro_posts_log WHERE usuario_id = p_usuario_id ORDER BY fecha_publicacion DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_foro_post_insertar(
    p_usuario_id BIGINT,
    p_moodle_discussion_id BIGINT,
    p_asunto VARCHAR,
    p_mensaje TEXT
)
RETURNS SETOF foro_posts_log AS $$
BEGIN
    RETURN QUERY
    INSERT INTO foro_posts_log (usuario_id, moodle_discussion_id, asunto, mensaje)
    VALUES (p_usuario_id, p_moodle_discussion_id, p_asunto, p_mensaje)
    RETURNING *;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE sp_foro_post_actualizar(
    p_id BIGINT,
    p_asunto VARCHAR,
    p_mensaje TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE foro_posts_log SET asunto = p_asunto, mensaje = p_mensaje WHERE id = p_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_foro_post_eliminar(p_id BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM foro_posts_log WHERE id = p_id;
END;
$$;

-- =====================================================================
-- "OTRA FUNCIÓN": estadísticas agregadas de actividad de un usuario
-- (cuántas tareas ha entregado y en cuántas discusiones ha participado
-- desde la app, útil para un futuro dashboard o gamificación)
-- =====================================================================
CREATE OR REPLACE FUNCTION sp_usuario_estadisticas(p_usuario_id BIGINT)
RETURNS TABLE (
    usuario_id BIGINT,
    nombre_completo VARCHAR,
    total_entregas BIGINT,
    total_participaciones_foro BIGINT,
    ultima_entrega TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.nombre_completo,
        (SELECT COUNT(*) FROM entregas_log e WHERE e.usuario_id = u.id),
        (SELECT COUNT(*) FROM foro_posts_log f WHERE f.usuario_id = u.id),
        (SELECT MAX(e.fecha_envio) FROM entregas_log e WHERE e.usuario_id = u.id)
    FROM usuarios u
    WHERE u.id = p_usuario_id;
END;
$$ LANGUAGE plpgsql;
