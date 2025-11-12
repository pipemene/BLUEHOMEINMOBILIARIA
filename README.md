# BlueHome – Login con Google Sheets (Railway Ready)

Incluye 2 servicios:

1) `services/auth-service` — API de autenticación (Google Sheets + JWT).
2) `services/login-webapp` — Frontend estático de Login.

Lee usuarios de una hoja con columnas: `email | password_hash | role | is_active`.
Soporta bcrypt (si `password_hash` inicia con `$2`), o texto plano (solo pruebas).

### Variables

**auth-service**
```
PORT=4015
JWT_SECRET=<secreto>
GOOGLE_SHEETS_ID=<ID>
GOOGLE_SHEETS_RANGE=Usuarios!A:D
GOOGLE_SERVICE_ACCOUNT_B64=<json key en base64>
ALLOWED_ORIGINS=https://tu-webapp.up.railway.app,http://localhost:3010
```

**login-webapp**
```
PORT=3010
AUTH_URL=https://<auth-service>.up.railway.app
REDIRECT_URL=https://<tu-panel>.up.railway.app
```
