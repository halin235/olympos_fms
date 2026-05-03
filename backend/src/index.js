'use strict';

require('dotenv').config();
const path    = require('path');
const express = require('express');
const cors    = require('cors');

const settlementRouter = require('./routes/settlement');
const receiptRouter    = require('./routes/receipt');

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

// ── 영수증 파일 정적 서빙 (/uploads/receipts/파일명)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── 헬스 체크
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── API 라우트
app.use('/api/settlements', settlementRouter);
app.use('/api/receipts',    receiptRouter);

// ── 전역 에러 핸들러
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: err.message });
});

app.listen(PORT, () => {
  console.log(`[Olympos Settlement API] listening on http://localhost:${PORT}`);
});

module.exports = app;
