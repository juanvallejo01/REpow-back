# REpow – Back

API REST para **reservar espacios** (salas, auditorios, laboratorios) evitando choques cuando
dos personas reservan o editan al mismo tiempo, con **bloqueo optimista por versión de fila**.

Hecha con **Node.js + Express** y **PostgreSQL** (se puede ver y consultar con DBeaver).

## Requisitos

- Node.js 20 o superior
- PostgreSQL 15 o superior

## Cómo correrlo

```bash
# 1. encender PostgreSQL (en Mac con Homebrew)
brew services start postgresql@17

# 2. crear la base de datos
createdb repow_db

# 3. configurar la conexion (editar .env con tu usuario de PostgreSQL)
cp .env.example .env

# 4. instalar dependencias
npm install

# 5. crear las tablas y cargar datos de prueba (borra lo que haya)
npm run db:setup

# 6. arrancar la API en http://localhost:3000
npm run dev
```

## Estructura

```
src/
├── index.js                 arranca Express, CORS y las rutas /api
├── config/db.js             conexion a PostgreSQL
├── routes/                  que URL va a que controlador
├── controllers/             validan los datos y responden
│   └── validar.js           validaciones compartidas (ids, fechas, If-Match)
├── models/                  solo consultas SQL
├── middlewares/
│   └── errorHandler.js      todos los errores responden { success: false, message }
└── db/
    ├── schema.sql           tablas, reglas y trigger
    ├── seed.sql             datos de prueba
    ├── setup.js             corre schema.sql y seed.sql (npm run db:setup)
    └── demo.sql             demostracion para correr en DBeaver
```

Flujo de una petición: **ruta → controlador → modelo → base de datos**.

## Endpoints

| Método | Ruta | Qué hace |
|--------|------|----------|
| GET | `/api/espacios` | Lista de espacios |
| GET | `/api/espacios/:id` | Un espacio |
| GET | `/api/espacios/:id/reservas?fecha=2026-10-20` | Horarios ocupados de un espacio ese día |
| GET | `/api/reservas` | Todas las reservas |
| GET | `/api/reservas/:id` | Una reserva (manda su versión en el header `ETag`) |
| POST | `/api/reservas` | Crear una reserva |
| PUT | `/api/reservas/:id` | Editar una reserva (exige el header `If-Match`) |
| DELETE | `/api/reservas/:id` | Cancelar una reserva (exige el header `If-Match`) |

Todas responden `{ success: true, data }` o `{ success: false, message }`.

## Cómo funciona el bloqueo optimista

Cada reserva tiene una columna **`version`** que empieza en 1. Un trigger de PostgreSQL la sube
en 1 cada vez que la reserva cambia.

1. El front pide una reserva y el back le manda su versión en el header `ETag: "1"`.
2. Al guardar, el front devuelve esa versión en el header `If-Match: "1"`.
3. El back actualiza **solo si la versión sigue igual**:
   ```sql
   UPDATE reservas SET ... WHERE id = $1 AND version = $2
   ```
4. Si otra persona guardó antes, la versión ya cambió, no se actualiza ninguna fila y el back
   responde **412** con la reserva como está ahora, para que el front le muestre al usuario
   qué cambió.

Además, una restricción `EXCLUDE` de PostgreSQL impide que dos reservas activas del mismo
espacio se crucen de horario, aunque lleguen al mismo tiempo. En ese caso el back responde **409**.

| Código | Cuándo |
|--------|--------|
| 400 | Datos inválidos (falta el responsable, fecha mal escrita, fin antes del inicio...) |
| 404 | El espacio o la reserva no existe |
| 409 | El horario se cruza con otra reserva, o la reserva ya está cancelada |
| 412 | Otra persona modificó la reserva antes (versión vieja) |
| 428 | Falta el header `If-Match` al editar o cancelar |

## Ver la base de datos en DBeaver

Nueva conexión → PostgreSQL → Host `localhost`, puerto `5432`, base de datos `repow_db`, con el
mismo usuario del `.env`. Para ver las reglas funcionando, abre `src/db/demo.sql` y corre cada
bloque por separado. Al terminar, `npm run db:setup` deja los datos como al inicio.
