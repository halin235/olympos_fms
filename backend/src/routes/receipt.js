'use strict';

/**
 * 영수증 첨부 & 이의 제기 라우터
 *
 * 비즈니스 워크플로우:
 *  [고객] 영수증 업로드
 *    → status: pending_review  (결제 프로세스 즉시 HOLD)
 *    → is_disputed: true
 *    → receipt_url 저장
 *  [운영자] 검토 후 승인/기각
 *    → 승인: status: confirmed  (결제 재개)
 *    → 기각: status: disputed
 */

const path    = require('path');
const fs      = require('fs');
const express = require('express');
const multer  = require('multer');
const { body, param, validationResult } = require('express-validator');
const pool    = require('../db/pool');

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// Multer 설정 — 로컬 디스크 저장 (운영 환경에서는 S3 multer-s3로 교체)
// ─────────────────────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'receipts');

// 디렉터리 자동 생성
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file, cb) => {
    const ext       = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const safe      = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `${timestamp}-${safe}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('허용된 파일 형식: JPG, PNG, WEBP, PDF'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ─────────────────────────────────────────────────────────────
// 공통 유효성 검사 미들웨어
// ─────────────────────────────────────────────────────────────
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
}

// ─────────────────────────────────────────────────────────────
// POST /api/receipts/:contractId/upload
// [핵심 비즈니스 로직] 영수증 업로드 → 결제 HOLD
//
// 처리 순서:
//  1. 파일 저장 (multer)
//  2. settlements: receipt_url, is_disputed=true, status='pending_review', receipt_uploaded_at=NOW()
//  3. 결제 프로세스가 status='confirmed' 조건을 확인하므로 'pending_review' 전환으로 자동 HOLD
// ─────────────────────────────────────────────────────────────
router.post(
  '/:contractId/upload',
  [param('contractId').isUUID()],
  validateRequest,
  upload.single('receipt'),  // form-data 필드명: 'receipt'
  async (req, res) => {
    const { contractId } = req.params;
    const disputeNote    = req.body?.dispute_note || null;

    if (!req.file) {
      return res.status(400).json({ success: false, message: '파일이 첨부되지 않았습니다.' });
    }

    // 서빙 가능한 상대 URL 경로
    const receiptUrl = `/uploads/receipts/${req.file.filename}`;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 정산 레코드 존재 여부 확인
      const existing = await client.query(
        `SELECT id, status FROM settlements WHERE contract_id = $1 FOR UPDATE`,
        [contractId]
      );

      if (existing.rows.length === 0) {
        await client.query('ROLLBACK');
        // 업로드된 파일 롤백 삭제
        fs.unlink(req.file.path, () => {});
        return res.status(404).json({ success: false, message: '정산 데이터가 없습니다. 먼저 정산을 실행하세요.' });
      }

      const currentStatus = existing.rows[0].status;

      // 이미 결제 완료된 건은 이의 제기 불가
      if (currentStatus === 'paid') {
        await client.query('ROLLBACK');
        fs.unlink(req.file.path, () => {});
        return res.status(409).json({
          success: false,
          message: '이미 결제가 완료된 건은 영수증을 첨부할 수 없습니다.',
        });
      }

      // ── 핵심: status → 'pending_review' + 결제 HOLD 처리 ─
      const updated = await client.query(
        `UPDATE settlements SET
           receipt_url         = $1,
           receipt_uploaded_at = NOW(),
           is_disputed         = TRUE,
           dispute_note        = $2,
           status              = 'pending_review',
           updated_at          = NOW()
         WHERE contract_id = $3
         RETURNING *`,
        [receiptUrl, disputeNote, contractId]
      );

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: '영수증이 접수되었습니다. 운영자 확인 후 최종 정산됩니다.',
        data: {
          settlement:  updated.rows[0],
          receiptUrl,
          isOnHold:    true,   // 결제 HOLD 상태 명시
          statusLabel: '검토 중 (결제 보류)',
        },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      fs.unlink(req.file.path, () => {});
      console.error('POST /receipts/:contractId/upload error:', err);
      res.status(500).json({ success: false, message: '서버 오류', detail: err.message });
    } finally {
      client.release();
    }
  }
);

// ─────────────────────────────────────────────────────────────
// GET /api/receipts/:contractId
// 영수증 정보 조회 (관리자 페이지용)
// ─────────────────────────────────────────────────────────────
router.get(
  '/:contractId',
  [param('contractId').isUUID()],
  validateRequest,
  async (req, res) => {
    const { contractId } = req.params;
    try {
      const row = await pool.query(
        `SELECT s.contract_id, s.status, s.receipt_url, s.receipt_uploaded_at,
                s.is_disputed, s.dispute_note, s.review_completed_at, s.reviewed_by,
                c.contract_number, c.customer_name, c.customer_phone
         FROM settlements s
         JOIN contracts c ON s.contract_id = c.id
         WHERE s.contract_id = $1`,
        [contractId]
      );

      if (row.rows.length === 0) {
        return res.status(404).json({ success: false, message: '정산 데이터 없음' });
      }

      res.json({ success: true, data: row.rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ─────────────────────────────────────────────────────────────
// GET /api/receipts/admin/pending
// 관리자: 검토 대기 목록 전체 조회
// ─────────────────────────────────────────────────────────────
router.get('/admin/pending', async (_req, res) => {
  try {
    const rows = await pool.query(
      `SELECT s.contract_id, s.status, s.receipt_url, s.receipt_uploaded_at,
              s.dispute_note, s.total_amount,
              c.contract_number, c.customer_name, c.customer_phone,
              v.plate_number, v.model_name
       FROM settlements s
       JOIN contracts c ON s.contract_id = c.id
       JOIN vehicles  v ON c.vehicle_id  = v.id
       WHERE s.status = 'pending_review'
         AND s.is_disputed = TRUE
       ORDER BY s.receipt_uploaded_at ASC`
    );
    res.json({ success: true, data: rows.rows, total: rows.rowCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// PATCH /api/receipts/:contractId/review
// [관리자] 영수증 검토 완료 → 결제 재개(승인) 또는 분쟁(기각)
//
// body: { action: 'approve' | 'reject', reviewedBy, reviewNote }
//  - approve: status → 'confirmed'  (결제 프로세스 재개)
//  - reject:  status → 'disputed'   (추가 분쟁 절차)
// ─────────────────────────────────────────────────────────────
router.patch(
  '/:contractId/review',
  [
    param('contractId').isUUID(),
    body('action').isIn(['approve', 'reject']),
    body('reviewedBy').notEmpty().isString(),
    body('reviewNote').optional().isString(),
  ],
  validateRequest,
  async (req, res) => {
    const { contractId }                = req.params;
    const { action, reviewedBy, reviewNote } = req.body;

    const newStatus = action === 'approve' ? 'confirmed' : 'disputed';

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE settlements SET
           status               = $1,
           reviewed_by          = $2,
           review_completed_at  = NOW(),
           note                 = COALESCE($3, note),
           updated_at           = NOW()
         WHERE contract_id = $4
           AND status = 'pending_review'
         RETURNING *`,
        [newStatus, reviewedBy, reviewNote || null, contractId]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: '검토 대기 상태인 정산이 없거나 이미 처리되었습니다.',
        });
      }

      // 승인 시 계약 상태도 settled로 전환
      if (action === 'approve') {
        await client.query(
          `UPDATE contracts SET status = 'settled', updated_at = NOW()
           WHERE id = (SELECT contract_id FROM settlements WHERE contract_id = $1)`,
          [contractId]
        );
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: action === 'approve'
          ? '영수증 검토 완료: 정산이 확정되고 결제가 재개됩니다.'
          : '영수증 검토 완료: 분쟁 절차로 이관됩니다.',
        data: result.rows[0],
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('PATCH /receipts/:contractId/review error:', err);
      res.status(500).json({ success: false, message: err.message });
    } finally {
      client.release();
    }
  }
);

// ─────────────────────────────────────────────────────────────
// multer 에러 핸들러 (파일 크기 초과 등)
// ─────────────────────────────────────────────────────────────
router.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: '파일 크기는 10MB 이하여야 합니다.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err?.message?.includes('허용된 파일 형식')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

module.exports = router;
