import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.static('public'));

app.get('/config.js', (_req, res)=>{
  res.type('application/javascript').send(`window.__CONFIG__ = {
    GATEWAY_BASE_URL: '${(process.env.GATEWAY_BASE_URL||'').replace(/'/g,"\'")}',
    PDF_URL: '${(process.env.PDF_URL||'').replace(/'/g,"\'")}',
    UPLOADS_URL: '${(process.env.UPLOADS_URL||'').replace(/'/g,"\'")}'
  };`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('▶ webapp listening on', PORT));
