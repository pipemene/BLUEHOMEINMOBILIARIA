const express = require('express');
const controller = require('../controllers/ordersController');
const authApiKey = require('../middlewares/authApiKey');

const router = express.Router();

// Todas las rutas de órdenes protegidas por API key por ahora
router.use(authApiKey);

// Crear orden
router.post('/', controller.create);

// Listar órdenes con filtros (status, inmuebleCodigo, tecnicoAsignado)
router.get('/', controller.list);

// Obtener una orden por ID
router.get('/:id', controller.getById);

// Actualizar una orden
router.put('/:id', controller.update);
router.patch('/:id', controller.update);

module.exports = router;
