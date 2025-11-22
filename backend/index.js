const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req,res)=>res.json({ status:'ok', service:'gestor-backend'}));

const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=> console.log("Backend running on port", PORT));
