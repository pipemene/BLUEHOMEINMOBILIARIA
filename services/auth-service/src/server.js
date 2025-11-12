import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';

dotenv.config();
const app = express();
app.use(express.json());
app.use(morgan('dev'));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error('Origin not allowed by CORS'));
  },
  credentials: true
}));

function decodeServiceAccount () {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
  if (!b64) throw new Error('GOOGLE_SERVICE_ACCOUNT_B64 not set');
  return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
}

async function getSheets () {
  const auth = new google.auth.GoogleAuth({
    credentials: decodeServiceAccount(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  return google.sheets({ version: 'v4', auth });
}

async function fetchUsers () {
  const sheets = await getSheets();
  const range = process.env.GOOGLE_SHEETS_RANGE || 'usuarios!A:D';
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range
  });
  const rows = res.data.values || [];
  if (!rows.length) return [];

  const [headers, ...data] = rows;
  const idx = (key) => headers.findIndex((h) => (h || '').toString().toLowerCase().trim() === key);
  const uI = idx('usuario');
  const pI = idx('contrasena');
  const rI = idx('rol');
  const aI = idx('activo');
  return data
    .map((row) => ({
      username: (row[uI] || '').toString().trim().toLowerCase(),
      password: (row[pI] || '').toString(),
      role: (row[rI] || '').toString().trim().toLowerCase(),
      is_active: aI >= 0 ? ((row[aI] || '').toString().toLowerCase() === 'true') : true
    }))
    .filter((u) => u.username);
}

function verifyPassword (incoming, stored) {
  if (!stored) return false;
  if (stored.startsWith('$2')) {
    console.warn('⚠️ bcrypt hash detectado, asegúrate de habilitar verificación por bcrypt en el entorno.');
    return false;
  }
  return incoming === stored;
}

app.get('/', (_req, res) => res.json({ ok: true, service: 'auth-service' }));

app.post('/auth/login', async (req, res) => {
  try {
    const { usuario, username, email, password } = req.body || {};
    const userKey = (usuario || username || email || '').toString().trim().toLowerCase();
    if (!userKey || !password) {
      return res.status(400).json({ ok: false, error: 'usuario y password requeridos' });
    }
    const users = await fetchUsers();
    const user = users.find((u) => u.username === userKey);
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }
    if (!user.is_active) {
      return res.status(403).json({ ok: false, error: 'Usuario inactivo' });
    }

    const valid = verifyPassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ sub: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ ok: true, token, user: { username: user.username, role: user.role } });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

const PORT = process.env.PORT || 4015;
app.listen(PORT, () => console.log('▶ auth-service on', PORT));
