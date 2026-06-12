// src/routes/overrides.js — Ürün özelleştirmeleri
'use strict';
const router = require('express').Router();
const stmts  = require('../db/statements');
const { auth }    = require('../middleware/auth');
const { ok, err } = require('../middleware/respond');

// GET /api/overrides
router.get('/', auth(), (req, res) => {
  const rows = stmts.getOverrides.all();
  const overrides = { images: {}, names: {}, prices: {} };
  rows.forEach(r => {
    if (r.image_ov != null) overrides.images[r.code]  = r.image_ov;
    if (r.name_ov  != null) overrides.names[r.code]   = r.name_ov;
    if (r.price_ov != null) overrides.prices[r.code]  = r.price_ov;
  });
  ok(res, { overrides });
});

// POST /api/overrides
router.post('/', auth(['admin']), (req, res) => {
  const { code } = req.body || {};
  if (!code) return err(res, 'code gerekli');
  const name_ov  = req.body.name_ov  !== undefined ? req.body.name_ov  : (req.body.name  !== undefined ? req.body.name  : null);
  const price_ov = req.body.price_ov !== undefined ? req.body.price_ov : (req.body.price !== undefined ? req.body.price : null);
  const image_ov = req.body.image_ov !== undefined ? req.body.image_ov : (req.body.image !== undefined ? req.body.image : null);
  stmts.upsertOverride.run(
    code,
    name_ov  !== null ? name_ov  : null,
    price_ov !== null ? Number(price_ov) : null,
    image_ov !== null ? image_ov : null
  );
  ok(res, { message: 'Kaydedildi' });
});

// DELETE /api/overrides/:code  (tek ürün sıfırla)
router.delete('/:code', auth(['admin']), (req, res) => {
  stmts.resetOverride.run(req.params.code);
  ok(res, { message: 'Sıfırlandı' });
});

// DELETE /api/overrides  (tümünü sıfırla)
router.delete('/', auth(['admin']), (req, res) => {
  stmts.resetAllOverrides.run();
  ok(res, { message: 'Tümü sıfırlandı' });
});

module.exports = router;
