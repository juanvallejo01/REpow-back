-- tablas de REpow; se puede correr varias veces sin romper nada

-- btree_gist permite combinar "=" (espacio) y "&&" (cruce de horarios) en una restriccion EXCLUDE
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS espacios (
  id         SERIAL PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL UNIQUE,
  capacidad  INTEGER      NOT NULL CHECK (capacidad > 0),
  ubicacion  VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS reservas (
  id           SERIAL PRIMARY KEY,
  espacio_id   INTEGER      NOT NULL REFERENCES espacios(id),
  responsable  VARCHAR(100) NOT NULL,
  inicio       TIMESTAMPTZ  NOT NULL,
  fin          TIMESTAMPTZ  NOT NULL,
  estado       VARCHAR(20)  NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'cancelada')),

  -- bloqueo optimista: version de la fila (el front la recibe como ETag y la devuelve en If-Match)
  version      INTEGER      NOT NULL DEFAULT 1,
  actualizada  TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT reservas_horario_valido CHECK (fin > inicio),

  -- dos reservas activas del mismo espacio no pueden cruzarse en el tiempo
  CONSTRAINT reservas_sin_cruce EXCLUDE USING gist (
    espacio_id WITH =,
    tstzrange(inicio, fin) WITH &&
  ) WHERE (estado = 'activa')
);

-- cada UPDATE sube la version solo (tambien si se edita desde DBeaver)
CREATE OR REPLACE FUNCTION subir_version() RETURNS trigger AS $$
BEGIN
  NEW.version := OLD.version + 1;
  NEW.actualizada := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reservas_subir_version ON reservas;
CREATE TRIGGER reservas_subir_version
  BEFORE UPDATE ON reservas
  FOR EACH ROW EXECUTE FUNCTION subir_version();
