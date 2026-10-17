-- demostracion para DBeaver: correr cada bloque por separado (seleccionarlo + Ctrl/Cmd + Enter)
-- al terminar, dejar los datos como estaban con: npm run db:setup

-- 1) datos de prueba
SELECT * FROM espacios ORDER BY id;

SELECT r.id, e.nombre AS espacio, r.responsable, r.inicio, r.fin, r.estado, r.version
  FROM reservas r
  JOIN espacios e ON e.id = r.espacio_id
 ORDER BY r.id;

-- 2) reserva que se cruza con la de Ana (Sala A, 08:00-10:00) -> la base la rechaza
INSERT INTO reservas (espacio_id, responsable, inicio, fin)
VALUES (1, 'Prueba', '2026-10-20 09:00-05', '2026-10-20 11:00-05');

-- 3) bloqueo optimista: dos usuarios leyeron la reserva 3 cuando estaba en version 1
SELECT id, responsable, version FROM reservas WHERE id = 3;

-- 3a) usuario A guarda con version 1 -> se actualiza y la version pasa a 2
UPDATE reservas SET responsable = 'Laura (cambio de A)'
 WHERE id = 3 AND version = 1
RETURNING id, responsable, version;

-- 3b) usuario B guarda con la version vieja (1) -> 0 filas: conflicto, el back respondera 412
UPDATE reservas SET responsable = 'Laura (cambio de B)'
 WHERE id = 3 AND version = 1
RETURNING id, responsable, version;

-- 4) cancelar la reserva de Ana libera el horario
UPDATE reservas SET estado = 'cancelada' WHERE id = 1 RETURNING id, estado, version;

INSERT INTO reservas (espacio_id, responsable, inicio, fin)
VALUES (1, 'Prueba', '2026-10-20 09:00-05', '2026-10-20 10:00-05')
RETURNING id, responsable, version;
