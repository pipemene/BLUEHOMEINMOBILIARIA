const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// NOTA: Esto es almacenamiento temporal en archivo JSON.
// En producción deberíamos cambiarlo a BD o Google Sheets.
const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'orders.json');

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
  }
}

function readAll() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    logger.error('Error parseando orders.json, reiniciando archivo.', e);
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
    return [];
  }
}

function writeAll(orders) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), 'utf-8');
}

function generateCode() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const ts = `${year}${month}${day}`;

  const orders = readAll();
  const todayOrders = orders.filter(o => o.code.startsWith(`BH-${ts}`));
  const seq = String(todayOrders.length + 1).padStart(3, '0');

  return `BH-${ts}-${seq}`;
}

async function createOrder(payload) {
  const orders = readAll();

  const code = generateCode();
  const now = new Date().toISOString();

  const order = {
    id: uuidv4(),
    code,
    createdAt: now,
    updatedAt: now,
    status: 'pendiente',
    // Campos base del Gestor de Reparaciones
    inmuebleCodigo: payload.inmuebleCodigo || null,
    inmuebleDireccion: payload.inmuebleDireccion || null,
    arrendatarioNombre: payload.arrendatarioNombre || null,
    arrendatarioTelefono: payload.arrendatarioTelefono || null,
    tipoOrden: payload.tipoOrden || 'reparacion',
    descripcion: payload.descripcion || '',
    prioridad: payload.prioridad || 'media',
    tecnicoAsignado: payload.tecnicoAsignado || null,
    fechaProgramada: payload.fechaProgramada || null,
    evidencias: [], // se llenará con fotos/archivos
    historial: [
      {
        fecha: now,
        usuario: payload.creadoPor || 'sistema',
        accion: 'creacion',
        detalle: 'Orden creada en el sistema'
      }
    ]
  };

  orders.push(order);
  writeAll(orders);

  return order;
}

async function listOrders(filters = {}) {
  const orders = readAll();

  let result = orders;

  if (filters.status) {
    result = result.filter(o => o.status === filters.status);
  }

  if (filters.inmuebleCodigo) {
    result = result.filter(o => o.inmuebleCodigo === filters.inmuebleCodigo);
  }

  if (filters.tecnicoAsignado) {
    result = result.filter(o => o.tecnicoAsignado === filters.tecnicoAsignado);
  }

  return result;
}

async function getOrderById(id) {
  const orders = readAll();
  return orders.find(o => o.id === id) || null;
}

async function updateOrder(id, data) {
  const orders = readAll();
  const index = orders.findIndex(o => o.id === id);

  if (index === -1) {
    const err = new Error('Orden no encontrada');
    err.status = 404;
    throw err;
  }

  const now = new Date().toISOString();
  const current = orders[index];

  const updated = {
    ...current,
    ...data,
    updatedAt: now
  };

  // Historial
  if (data._historial) {
    updated.historial = [
      ...(current.historial || []),
      {
        fecha: now,
        usuario: data._historial.usuario || 'sistema',
        accion: data._historial.accion || 'actualizacion',
        detalle: data._historial.detalle || ''
      }
    ];
    delete data._historial;
  }

  orders[index] = updated;
  writeAll(orders);

  return updated;
}

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  updateOrder
};
