// src/routes/orders.js — Sipariş işlemleri
'use strict';
const router = require('express').Router();
const stmts  = require('../db/statements');
const { auth }            = require('../middleware/auth');
const { ok, err }         = require('../middleware/respond');
const { broadcastEvent }  = require('../middleware/sse');

const VALID_STATUSES = ['beklemede', 'onaylandi', 'kargoda', 'teslim', 'iptal'];

const mapOrder = r => ({
  id:           String(r.id),
  no:           r.order_no,
  firm:         r.firm_name,
  status:       r.status,
  total:        r.total,
  disc:         r.disc,
  rate:         r.rate,
  items:        JSON.parse(r.items_json || '{}'),
  notes:        r.notes,
  date:         r.created_at.slice(0, 10),
  updatedAt:    r.updated_at,
  created_by:   r.created_by,
  creator_name: r.creator_name,
});

// GET /api/orders
router.get('/', auth(['admin', 'sales']), (req, res) => {
  ok(res, { orders: stmts.getOrders.all().map(mapOrder) });
});

// POST /api/orders
router.post('/', auth(['admin', 'sales']), (req, res) => {
  const { no, firm, status, total, disc, rate, items, notes } = req.body || {};
  if (!no) return err(res, 'Sipariş numarası gerekli');
  try {
    const info = stmts.insertOrder.run(
      no, firm || '', status || 'beklemede',
      Number(total) || 0, Number(disc) || 0, Number(rate) || 0,
      JSON.stringify(items || {}), notes || '', req.user.id
    );
    broadcastEvent('order-changed', { action: 'create', id: String(info.lastInsertRowid), by: req.user.id });
    ok(res, { id: info.lastInsertRowid });
  } catch (e) {
    err(res, 'Kayıt başarısız: ' + e.message);
  }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', auth(['admin', 'sales']), (req, res) => {
  const id     = Number(req.params.id);
  const { status } = req.body || {};
  if (!VALID_STATUSES.includes(status)) return err(res, 'Geçersiz durum');
  if (!stmts.getOrderById.get(id))      return err(res, 'Sipariş bulunamadı', 404);
  stmts.updateOrderStatus.run(status, id);
  broadcastEvent('order-changed', { action: 'status', id: String(id), status, by: req.user.id });
  ok(res, { message: 'Durum güncellendi' });
});

// DELETE /api/orders/:id
router.delete('/:id', auth(['admin']), (req, res) => {
  const id = Number(req.params.id);
  if (!stmts.getOrderById.get(id)) return err(res, 'Sipariş bulunamadı', 404);
  stmts.deleteOrder.run(id);
  broadcastEvent('order-changed', { action: 'delete', id: String(id), by: req.user.id });
  ok(res, { message: 'Silindi' });
});

module.exports = router;
