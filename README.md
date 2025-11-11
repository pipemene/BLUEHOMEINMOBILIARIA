# Blue Home – Gestor de Procesos (Monorepo)

Arquitectura **modular** para desplegar en **Railway** con repositorio en **GitHub**.

## Estructura
```
services/
  gateway/          # API Gateway (proxy hacia módulos)
  orders-service/   # Órdenes
  users-service/    # Usuarios
  techs-service/    # Técnicos
shared/
  utils/
```
Cada módulo es un servicio independiente que puedes desplegar como **service** distinto en Railway, apuntando al subdirectorio correspondiente.

## Despliegue en Railway (rápido)
1. Sube este repo a GitHub.
2. En Railway: **New Project → Deploy from GitHub Repo**.
3. Crea **4 servicios** desde el mismo repo:
   - `gateway` → root: `services/gateway`
   - `orders-service` → root: `services/orders-service`
   - `users-service` → root: `services/users-service`
   - `techs-service` → root: `services/techs-service`
4. En cada servicio configura `NODE_VERSION=18` y `PORT` (Railway inyecta una por defecto).
5. Copia las URLs públicas de cada microservicio y agrégalas como variables en `gateway`:
   - `ORDERS_URL=https://...`
   - `USERS_URL=https://...`
   - `TECHS_URL=https://...`
6. Deploy. El `gateway` expondrá:
   - `GET/POST/PUT/PATCH/DELETE /api/orders/*`
   - `GET/POST/PUT/PATCH/DELETE /api/users/*`
   - `GET/POST/PUT/PATCH/DELETE /api/techs/*`

> **Datos**: por defecto hay **almacenamiento en memoria**. Puedes reemplazarlo por Postgres (Railway) creando un adaptador en cada servicio.

## Scripts locales (Node 18+)
```bash
npm i
npm run dev:orders
npm run dev:users
npm run dev:techs
npm run dev:gateway
```
