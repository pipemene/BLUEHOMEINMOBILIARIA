# Backend (Google Sheets)

## Configuración
1. Copia `.env.example` a `.env` y completa:
   - `GOOGLE_CLIENT_EMAIL` y `GOOGLE_PRIVATE_KEY` del service account.
   - `GOOGLE_SHEETS_SPREADSHEET_ID` y rangos si usas nombres distintos.
2. Comparte la hoja con el correo del service account (al menos lectura/escritura).

## Endpoints útiles
- `GET /api/health`: estado básico.
- `GET /api/debug/sheets`: valida que las variables de entorno estén presentes y que se pueda leer
  la hoja de *Usuarios* y *Ordenes*. Devuelve encabezados detectados y cantidad de filas para
  ayudar a depurar despliegues en Railway u otros entornos.
