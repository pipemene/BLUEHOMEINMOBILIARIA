import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { google } from 'googleapis';

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan('dev'));

const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowed.includes(origin)) return cb(null, true);
    return cb(null, true);
  },
  credentials: true
}));

function decodeServiceAccount(){
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
  if(!b64) throw new Error('GOOGLE_SERVICE_ACCOUNT_B64 not set');
  const json = Buffer.from(b64, 'base64').toString('utf8');
  return JSON.parse(json);
}

async function getSheets(){
  const creds = decodeServiceAccount();
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  return google.sheets({ version: 'v4', auth });
}

async function fetchUsers(){
  const sheets = await getSheets();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const range = process.env.GOOGLE_SHEETS_RANGE || 'Usuarios!A:D';
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = res.data.values || [];
  if (!rows.length) return [];
  const [headers, ...data] = rows;
  const idx = (k) => headers.findIndex(h => (h||'').toString().toLowerCase().trim() === k);
  const eI = idx('email'), pI = idx('password_hash'), rI = idx('role'), aI = idx('is_active');
  return data.map(r => ({
    email: (r[eI]||'').toString().trim().toLowerCase(),
    password_hash: (r[pI]||'').toString(),
    role: (r[rI]||'').toString(),
    is_active: ((r[aI]||'').toString().toLowerCase() === 'true')
  }));
}

function toUserRow(u){ return { email: u.email, role: u.role }; }
function signToken(u){ return jwt.sign({ sub: u.email, role: u.role }, process.env.JWT_SECRET, { expiresIn: '12h' }); }

app.get('/', (_req,res)=>res.json({ ok:true, service:'auth-service' }));

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if(!email || !password) return res.status(400).json({ ok:false, error:'email and password required' });
    const users = await fetchUsers();
    const u = users.find(x => x.email === String(email).toLowerCase().trim());
    if(!u) return res.status(401).json({ ok:false, error:'Credenciales inválidas' });
    if(u.is_active === false) return res.status(403).json({ ok:false, error:'Usuario inactivo' });

    let ok = false;
    if(u.password_hash && u.password_hash.startsWith('$2')) ok = bcrypt.compareSync(password, u.password_hash);
    else ok = (password === u.password_hash);

    if(!ok) return res.status(401).json({ ok:false, error:'Credenciales inválidas' });

    const token = signToken(u);
    res.json({ ok:true, token, user: toUserRow(u) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, error: String(e.message || e) });
  }
});

const PORT = process.env.PORT || 4015;
app.listen(PORT, ()=> console.log('▶ auth-service listening on', PORT));
