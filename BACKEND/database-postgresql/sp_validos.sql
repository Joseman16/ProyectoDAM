-- SELECT
CREATE OR REPLACE FUNCTION sp_usuario_listar()
RETURNS SETOF usuarios AS $$
BEGIN
    RETURN QUERY SELECT * FROM usuarios ORDER BY nombre_completo;
END;
$$ LANGUAGE plpgsql;

-- INSERT (registro de un usuario nuevo)
CREATE OR REPLACE FUNCTION sp_usuario_insertar(
    p_username VARCHAR, p_email VARCHAR, p_nombre_completo VARCHAR,
    p_password_hash VARCHAR, p_rol VARCHAR
)
RETURNS SETOF usuarios AS $$
BEGIN
    RETURN QUERY
    INSERT INTO usuarios (username, email, nombre_completo, password_hash, rol)
    VALUES (p_username, p_email, p_nombre_completo, p_password_hash, p_rol)
    RETURNING *;
END;
$$ LANGUAGE plpgsql;

-- UPDATE
CREATE OR REPLACE PROCEDURE sp_usuario_actualizar(p_id BIGINT, p_nombre_completo VARCHAR, p_rol VARCHAR)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE usuarios SET nombre_completo = p_nombre_completo, rol = p_rol WHERE id = p_id;
END;
$$;

-- DELETE
CREATE OR REPLACE PROCEDURE sp_usuario_eliminar(p_id BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM usuarios WHERE id = p_id;
END;
$$;

-- "Otra función": estadísticas, ahora sobre las tablas nuevas
CREATE OR REPLACE FUNCTION sp_usuario_estadisticas(p_usuario_id BIGINT)
RETURNS TABLE (
    usuario_id BIGINT, nombre_completo VARCHAR,
    total_entregas BIGINT, total_participaciones_foro BIGINT, ultima_entrega TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.nombre_completo,
        (SELECT COUNT(*) FROM entregas e WHERE e.usuario_id = u.id),
        (SELECT COUNT(*) FROM foro_mensajes f WHERE f.usuario_id = u.id),
        (SELECT MAX(e.fecha_envio) FROM entregas e WHERE e.usuario_id = u.id)
    FROM usuarios u WHERE u.id = p_usuario_id;
END;
$$ LANGUAGE plpgsql;