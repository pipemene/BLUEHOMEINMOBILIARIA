import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');

const DEFAULT_CFG = {
  AUTH_URL: 'http://localhost:4015',
  REDIRECT_URL: '/admin',
  REDIRECT_MAP: {
    superadmin: '/admin',
    admin: '/admin',
    administrador: '/admin',
    arrendamiento: '/arriendos',
    arriendos: '/arriendos',
    tecnico: '/tecnico',
    técnico: '/tecnico',
    contabilidad: '/contabilidad',
    finanzas: '/contabilidad',
    reparaciones: '/reparaciones',
    postventa: '/reparaciones'
  }
};

const ROLE_VIEWS = ['admin', 'arriendos', 'tecnico', 'contabilidad', 'reparaciones'];

function safeParseMap (raw) {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn('REDIRECT_MAP inválido, usando valores por defecto:', err.message);
    return {};
  }
}

app.use(morgan('dev'));

app.get('/config.js', (_req, res) => {
  const envMap = safeParseMap(process.env.REDIRECT_MAP);
  const mergedMap = { ...DEFAULT_CFG.REDIRECT_MAP, ...envMap };
  const payload = {
    AUTH_URL: process.env.AUTH_URL || DEFAULT_CFG.AUTH_URL,
    REDIRECT_URL: process.env.REDIRECT_URL || DEFAULT_CFG.REDIRECT_URL,
    REDIRECT_MAP: mergedMap
  };

  res
    .type('application/javascript')
    .send(`window.__CFG__ = Object.assign({}, window.__CFG__ || {}, ${JSON.stringify(payload)});`);
});

app.use(express.static(publicDir));

app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

ROLE_VIEWS.forEach((view) => {
  app.get(`/${view}`, (_req, res) => {
    res.sendFile(path.join(publicDir, 'roles', `${view}.html`));
  });
});

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => console.log('▶ login-webapp on', PORT));
