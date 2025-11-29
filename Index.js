// index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({ origin: '*' })); // Permitir Apps Script
app.use(express.json());

// Rutas
const authRoutes = require('./routes/auth.routes');
const ordenesRoutes = require('./routes/ordenes.routes');
const usuariosRoutes = require('./routes/usuarios.routes');

app.use('/api/auth', authRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.status(200).send('Bienvenido al Backend de Blue Home Inmobiliaria.');
});

// Inicializar Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
