import { nanoid } from 'nanoid';

const items = new Map();
let seqByYear = new Map(); // year -> int

function nextCode() {
  const y = new Date().getFullYear().toString();
  const cur = (seqByYear.get(y) || 0) + 1;
  seqByYear.set(y, cur);
  return `BH-${y}-${String(cur).padStart(3,'0')}`;
}

export function list(filters = {}) {
  const { status, q } = filters;
  const all = Array.from(items.values());
  return all.filter(o => {
    if (status && o.status !== status) return false;
    if (q) {
      const needle = String(q).toLowerCase();
      const hay = `${o.code} ${o.title} ${o.description} ${o.clientName} ${o.propertyCode}`.toLowerCase();
      return hay.includes(needle);
    }
    return true;
  });
}

export function get(id) { return items.get(id) || null; }

export function create(payload) {
  const id = nanoid(10);
  const now = new Date().toISOString();
  const obj = {
    id,
    code: nextCode(),
    status: 'OPEN',
    createdAt: now,
    updatedAt: now,
    ...payload
  };
  items.set(id, obj);
  return obj;
}

export function update(id, patch) {
  const cur = items.get(id);
  if (!cur) return null;
  const obj = { ...cur, ...patch, updatedAt: new Date().toISOString() };
  items.set(id, obj);
  return obj;
}

export function remove(id) {
  const cur = items.get(id);
  if (!cur) return false;
  if (!['DONE','CANCELED'].includes(cur.status)) return false;
  return items.delete(id);
}
