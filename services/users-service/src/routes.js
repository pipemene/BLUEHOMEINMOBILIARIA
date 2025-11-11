import { Router } from 'express';
import * as db from './store.js';
const router = Router();

// Health
router.get('/health', (_req, res) => res.json({ ok: true, service: "users-service", ts: new Date().toISOString() }));

// CRUD
router.get('/', (_req, res) => res.json(db.list()));
router.post('/', (req, res) => res.status(201).json(db.create(req.body || {})));
router.get('/:id', (req, res) => { const x = db.get(req.params.id); if (!x) return res.status(404).json({ ok:false, error:'Not found' }); res.json(x); });
router.put('/:id', (req, res) => { const x = db.update(req.params.id, req.body || {}); if (!x) return res.status(404).json({ ok:false, error:'Not found' }); res.json(x); });
router.patch('/:id', (req, res) => { const x = db.update(req.params.id, req.body || {}); if (!x) return res.status(404).json({ ok:false, error:'Not found' }); res.json(x); });
router.delete('/:id', (req, res) => { const ok = db.remove(req.params.id); if (!ok) return res.status(404).json({ ok:false, error:'Not found' }); res.json({ ok: true }) });

export default router;
