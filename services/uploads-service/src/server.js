import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(morgan('dev'));

app.get('/', (_req, res) => res.json({ ok:true, service:'uploads-service' }));

app.post('/upload', async (req, res) => {
  try {
    const { dataUrl, folder } = req.body || {};
    if (!dataUrl) return res.status(400).json({ ok:false, error:'dataUrl required' });
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: folder || process.env.CLOUDINARY_UPLOAD_FOLDER || 'bluehome/gestor',
      resource_type: 'auto'
    });
    res.json({ ok:true, url: result.secure_url, public_id: result.public_id });
  } catch (e) {
    res.status(500).json({ ok:false, error: String(e.message || e) });
  }
});

const PORT = process.env.PORT || 4010;
app.listen(PORT, ()=> console.log('▶ uploads-service listening on', PORT));
