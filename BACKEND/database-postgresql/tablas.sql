CREATE TABLE IF NOT EXISTS usuarios (
    id               BIGSERIAL PRIMARY KEY,
    username         VARCHAR(100) NOT NULL UNIQUE,
    email            VARCHAR(150) NOT NULL UNIQUE,
    nombre_completo  VARCHAR(200) NOT NULL,
    password_hash    VARCHAR(500) NOT NULL,
    rol              VARCHAR(30)  NOT NULL DEFAULT 'student', -- 'student' | 'teacher' | 'admin'
    creado_en        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cursos (
    id           BIGSERIAL PRIMARY KEY,
    nombre       VARCHAR(255) NOT NULL,
    shortname    VARCHAR(100) NOT NULL,
    descripcion  TEXT,
    docente_id   BIGINT REFERENCES usuarios(id),
    creado_en    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inscripciones (
    id         BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    curso_id   BIGINT NOT NULL REFERENCES cursos(id),
    UNIQUE (usuario_id, curso_id)
);

CREATE TABLE IF NOT EXISTS actividades (
    id             BIGSERIAL PRIMARY KEY,
    curso_id       BIGINT NOT NULL REFERENCES cursos(id),
    nombre         VARCHAR(255) NOT NULL,
    tipo           VARCHAR(20)  NOT NULL, -- 'tarea' | 'foro' | 'recurso'
    descripcion    TEXT,
    fecha_entrega  TIMESTAMP,
    creado_en      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entregas (
    id             BIGSERIAL PRIMARY KEY,
    actividad_id   BIGINT NOT NULL REFERENCES actividades(id),
    usuario_id     BIGINT NOT NULL REFERENCES usuarios(id),
    texto_entrega  TEXT NOT NULL,
    estado         VARCHAR(30) NOT NULL DEFAULT 'enviado',
    fecha_envio    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS foro_discusiones (
    id            BIGSERIAL PRIMARY KEY,
    actividad_id  BIGINT NOT NULL REFERENCES actividades(id), -- la actividad tipo 'foro'
    usuario_id    BIGINT NOT NULL REFERENCES usuarios(id),
    asunto        VARCHAR(255) NOT NULL,
    creado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS foro_mensajes (
    id            BIGSERIAL PRIMARY KEY,
    discusion_id  BIGINT NOT NULL REFERENCES foro_discusiones(id),
    usuario_id    BIGINT NOT NULL REFERENCES usuarios(id),
    mensaje       TEXT NOT NULL,
    creado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);