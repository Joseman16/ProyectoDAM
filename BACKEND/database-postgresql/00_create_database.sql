-- =====================================================================
-- Ejecutar este archivo conectado a la base por defecto (postgres),
-- NO dentro de moodle_app_db (Postgres no permite CREATE DATABASE
-- dentro de un bloque de transacción / desde otra base de datos activa).
--
-- Ejemplo:
--   psql -U postgres -f 00_create_database.sql
-- =====================================================================

CREATE DATABASE moodle_app_db
  WITH ENCODING 'UTF8'
  LC_COLLATE = 'en_US.UTF-8'
  LC_CTYPE   = 'en_US.UTF-8'
  TEMPLATE = template0;

-- (Opcional) usuario dedicado para el backend en vez de usar "postgres"
-- CREATE USER moodle_app_user WITH PASSWORD 'cambia-esta-clave';
-- GRANT ALL PRIVILEGES ON DATABASE moodle_app_db TO moodle_app_user;
