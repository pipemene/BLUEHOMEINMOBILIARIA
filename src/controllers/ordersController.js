const ordersService = require('../services/ordersService');

async function create(req, res, next) {
  try {
    const order = await ordersService.createOrder({
      ...req.body,
      creadoPor: req.body.creadoPor || 'backend'
    });
    res.status(201).json({
      ok: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const filters = {
      status: req.query.status,
      inmuebleCodigo: req.query.inmuebleCodigo,
      tecnicoAsignado: req.query.tecnicoAsignado
    };

    const orders = await ordersService.listOrders(filters);
    res.json({
      ok: true,
      data: orders
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const order = await ordersService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({
        ok: false,
        message: 'Orden no encontrada'
      });
    }
    res.json({
      ok: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const updated = await ordersService.updateOrder(req.params.id, req.body);
    res.json({
      ok: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  list,
  getById,
  update
};
