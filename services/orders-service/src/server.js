import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => res.json({ ok:true, service: "orders-service" }));
app.use('/orders', router);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log('▶ orders-service listening on', PORT));
