const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const USERS_RANGE = process.env.GOOGLE_SHEETS_USERS_RANGE || 'Usuarios!A:D';
const ORDERS_RANGE = process.env.GOOGLE_SHEETS_ORDERS_RANGE || 'Ordenes!A:K';

const USER_HEADER_MAP = {
  email: ['correo', 'email', 'usuario'],
  password: ['password', 'contrasena', 'clave'],
  role: ['rol', 'role', 'perfil'],
  name: ['nombre', 'name']
};

const ORDER_HEADER_MAP = {
  id: ['id', 'ordenid', 'orderid'],
  code: ['code', 'codigo', 'codigoorden'],
  inmuebleDireccion: ['inmueble', 'direccion', 'inmuebledireccion', 'inmueble/direccion'],
  inmuebleCodigo: ['codigoinmueble', 'inmueblecodigo'],
  arrendatarioNombre: ['arrendatario', 'arrendatarionombre', 'cliente'],
  arrendatarioTelefono: ['arrendatariotelefono', 'telefono'],
  tipoOrden: ['tipoorden', 'tipo'],
  descripcion: ['descripcion', 'detalle'],
  status: ['status', 'estado'],
  tecnicoAsignado: ['tecnicoasignado', 'tecnico'],
  fechaProgramada: ['fechaprogramada', 'fecha'],
  prioridad: ['prioridad'],
  createdAt: ['createdat', 'creacion', 'fechacreacion'],
  updatedAt: ['updatedat', 'ultimaactualizacion', 'fechactualizacion']
};

function normalizeKey(value = '') {
  return value.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function resolveHeaderKey(map, header) {
  const normalized = normalizeKey(header);
  for (const [key, candidates] of Object.entries(map)) {
    if (candidates.includes(normalized)) return key;
  }
  return normalized;
}

function getSheetsClient() {
  if (!SPREADSHEET_ID) {
    throw new Error('Falta configurar GOOGLE_SHEETS_SPREADSHEET_ID');
  }

  const privateKey = process.env.GOOGLE_PRIVATE_KEY
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  return google.sheets({ version: 'v4', auth });
}

async function readSheet(range) {
  const sheets = getSheetsClient();
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range
  });
  return data.values || [];
}

function sheetNameFromRange(range) {
  return range.includes('!') ? range.split('!')[0] : range;
}

function columnLetterFromIndex(index) {
  let n = index;
  let result = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result || 'A';
}

function mapRowToObject(row, headerKeys) {
  return headerKeys.reduce((acc, key, idx) => {
    acc[key] = row[idx] ?? '';
    return acc;
  }, {});
}

async function fetchUsersFromSheet() {
  const values = await readSheet(USERS_RANGE);
  if (!values.length) {
    throw new Error('La hoja de usuarios no tiene datos');
  }

  const headers = values[0];
  const emailIdx = headers.findIndex((h) => USER_HEADER_MAP.email.includes(normalizeKey(h)));
  const passwordIdx = headers.findIndex((h) => USER_HEADER_MAP.password.includes(normalizeKey(h)));
  const roleIdx = headers.findIndex((h) => USER_HEADER_MAP.role.includes(normalizeKey(h)));
  const nameIdx = headers.findIndex((h) => USER_HEADER_MAP.name.includes(normalizeKey(h)));

  if ([emailIdx, passwordIdx, roleIdx].some((idx) => idx === -1)) {
    throw new Error('No se encontraron las columnas de correo, contraseña o rol en la hoja');
  }

  return values.slice(1).map((row) => ({
    email: (row[emailIdx] || '').toString().trim().toLowerCase(),
    password: row[passwordIdx] || '',
    role: row[roleIdx] || 'usuario',
    name: nameIdx >= 0 ? row[nameIdx] || '' : ''
  }));
}

async function fetchOrdersData() {
  const values = await readSheet(ORDERS_RANGE);
  if (!values.length) {
    throw new Error('La hoja de órdenes no tiene datos');
  }

  const headers = values[0];
  const headerKeys = headers.map((h) => resolveHeaderKey(ORDER_HEADER_MAP, h));
  const rows = values.slice(1);
  const orders = rows.map((row) => mapRowToObject(row, headerKeys));

  return { headers, headerKeys, rows, orders };
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'gestor-backend' }));

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Correo y contraseña son obligatorios.' });
  }

  try {
    const users = await fetchUsersFromSheet();
    const normalizedEmail = email.toString().trim().toLowerCase();
    const user = users.find((u) => u.email === normalizedEmail && u.password === password);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
    }

    return res.json({
      success: true,
      data: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en /api/login', error);
    return res.status(500).json({ success: false, message: 'No se pudo validar el usuario', error: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const { orders } = await fetchOrdersData();
    const { status, inmuebleCodigo, tecnicoAsignado } = req.query;

    const filtered = orders.filter((order) => {
      const matchesStatus = status
        ? (order.status || '').toString().toLowerCase() === status.toString().toLowerCase()
        : true;
      const matchesCodigo = inmuebleCodigo
        ? (order.inmuebleCodigo || '').toString().toLowerCase().includes(inmuebleCodigo.toString().toLowerCase())
        : true;
      const matchesTecnico = tecnicoAsignado
        ? (order.tecnicoAsignado || '').toString().toLowerCase().includes(tecnicoAsignado.toString().toLowerCase())
        : true;
      return matchesStatus && matchesCodigo && matchesTecnico;
    });

    return res.json({ success: true, data: filtered });
  } catch (error) {
    console.error('Error en GET /api/orders', error);
    return res.status(500).json({ success: false, message: 'No se pudieron cargar las órdenes', error: error.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { orders } = await fetchOrdersData();
    const order = orders.find((o) => o.id === id || o.code === id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }

    return res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error en GET /api/orders/:id', error);
    return res.status(500).json({ success: false, message: 'No se pudo obtener la orden', error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { headers, headerKeys, orders } = await fetchOrdersData();
    const sheets = getSheetsClient();
    const now = new Date();
    const id = req.body.id || `ORD-${now.getTime()}`;
    const code = req.body.code || `BH-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${
      orders.length + 1
    }`;
    const timestamp = now.toISOString();

    const newOrder = {
      status: 'pendiente',
      ...req.body,
      id,
      code,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const sheetName = sheetNameFromRange(ORDERS_RANGE);
    const rowValues = headers.map((_, idx) => newOrder[headerKeys[idx]] || '');

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowValues]
      }
    });

    return res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error('Error en POST /api/orders', error);
    return res.status(500).json({ success: false, message: 'No se pudo crear la orden', error: error.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { headers, headerKeys, rows, orders } = await fetchOrdersData();
    const targetIndex = orders.findIndex((o) => o.id === id || o.code === id);

    if (targetIndex === -1) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }

    const existing = orders[targetIndex];
    const updatedOrder = {
      ...existing,
      ...req.body,
      id: existing.id,
      code: existing.code,
      updatedAt: new Date().toISOString()
    };

    const sheets = getSheetsClient();
    const sheetName = sheetNameFromRange(ORDERS_RANGE);
    const endColumn = columnLetterFromIndex(headers.length);
    const rowNumber = targetIndex + 2; // +1 for zero index, +1 for header row
    const range = `${sheetName}!A${rowNumber}:${endColumn}${rowNumber}`;
    const updatedRow = headers.map((_, idx) => updatedOrder[headerKeys[idx]] || rows[targetIndex][idx] || '');

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: { values: [updatedRow] }
    });

    return res.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Error en PUT /api/orders/:id', error);
    return res.status(500).json({ success: false, message: 'No se pudo actualizar la orden', error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('Backend running on port', PORT));
