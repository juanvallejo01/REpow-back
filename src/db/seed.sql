-- datos de prueba; borra y vuelve a cargar todo
TRUNCATE reservas, espacios RESTART IDENTITY;

INSERT INTO espacios (nombre, capacidad, ubicacion) VALUES
  ('Sala de reuniones A', 8,   'Bloque 1 - Piso 2'),
  ('Auditorio',           120, 'Bloque 3 - Piso 1'),
  ('Laboratorio 1',       30,  'Bloque 2 - Piso 3'),
  ('Sala de estudio',     12,  'Biblioteca - Piso 1');

INSERT INTO reservas (espacio_id, responsable, inicio, fin) VALUES
  (1, 'Ana Gomez',    '2026-10-20 08:00-05', '2026-10-20 10:00-05'),
  (1, 'Carlos Ruiz',  '2026-10-20 10:00-05', '2026-10-20 12:00-05'),
  (2, 'Laura Torres', '2026-10-21 14:00-05', '2026-10-21 17:00-05'),
  (3, 'Pedro Diaz',   '2026-10-22 07:00-05', '2026-10-22 09:00-05');
