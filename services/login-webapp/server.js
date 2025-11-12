import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');

app.use(morgan('dev'));

app.get('/config.js', (_req, res) => {
  const map = process.env.REDIRECT_MAP || '{}';
  res.type('application/javascript').send(`window.__CFG__ = Object.assign({}, window.__CFG__ || {}, {
    AUTH_URL: '${(process.env.AUTH_URL || '').replace(/'/g, "\\'")}',
    REDIRECT_URL: '${(process.env.REDIRECT_URL || '').replace(/'/g, "\\'")}',
    REDIRECT_MAP: ${map}
  });`);
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.use(express.static(publicDir));

const roleViews = ['admin', 'arriendos', 'tecnico', 'contabilidad', 'reparaciones'];
roleViews.forEach((view) => {
  app.get(`/${view}`, (_req, res) => {
    res.sendFile(path.join(publicDir, 'roles', `${view}.html`));
  });
});

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => console.log('▶ login-webapp on', PORT));
