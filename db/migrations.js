// src/db/migrations.js — Mevcut DB'ye eksik kolonları ekler
'use strict';
const db = require('./connection');

const migrate = db.transaction(() => {
  const col = (table) => db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);

  const ocols = col('orders');
  if (!ocols.includes('notes'))      db.exec("ALTER TABLE orders ADD COLUMN notes TEXT NOT NULL DEFAULT ''");
  if (!ocols.includes('updated_at')) db.exec("ALTER TABLE orders ADD COLUMN updated_at TEXT NOT NULL DEFAULT (datetime('now'))");

  const scols = col('service_customers');
  if (!scols.includes('address'))      db.exec("ALTER TABLE service_customers ADD COLUMN address TEXT NOT NULL DEFAULT ''");
  if (!scols.includes('install_date')) db.exec("ALTER TABLE service_customers ADD COLUMN install_date TEXT DEFAULT NULL");

  const rcols = col('service_records');
  if (!rcols.includes('type')) db.exec("ALTER TABLE service_records ADD COLUMN type TEXT NOT NULL DEFAULT 'maintenance'");
  if (!rcols.includes('tech')) db.exec("ALTER TABLE service_records ADD COLUMN tech TEXT NOT NULL DEFAULT ''");
  if (!rcols.includes('fee'))  db.exec("ALTER TABLE service_records ADD COLUMN fee REAL NOT NULL DEFAULT 0");

  const qcols = col('quotes');
  if (!qcols.includes('payment_json')) db.exec("ALTER TABLE quotes ADD COLUMN payment_json TEXT NOT NULL DEFAULT '{}'");
});

migrate();
