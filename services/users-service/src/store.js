import { nanoid } from 'nanoid';
const items = new Map();
export function list() { return Array.from(items.values()); }
export function get(id) { return items.get(id) || null; }
export function create(payload) {
  const id = nanoid(8);
  const now = new Date().toISOString();
  const obj = { id, createdAt: now, updatedAt: now, ...payload };
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
  return items.delete(id);
}
