# BlueHome – Login + Roles (Google Sheets) – Railway Ready

Servicios:
- `services/auth-service` (API Auth contra Google Sheets)
- `services/login-webapp` (Login + dashboards por rol)

Dashboards disponibles:
- /admin  · /arriendos · /tecnico · /contabilidad · /reparaciones

Cada dashboard valida `BH_TOKEN` en localStorage y expone datos básicos.
