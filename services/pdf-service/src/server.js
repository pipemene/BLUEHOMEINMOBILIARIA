import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import puppeteer from 'puppeteer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/', (_req,res)=>res.json({ ok:true, service:'pdf-service' }));

function htmlFor(order, stage='MANTENIMIENTO') {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{font-family:Arial,sans-serif;padding:24px;color:#111}
    h1{font-size:20px;margin:0 0 4px 0}.muted{color:#555;font-size:12px}.section{margin-top:16px}
    table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;font-size:12px}th{background:#f5f5f5;text-align:left}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.photo{width:100%;height:140px;object-fit:cover;border:1px solid #ddd}
  </style></head><body>
  <h1>Orden ${order.code} – ${stage}</h1>
  <div class="muted">Fecha: ${new Date().toLocaleString('es-CO')}</div>
  <div class="section"><table>
    <tr><th>Código</th><td>${order.code}</td><th>Estado</th><td>${order.status}</td></tr>
    <tr><th>Título</th><td colspan="3">${order.title||''}</td></tr>
    <tr><th>Descripción</th><td colspan="3">${order.description||''}</td></tr>
    <tr><th>Cliente</th><td>${order.clientName||''}</td><th>Teléfono</th><td>${order.clientPhone||''}</td></tr>
    <tr><th>Inmueble</th><td>${order.propertyCode||''}</td><th>Prioridad</th><td>${order.priority||''}</td></tr>
  </table></div>
  ${Array.isArray(order.photos)&&order.photos.length ? `<div class="section"><h3>Fotos</h3><div class="grid">${order.photos.map(p=>`<img class="photo" src="${p}">`).join('')}</div></div>`:''}
  <div class="section"><h3>Firmas</h3><div class="grid">
    <div><div class="muted">Cliente</div>${order.customerSignatureUrl?`<img class="photo" src="${order.customerSignatureUrl}">`:'<div class="muted">— Sin firma —</div>'}</div>
    <div><div class="muted">Técnico</div>${order.techSignatureUrl?`<img class="photo" src="${order.techSignatureUrl}">`:'<div class="muted">— Sin firma —</div>'}</div>
    <div><div class="muted">Facturación</div>${order.billingSignatureUrl?`<img class="photo" src="${order.billingSignatureUrl}">`:'<div class="muted">— Sin firma —</div>'}</div>
  </div></div>
  ${order.ownerDiscount?`<div class="section"><h3>Descuento Propietario</h3><div>${order.ownerDiscount}</div></div>`:''}
  ${order.invoiceUrl?`<div class="section"><h3>Factura</h3><div class="muted">Enlace: ${order.invoiceUrl}</div></div>`:''}
  </body></html>`;
}

app.post('/orders/:id/pdf', async (req, res) => {
  try {
    const id = req.params.id;
    const { stage } = req.body || {};
    const base = process.env.GATEWAY_BASE_URL;
    if (!base) return res.status(500).json({ ok:false, error:'GATEWAY_BASE_URL not set' });
    const r = await fetch(`${base.replace(/\/+$/,'')}/api/orders/${encodeURIComponent(id)}`);
    if (!r.ok) return res.status(404).json({ ok:false, error:'Order not found' });
    const order = await r.json();

    const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const html = htmlFor(order, stage || 'MANTENIMIENTO');
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({ format:'A4', printBackground:true });
    await browser.close();

    const b64 = Buffer.from(pdf).toString('base64');
    res.json({ ok:true, contentType:'application/pdf', base64: b64, filename: `BH-${order.code}-${stage||'MANTENIMIENTO'}.pdf` });
  } catch (e) {
    res.status(500).json({ ok:false, error: String(e.message || e) });
  }
});

const PORT = process.env.PORT || 4020;
app.listen(PORT, ()=> console.log('▶ pdf-service listening on', PORT));
