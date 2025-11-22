const express = require('express');
const ordersRoutes = require('./ordersRoutes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'API Gestor Blue Home funcionando',
    endpoints: {
      health: '/api/health',
      orders: '/api/orders'
    }
  });
});

router.use('/orders', ordersRoutes);

// Aquí luego se agregan más módulos:
// router.use('/tecnicos', tecnicosRoutes);
// router.use('/usuarios', usuariosRoutes);
// router.use('/pdf', pdfRoutes);
// router.use('/drive', driveRoutes);

module.exports = router;
