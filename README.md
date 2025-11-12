# BlueHome – Railway Frontend Suite (webapp + uploads + pdf)

Este repo trae **3 servicios** listos para Railway y pensados para integrarse con tu **gateway** actual:

1) `services/webapp` – Frontend estático (Express) con:
   - Lista de órdenes con filtros (estado + búsqueda).
   - Detalle de orden: edición, fotos, **firmas** (SignaturePad), **factura** + **descuento**.
   - Botones para **PDF → Mantenimiento** y **PDF → Facturación** (usa `pdf-service`).

2) `services/uploads-service` – API para subir **imágenes** y **PDF** a **Cloudinary**.
   - Endpoint: `POST /upload` con `{ dataUrl, folder }` → `{ url }`.

3) `services/pdf-service` – Genera **PDF** con **Puppeteer** (HTML → PDF) y lo devuelve como **base64**.
   - Endpoint: `POST /orders/:id/pdf` con `{ stage }` → `{ base64, filename }`.
   - El servicio **lee la orden** desde tu `GATEWAY_BASE_URL` (`/api/orders/:id`).

> **Nota**: El PDF viene en base64; el frontend lo abre en una pestaña nueva. Si luego quieres **subir el PDF a Cloudinary**, podemos ajustarlo.

## Despliegue rápido en Railway
1. **Fork o sube** este repo a GitHub.
2. En Railway, crea **3 servicios** desde el repo, apuntando a:
   - `services/webapp`
   - `services/uploads-service`
   - `services/pdf-service`
3. Configura variables de entorno:

### `services/webapp`
```
PORT=3000
GATEWAY_BASE_URL=https://<tu-gateway>
PDF_URL=https://<tu-pdf-service>
UPLOADS_URL=https://<tu-uploads-service>
```

### `services/uploads-service`
```
PORT=4010
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=bluehome/gestor
```

### `services/pdf-service`
```
PORT=4020
GATEWAY_BASE_URL=https://<tu-gateway>
```

4. Abre el `webapp` y prueba:
   - Filtros → abrir una orden.
   - Subir foto → se guarda en Cloudinary y se **actualiza la orden** con la URL.
   - Firmar cliente/técnico/facturación → se sube a Cloudinary y se **guarda en la orden**.
   - Subir factura (imagen o PDF) + registrar **descuento propietario**.
   - Generar **PDF** → se abre en nueva pestaña.

## Integración con ManyChat
- ManyChat puede **consumir el gateway** o **disparar el pdf-service** / **uploads-service** en flujos.
- Recomendado: exponer endpoints del gateway bajo `/api/...` y usar estos servicios como **infra** de archivos y PDFs.
