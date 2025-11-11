import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const targets = {
  orders: process.env.ORDERS_URL,
  users: process.env.USERS_URL,
  techs: process.env.TECHS_URL,
};

function mkProxy(target) {
  if (!target) return (req,res)=>res.status(502).json({ ok:false, error:'Target not configured' });
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => path.replace(/^\/api\/(orders|users|techs)/, ''),
  });
}

app.get('/', (_req, res) => res.json({ ok:true, service: 'gateway', targets }));

app.use('/api/orders', mkProxy(targets.orders));
app.use('/api/users', mkProxy(targets.users));
app.use('/api/techs', mkProxy(targets.techs));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('▶ gateway listening on', PORT));
