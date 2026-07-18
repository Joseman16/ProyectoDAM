-- =====================================================================
-- Ejecutar conectado a moodle_app_db:
--   psql -U postgres -d moodle_app_db -f 01_schema.sql
--
-- Propósito: cache de cursos y AUDITORÍA de lo que pasa por la app
-- (usuarios que ingresan, tareas entregadas, participaciones en foro).
-- Moodle sigue siendo la fuente de verdad; esta BD es un complemento
-- del backend intermedio (sección 6.2, "Capa de datos").
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tabla: usuarios (perfil espejo del usuario de Moodle que usa la app)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id               BIGSERIAL PRIMARY KEY,
    moodle_user_id   BIGINT       NOT NULL UNIQUE,
    username         VARCHAR(100) NOT NULL UNIQUE,
    email            VARCHAR(150) NOT NULL,
    nombre_completo  VARCHAR(200) NOT NULL,
    rol              VARCHAR(30)  NOT NULL DEFAULT 'student',
    ultimo_login     TIMESTAMP    NULL,
    creado_en        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: cursos_cache (copia local de los cursos consultados a Moodle)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cursos_cache (
    id                BIGSERIAL PRIMARY KEY,
    moodle_course_id  BIGINT       NOT NULL UNIQUE,
    fullname          VARCHAR(255) NOT NULL,
    shortname         VARCHAR(100) NOT NULL,
    teacher_name      VARCHAR(200),
    actualizado_en    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: entregas_log (auditoría de tareas enviadas desde la app)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entregas_log (
    id                BIGSERIAL PRIMARY KEY,
    usuario_id        BIGINT       NOT NULL REFERENCES usuarios(id),
    moodle_assign_id  BIGINT       NOT NULL,
    texto_entrega     TEXT         NOT NULL,
    estado            VARCHAR(30)  NOT NULL DEFAULT 'enviado',
    fecha_envio       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: foro_posts_log (auditoría de participaciones en foros)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS foro_posts_log (
    id                    BIGSERIAL PRIMARY KEY,
    usuario_id            BIGINT       NOT NULL REFERENCES usuarios(id),
    moodle_discussion_id  BIGINT       NOT NULL,
    asunto                VARCHAR(255) NOT NULL,
    mensaje               TEXT         NOT NULL,
    fecha_publicacion     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_entregas_usuario ON entregas_log(usuario_id);
CREATE INDEX IF NOT EXISTS idx_foro_posts_usuario ON foro_posts_log(usuario_id);

-- ---------------------------------------------------------------------
-- Trigger para simular "ON UPDATE CURRENT_TIMESTAMP" (MySQL) en Postgres:
-- actualiza cursos_cache.actualizado_en cada vez que se hace UPDATE.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_set_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cursos_cache_actualizado_en ON cursos_cache;
CREATE TRIGGER trg_cursos_cache_actualizado_en
    BEFORE UPDATE ON cursos_cache
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_actualizado_en();
