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

app.get('/', (_req, res) => res.json({ ok:true, service: "users-service" }));
app.use('/users', router);

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => console.log('▶ users-service listening on', PORT));
