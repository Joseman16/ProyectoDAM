# Base de datos — PostgreSQL

Base de datos local del backend intermedio (separada de la de Moodle).
Se usa para **cachear cursos** y **auditar** lo que pasa por la app:
usuarios que ingresan, tareas entregadas y participaciones en foro.
Moodle sigue siendo la fuente de verdad; esto es un complemento
(sección 6.2 del documento, "Capa de datos").

## 1. Crear la base y ejecutar los scripts

```bash
# 1) Crear la base (conectado a la BD por defecto "postgres")
psql -U postgres -f 00_create_database.sql

# 2) Crear las tablas (conectado a moodle_app_db)
psql -U postgres -d moodle_app_db -f 01_schema.sql

# 3) Crear funciones y procedimientos
psql -U postgres -d moodle_app_db -f 02_functions_and_procedures.sql
```

Si usas PgAdmin, puedes pegar el contenido de cada archivo en el Query Tool,
en el mismo orden, conectado a la base correspondiente.

## 2. Tablas creadas

| Tabla | Propósito |
|---|---|
| `usuarios` | Espejo local del usuario de Moodle que usa la app |
| `cursos_cache` | Copia local de los cursos consultados a Moodle |
| `entregas_log` | Auditoría de tareas enviadas desde la app |
| `foro_posts_log` | Auditoría de participaciones en foros |

## 3. Funciones y procedimientos por tabla

PostgreSQL distingue entre **FUNCTION** (puede devolver filas) y
**PROCEDURE** (solo ejecuta, no devuelve resultado). Se usó esa
convención para imitar los "SP" clásicos:

| Operación | Tipo | Ejemplo |
|---|---|---|
| SELECT | `FUNCTION ..._listar()` | `SELECT * FROM sp_usuario_listar();` |
| INSERT / UPSERT | `FUNCTION ..._upsert()` / `..._insertar()` | `SELECT * FROM sp_curso_upsert(101, 'Programación I', 'PROG1', 'Juan Pérez');` |
| UPDATE | `PROCEDURE ..._actualizar()` | `CALL sp_usuario_actualizar(1, 'Juan Pérez', 'teacher');` |
| DELETE | `PROCEDURE ..._eliminar()` | `CALL sp_usuario_eliminar(1);` |
| **Otra función** (estadísticas) | `FUNCTION sp_usuario_estadisticas()` | `SELECT * FROM sp_usuario_estadisticas(1);` |

## 4. Prueba rápida end-to-end

```sql
-- Crear un usuario de prueba (simula lo que hace el backend al hacer login)
SELECT * FROM sp_usuario_upsert(1001, 'estudiante1', 'estudiante1@correo.com', 'Ana Torres', 'student');

-- Cachear un curso
SELECT * FROM sp_curso_upsert(55, 'Bases de Datos II', 'BD2', 'Prof. Luis Ramos');

-- Registrar una entrega (usuario_id = 1, el que acabas de crear)
SELECT * FROM sp_entrega_insertar(1, 900, 'Esta es mi respuesta de prueba');

-- Registrar una participación en foro
SELECT * FROM sp_foro_post_insertar(1, 77, 'Re: Duda sobre el tema 3', 'Yo lo entendí así...');

-- Ver estadísticas agregadas del usuario (la "otra función")
SELECT * FROM sp_usuario_estadisticas(1);

-- Listar todo
SELECT * FROM sp_usuario_listar();
SELECT * FROM sp_curso_listar();
SELECT * FROM sp_entrega_listar_por_usuario(1);
SELECT * FROM sp_foro_post_listar_por_usuario(1);

-- Actualizar y eliminar (procedimientos puros, no devuelven filas)
CALL sp_entrega_actualizar_estado(1, 'calificado');
CALL sp_foro_post_eliminar(1);
```

## 5. Conectar esto desde Spring Boot

Si luego quieres conectar el backend Spring Boot a esta base en vez de MySQL,
los cambios son:

- `pom.xml`: reemplazar `mysql-connector-j` por `org.postgresql:postgresql`.
- `application.yml`:
  ```yaml
  spring:
    datasource:
      url: jdbc:postgresql://localhost:5432/moodle_app_db
      username: postgres
      password: tu_password
      driver-class-name: org.postgresql.Driver
    jpa:
      properties:
        hibernate:
          dialect: org.hibernate.dialect.PostgreSQLDialect
  ```
- En los `@Repository`, las llamadas a `FUNCTION` van como
  `@Query(value = "SELECT * FROM sp_usuario_listar()", nativeQuery = true)`
  (en vez de `CALL ...`), y las que sí son `PROCEDURE` (actualizar/eliminar)
  mantienen `CALL sp_x(...)`.

Avísame cuando quieras que actualice el backend para que hable con Postgres
en vez de MySQL — es un cambio pequeño y contenido.
