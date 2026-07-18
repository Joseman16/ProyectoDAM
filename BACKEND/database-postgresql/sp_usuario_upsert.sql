ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS password_hash VARCHAR(400);


-- 2) Reemplazar el SP de upsert para que también reciba y guarde el hash
CREATE OR REPLACE FUNCTION sp_usuario_upsert(
    p_moodle_user_id BIGINT,
    p_username VARCHAR,
    p_email VARCHAR,
    p_nombre_completo VARCHAR,
    p_rol VARCHAR,
    p_password_hash VARCHAR
)
RETURNS SETOF usuarios AS $$
BEGIN
    RETURN QUERY
    INSERT INTO usuarios (moodle_user_id, username, email, nombre_completo, rol, password_hash, ultimo_login)
    VALUES (p_moodle_user_id, p_username, p_email, p_nombre_completo, p_rol, p_password_hash, CURRENT_TIMESTAMP)
    ON CONFLICT (moodle_user_id) DO UPDATE
        SET email = EXCLUDED.email,
            nombre_completo = EXCLUDED.nombre_completo,
            rol = EXCLUDED.rol,
            password_hash = EXCLUDED.password_hash,
            ultimo_login = CURRENT_TIMESTAMP
    RETURNING *;
END;
$$ LANGUAGE plpgsql;


CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Actualizar la contraseña a "12345*" para TODOS los usuarios
UPDATE usuarios
SET password_hash = crypt('12345*', gen_salt('bf', 10));