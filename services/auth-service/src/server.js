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

const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);
app.use(cors({ origin: (o,cb)=>cb(null,true), credentials:true })); // relajado

function decodeServiceAccount(){ const b64=process.env.GOOGLE_SERVICE_ACCOUNT_B64; if(!b64) throw new Error('GOOGLE_SERVICE_ACCOUNT_B64 not set'); return JSON.parse(Buffer.from(b64,'base64').toString('utf8')); }
async function getSheets(){ const auth=new google.auth.GoogleAuth({credentials:decodeServiceAccount(), scopes:['https://www.googleapis.com/auth/spreadsheets.readonly']}); return google.sheets({version:'v4',auth}); }
async function fetchUsers(){
  const sh=await getSheets(); const res=await sh.spreadsheets.values.get({ spreadsheetId:process.env.GOOGLE_SHEETS_ID, range:process.env.GOOGLE_SHEETS_RANGE||'usuarios!A:D' });
  const rows=res.data.values||[]; if(!rows.length) return [];
  const [headers,...data]=rows;
  const idx=k=>headers.findIndex(h=>(h||'').toString().toLowerCase().trim()===k);
  const uI=idx('usuario'), pI=idx('contrasena'), rI=idx('rol'), aI=idx('activo');
  return data.map(r=>({
    username:(r[uI]||'').toString().trim().toLowerCase(),
    password:(r[pI]||'').toString(),
    role:(r[rI]||'').toString().trim().toLowerCase(),
    is_active: aI>=0 ? ((r[aI]||'').toString().toLowerCase()==='true') : true
  })).filter(u=>u.username);
}
app.get('/',(_q,res)=>res.json({ok:true,service:'auth-service'}));
app.post('/auth/login', async (req,res)=>{
  try{
    const { usuario, username, email, password } = req.body||{};
    const userKey=(usuario||username||email||'').toString().trim().toLowerCase();
    if(!userKey||!password) return res.status(400).json({ok:false,error:'usuario y password requeridos'});
    const users=await fetchUsers(); const u=users.find(x=>x.username===userKey);
    if(!u) return res.status(401).json({ok:false,error:'Credenciales inválidas'});
    if(!u.is_active) return res.status(403).json({ok:false,error:'Usuario inactivo'});
    const ok=(password===u.password); // texto plano por ahora
    if(!ok) return res.status(401).json({ok:false,error:'Credenciales inválidas'});
    const token=jwt.sign({sub:u.username, role:u.role}, process.env.JWT_SECRET, {expiresIn:'12h'});
    res.json({ok:true, token, user:{username:u.username, role:u.role}});
  }catch(e){ res.status(500).json({ok:false,error:String(e.message||e)}); }
});
const PORT=process.env.PORT||4015; app.listen(PORT,()=>console.log('▶ auth-service on',PORT));
