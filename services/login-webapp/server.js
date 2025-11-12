import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';

dotenv.config();
const app = express();
app.use(morgan('dev'));
app.use(express.static('public'));
app.get('/config.js', (_req,res)=>{
  const map = process.env.REDIRECT_MAP || '{}';
  res.type('application/javascript').send(`window.__CFG__ = {
    AUTH_URL: '${(process.env.AUTH_URL||'').replace(/'/g,"\'")}',
    REDIRECT_URL: '${(process.env.REDIRECT_URL||'').replace(/'/g,"\'")}',
    REDIRECT_MAP: ${map}
  };`);
});
const roles=['admin','arriendos','tecnico','contabilidad','reparaciones'];
roles.forEach(r=> app.get('/'+r, (req,res)=> res.sendFile(process.cwd()+'/public/roles/'+r+'.html')) );
const PORT=process.env.PORT||3010; app.listen(PORT,()=>console.log('▶ login-webapp on',PORT));
