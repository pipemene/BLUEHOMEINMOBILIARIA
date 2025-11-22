require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./src/config/config');
const routes = require('./src/routes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

// Middlewares base
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan('dev'));

// CORS
app.use(cors({
  origin: config.frontendOrigin || '*'
}));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'bluehome-gestor-backend',
    timestamp: new Date().toISOString()
  });
});

// Rutas API
app.use('/api', routes);

// Manejo de errores centralizado
app.use(errorHandler);

// Arranque del servidor
const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Gestor Backend corriendo en puerto ${PORT}`);
});
