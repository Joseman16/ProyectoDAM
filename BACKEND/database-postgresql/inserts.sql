-- =====================================================================
-- Ejecutar conectado a moodle_app_db, después de 01_schema.sql y
-- 02_functions_and_procedures.sql:
--   psql -U postgres -d moodle_app_db -f 03_inserts_datos_prueba.sql
--
-- Propósito: poblar las tablas con datos de prueba (20 registros c/u)
-- para poder probar el backend sin depender aún de datos reales de Moodle.
-- =====================================================================

select * from usuarios

-- =====================================================================
-- USUARIOS (20 registros)
-- =====================================================================
INSERT INTO usuarios (moodle_user_id, username, email, nombre_completo, rol, ultimo_login) VALUES
(1001, 'jsanchez',  'jsanchez@ug.edu.ec',  'Josman Sánchez',        'admin',   CURRENT_TIMESTAMP - INTERVAL '1 day'),
(1002, 'mrodriguez','mrodriguez@ug.edu.ec','María Rodríguez',       'teacher', CURRENT_TIMESTAMP - INTERVAL '2 day'),
(1003, 'cperez',    'cperez@ug.edu.ec',    'Carlos Pérez',          'teacher', CURRENT_TIMESTAMP - INTERVAL '3 day'),
(1004, 'agomez',    'agomez@ug.edu.ec',    'Ana Gómez',             'student', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(1005, 'lvera',     'lvera@ug.edu.ec',     'Luis Vera',             'student', CURRENT_TIMESTAMP - INTERVAL '4 day'),
(1006, 'pmoran',    'pmoran@ug.edu.ec',    'Paola Morán',           'student', CURRENT_TIMESTAMP - INTERVAL '2 day'),
(1007, 'jvillamar', 'jvillamar@ug.edu.ec', 'Jorge Villamar',        'student', CURRENT_TIMESTAMP - INTERVAL '5 day'),
(1008, 'kchavez',   'kchavez@ug.edu.ec',   'Karla Chávez',          'student', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(1009, 'dmendoza',  'dmendoza@ug.edu.ec',  'Diego Mendoza',         'student', CURRENT_TIMESTAMP - INTERVAL '6 day'),
(1010, 'nvillao',   'nvillao@ug.edu.ec',   'Nayeli Villao',         'student', CURRENT_TIMESTAMP - INTERVAL '2 day'),
(1011, 'esalazar',  'esalazar@ug.edu.ec',  'Erick Salazar',         'student', CURRENT_TIMESTAMP - INTERVAL '3 day'),
(1012, 'gzambrano', 'gzambrano@ug.edu.ec', 'Génesis Zambrano',      'student', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(1013, 'aloor',     'aloor@ug.edu.ec',     'Andrés Loor',           'student', CURRENT_TIMESTAMP - INTERVAL '7 day'),
(1014, 'mfranco',   'mfranco@ug.edu.ec',   'Melanie Franco',        'student', CURRENT_TIMESTAMP - INTERVAL '2 day'),
(1015, 'rcedeno',   'rcedeno@ug.edu.ec',   'Ricardo Cedeño',        'student', CURRENT_TIMESTAMP - INTERVAL '4 day'),
(1016, 'vquimi',    'vquimi@ug.edu.ec',    'Valentina Quimí',       'student', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(1017, 'bponce',    'bponce@ug.edu.ec',    'Bryan Ponce',           'student', CURRENT_TIMESTAMP - INTERVAL '5 day'),
(1018, 'ssuarez',   'ssuarez@ug.edu.ec',   'Scarlett Suárez',       'teacher', CURRENT_TIMESTAMP - INTERVAL '3 day'),
(1019, 'falava',    'falava@ug.edu.ec',    'Fernando Alava',        'student', CURRENT_TIMESTAMP - INTERVAL '2 day'),
(1020, 'jintriago', 'jintriago@ug.edu.ec', 'Julissa Intriago',      'student', NULL);

-- =====================================================================
-- CURSOS_CACHE (20 registros)
-- =====================================================================
INSERT INTO cursos_cache (moodle_course_id, fullname, shortname, teacher_name) VALUES
(2001, 'Programación Orientada a Objetos',           'POO101',   'María Rodríguez'),
(2002, 'Base de Datos I',                            'BD101',    'Carlos Pérez'),
(2003, 'Base de Datos II',                           'BD201',    'Carlos Pérez'),
(2004, 'Desarrollo de Aplicaciones Móviles',         'DAM301',   'María Rodríguez'),
(2005, 'Estructura de Datos',                        'ED201',    'Scarlett Suárez'),
(2006, 'Ingeniería de Software I',                   'IS301',    'Carlos Pérez'),
(2007, 'Ingeniería de Software II',                  'IS302',    'Carlos Pérez'),
(2008, 'Redes de Computadoras',                      'RED201',   'Scarlett Suárez'),
(2009, 'Sistemas Operativos',                        'SO201',    'María Rodríguez'),
(2010, 'Arquitectura de Software',                   'ARQ301',   'Carlos Pérez'),
(2011, 'Inteligencia Artificial',                    'IA401',    'Scarlett Suárez'),
(2012, 'Programación Web',                           'WEB201',   'María Rodríguez'),
(2013, 'Seguridad Informática',                      'SEG301',   'Carlos Pérez'),
(2014, 'Metodologías Ágiles',                        'AGL301',   'Scarlett Suárez'),
(2015, 'Cálculo Diferencial',                        'CAL101',   'María Rodríguez'),
(2016, 'Álgebra Lineal',                             'ALG101',   'Carlos Pérez'),
(2017, 'Estadística Aplicada',                       'EST201',   'Scarlett Suárez'),
(2018, 'Sistemas Distribuidos',                      'SD401',    'María Rodríguez'),
(2019, 'Gestión de Proyectos TI',                    'GPT301',   'Carlos Pérez'),
(2020, 'Computación en la Nube',                     'CN401',    'Scarlett Suárez');

-- =====================================================================
-- ENTREGAS_LOG (20 registros)
-- Nota: usuario_id asume asignación secuencial 1..20 desde el INSERT
-- anterior de usuarios. Si tu BD ya tenía datos previos, ajusta los IDs
-- consultando primero: SELECT id, username FROM usuarios;
-- =====================================================================
INSERT INTO entregas_log (usuario_id, moodle_assign_id, texto_entrega, estado, fecha_envio) VALUES
(4,  3001, 'Entrega de la práctica 1 de POO: clases y objetos.',            'enviado',   CURRENT_TIMESTAMP - INTERVAL '10 day'),
(4,  3002, 'Entrega del proyecto final de POO.',                            'calificado', CURRENT_TIMESTAMP - INTERVAL '5 day'),
(5,  3003, 'Tarea de normalización de bases de datos (1FN a 3FN).',         'enviado',   CURRENT_TIMESTAMP - INTERVAL '8 day'),
(5,  3004, 'Modelo entidad-relación del proyecto integrador.',              'calificado', CURRENT_TIMESTAMP - INTERVAL '3 day'),
(6,  3005, 'Prototipo de app móvil en Jetpack Compose.',                    'enviado',   CURRENT_TIMESTAMP - INTERVAL '6 day'),
(6,  3006, 'Consumo de API REST desde Android.',                            'enviado',   CURRENT_TIMESTAMP - INTERVAL '2 day'),
(7,  3007, 'Implementación de árboles binarios de búsqueda.',               'calificado', CURRENT_TIMESTAMP - INTERVAL '12 day'),
(7,  3008, 'Algoritmos de ordenamiento comparativo.',                       'enviado',   CURRENT_TIMESTAMP - INTERVAL '1 day'),
(8,  3009, 'Documento de requerimientos del proyecto de software.',         'enviado',   CURRENT_TIMESTAMP - INTERVAL '9 day'),
(8,  3010, 'Diagrama de casos de uso UML.',                                 'calificado', CURRENT_TIMESTAMP - INTERVAL '4 day'),
(9,  3011, 'Configuración de subredes IPv4.',                               'enviado',   CURRENT_TIMESTAMP - INTERVAL '7 day'),
(9,  3012, 'Simulación de topología de red en Packet Tracer.',              'enviado',   CURRENT_TIMESTAMP - INTERVAL '2 day'),
(10, 3013, 'Comparación entre planificadores de procesos.',                 'calificado', CURRENT_TIMESTAMP - INTERVAL '11 day'),
(10, 3014, 'Implementación de semáforos para exclusión mutua.',             'enviado',   CURRENT_TIMESTAMP - INTERVAL '3 day'),
(11, 3015, 'Diseño de arquitectura en capas del sistema.',                  'enviado',   CURRENT_TIMESTAMP - INTERVAL '5 day'),
(12, 3016, 'Entrenamiento de un modelo de clasificación básico.',           'enviado',   CURRENT_TIMESTAMP - INTERVAL '6 day'),
(13, 3017, 'Landing page responsiva con HTML y CSS.',                       'calificado', CURRENT_TIMESTAMP - INTERVAL '13 day'),
(14, 3018, 'Análisis de vulnerabilidades OWASP Top 10.',                    'enviado',   CURRENT_TIMESTAMP - INTERVAL '4 day'),
(15, 3019, 'Sprint 1 del proyecto con metodología Scrum.',                  'enviado',   CURRENT_TIMESTAMP - INTERVAL '2 day'),
(16, 3020, 'Ejercicios de límites y derivadas.',                            'calificado', CURRENT_TIMESTAMP - INTERVAL '10 day');

-- =====================================================================
-- FORO_POSTS_LOG (20 registros)
-- =====================================================================
INSERT INTO foro_posts_log (usuario_id, moodle_discussion_id, asunto, mensaje, fecha_publicacion) VALUES
(4,  4001, 'Duda sobre herencia múltiple',        'Profesora, ¿Java permite herencia múltiple de clases o solo de interfaces?',            CURRENT_TIMESTAMP - INTERVAL '9 day'),
(4,  4002, 'Recurso extra de POO',                'Comparto un artículo sobre principios SOLID que me ayudó bastante.',                    CURRENT_TIMESTAMP - INTERVAL '6 day'),
(5,  4003, 'Consulta sobre claves foráneas',       '¿Es obligatorio poner ON DELETE CASCADE en todas las FK del proyecto?',                CURRENT_TIMESTAMP - INTERVAL '8 day'),
(5,  4004, 'Normalización vs rendimiento',         'Leí que a veces se desnormaliza por rendimiento, ¿cuándo conviene hacerlo?',            CURRENT_TIMESTAMP - INTERVAL '5 day'),
(6,  4005, 'Error al consumir la API en Android',  'Me sale un error 401 al llamar el endpoint, ¿alguien más le pasó?',                     CURRENT_TIMESTAMP - INTERVAL '4 day'),
(6,  4006, 'Solución encontrada',                  'Ya resolví el error 401, era el token JWT que no estaba enviando en el header.',        CURRENT_TIMESTAMP - INTERVAL '3 day'),
(7,  4007, 'Complejidad de árboles AVL',            'No entiendo bien cómo se calcula el factor de balance, ¿alguien explica con ejemplo?',  CURRENT_TIMESTAMP - INTERVAL '11 day'),
(7,  4008, 'Material de apoyo algoritmos',          'Aquí dejo mis apuntes de la clase pasada sobre quicksort y mergesort.',                 CURRENT_TIMESTAMP - INTERVAL '7 day'),
(8,  4009, 'Diagrama de casos de uso',              '¿El actor secundario debe ir conectado directamente al caso de uso principal?',         CURRENT_TIMESTAMP - INTERVAL '9 day'),
(9,  4010, 'Duda sobre máscaras de subred',         '¿Cómo saco el número de hosts disponibles a partir de la máscara /27?',                 CURRENT_TIMESTAMP - INTERVAL '6 day'),
(10, 4011, 'Deadlock en sistemas operativos',       'Profesor, ¿puede explicar de nuevo las 4 condiciones necesarias para el deadlock?',      CURRENT_TIMESTAMP - INTERVAL '10 day'),
(11, 4012, 'Patrones de arquitectura',              '¿Cuál es la diferencia real entre arquitectura hexagonal y en capas?',                  CURRENT_TIMESTAMP - INTERVAL '5 day'),
(12, 4013, 'Overfitting en el modelo',              'Mi modelo tiene 99% en entrenamiento pero 60% en test, ¿cómo lo soluciono?',            CURRENT_TIMESTAMP - INTERVAL '4 day'),
(13, 4014, 'Flexbox vs Grid',                       '¿Cuándo conviene usar CSS Grid en vez de Flexbox para el layout?',                      CURRENT_TIMESTAMP - INTERVAL '12 day'),
(14, 4015, 'Inyección SQL',                         'Comparto un ejemplo práctico de cómo prevenir inyección SQL con PreparedStatement.',    CURRENT_TIMESTAMP - INTERVAL '3 day'),
(15, 4016, 'Retrospectiva del Sprint 1',            '¿Qué formato de retrospectiva recomiendan para equipos pequeños?',                      CURRENT_TIMESTAMP - INTERVAL '2 day'),
(16, 4017, 'Duda sobre límites',                    'No me queda claro el límite cuando x tiende a infinito en funciones racionales.',       CURRENT_TIMESTAMP - INTERVAL '9 day'),
(17, 4018, 'Presentación del proyecto final',       '¿La presentación final es individual o grupal?',                                        CURRENT_TIMESTAMP - INTERVAL '1 day'),
(19, 4019, 'Duda sobre OWASP',                      '¿El XSS y el CSRF se consideran parte de la misma categoría de vulnerabilidad?',        CURRENT_TIMESTAMP - INTERVAL '4 day'),
(20, 4020, 'Presentación personal',                 'Hola a todos, soy nueva en el curso, cualquier tip de bienvenida se agradece.',          CURRENT_TIMESTAMP - INTERVAL '1 day');