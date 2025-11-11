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

app.get('/', (_req, res) => res.json({ ok:true, service: "techs-service" }));
app.use('/techs', router);

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => console.log('▶ techs-service listening on', PORT));
