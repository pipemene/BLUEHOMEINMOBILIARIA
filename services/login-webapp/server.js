import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';

dotenv.config();
const app = express();
app.use(morgan('dev'));
app.use(express.static('public'));

app.get('/config.js', (_req,res)=>{
  res.type('application/javascript').send(`window.__CFG__ = {
    AUTH_URL: '${(process.env.AUTH_URL||'').replace(/'/g,"\'")}',
    REDIRECT_URL: '${(process.env.REDIRECT_URL||'').replace(/'/g,"\'")}'
  };`);
});

const PORT = process.env.PORT || 3010;
app.listen(PORT, ()=> console.log('▶ login-webapp listening on', PORT));
