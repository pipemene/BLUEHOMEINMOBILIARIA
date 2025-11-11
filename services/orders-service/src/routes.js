import { Router } from 'express';
import * as db from './store.js';
import { CreateOrder, UpdateOrder, canTransition } from './schema.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true, service: 'orders-service', ts: new Date().toISOString() }));

// List with filters: ?status=&q=
router.get('/', (req, res) => {
  const { status, q } = req.query;
  const data = db.list({ status, q });
  res.json(data);
});

// Create
router.post('/', (req, res) => {
  const parse = CreateOrder.safeParse(req.body || {});
  if (!parse.success) return res.status(400).json({ ok:false, error: parse.error.format() });
  const created = db.create(parse.data);
  res.status(201).json(created);
});

// Get by id
router.get('/:id', (req, res) => {
  const x = db.get(req.params.id);
  if (!x) return res.status(404).json({ ok:false, error:'Not found' });
  res.json(x);
});

// Update / transition
router.put('/:id', (req, res) => {
  const cur = db.get(req.params.id);
  if (!cur) return res.status(404).json({ ok:false, error:'Not found' });

  const parse = UpdateOrder.safeParse(req.body || {});
  if (!parse.success) return res.status(400).json({ ok:false, error: parse.error.format() });

  if (parse.data.status && !canTransition(cur.status, parse.data.status)) {
    return res.status(409).json({ ok:false, error:`Invalid transition ${cur.status} -> ${parse.data.status}` });
  }

  const updated = db.update(req.params.id, parse.data);
  res.json(updated);
});

router.patch('/:id', (req, res) => {
  const cur = db.get(req.params.id);
  if (!cur) return res.status(404).json({ ok:false, error:'Not found' });

  const parse = UpdateOrder.safeParse(req.body || {});
  if (!parse.success) return res.status(400).json({ ok:false, error: parse.error.format() });

  if (parse.data.status && !canTransition(cur.status, parse.data.status)) {
    return res.status(409).json({ ok:false, error:`Invalid transition ${cur.status} -> ${parse.data.status}` });
  }

  const updated = db.update(req.params.id, parse.data);
  res.json(updated);
});

// Delete only if DONE or CANCELED
router.delete('/:id', (req, res) => {
  const ok = db.remove(req.params.id);
  if (!ok) return res.status(409).json({ ok:false, error:'Only DONE or CANCELED can be deleted (or not found)' });
  res.json({ ok:true });
});

export default router;
