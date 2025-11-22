# Blue Home - Gestor de Procesos (Backend B)

Backend base en **Node.js + Express** para el Gestor de Procesos / Gestor de Reparaciones de Blue Home Inmobiliaria.

Este servicio está pensado para correr en **Railway** y ser consumido por:
- Frontend en Google Apps Script (HTML/JS).
- Integraciones futuras (ManyChat, widgets web, etc.).

## 🚀 Características incluidas en esta base

- Estructura modular (routes, controllers, services, middlewares).
- Endpoint de healthcheck: `GET /api/health`.
- Módulo inicial de **órdenes**:
  - `POST /api/orders` → crear orden.
  - `GET /api/orders` → listar con filtros.
  - `GET /api/orders/:id` → obtener por ID.
  - `PUT/PATCH /api/orders/:id` → actualizar.
- Generación automática de código de orden tipo: `BH-YYYYMMDD-001`.
- Middleware de autenticación por `x-api-key` (configurable por `.env`).
- Manejo de errores centralizado.
- Almacenamiento temporal en archivo `data/orders.json` (para prueba rápida).

> ⚠️ Nota: el almacenamiento en archivo es **temporal** y no persiste entre despliegues grandes en Railway. Luego se cambiará a BD o Google Sheets/Drive según tu decisión.

## 🛠️ Configuración local

1. Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

2. Edita `.env` con tus valores:

- `PORT`
- `INTERNAL_API_KEY`
- `FRONTEND_ORIGIN`
- (luego) credenciales de Google Service Account.

3. Instala dependencias:

```bash
npm install
```

4. Ejecuta en desarrollo:

```bash
npm run dev
```

5. O en modo producción:

```bash
npm start
```

## 🔐 Autenticación sencilla (por ahora)

Todas las rutas bajo `/api/orders` están protegidas con header:

```http
x-api-key: TU_INTERNAL_API_KEY
```

El valor se define en `.env` (`INTERNAL_API_KEY`).

Más adelante se podrá reemplazar por un sistema de usuarios/roles con login.

## 📦 Estructura

```bash
bluehome-gestor-backend
├── index.js
├── package.json
├── .env.example
├── README.md
├── src
│   ├── config
│   │   └── config.js
│   ├── controllers
│   │   └── ordersController.js
│   ├── middlewares
│   │   ├── authApiKey.js
│   │   └── errorHandler.js
│   ├── routes
│   │   ├── index.js
│   │   └── ordersRoutes.js
│   ├── services
│   │   └── ordersService.js
│   └── utils
│       └── logger.js
└── data
    └── orders.json (se crea automáticamente)
```

Con esto tienes una base sólida para seguir montando:

- Módulo de técnicos.
- Módulo de usuarios y roles.
- Subida de evidencias a Google Drive.
- Generación de PDF con firmas.
- Flujo de mantenimiento → facturación.

Listo para subirlo a Railway como servicio **B (backend)**.
