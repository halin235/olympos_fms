/**
 * 한글 계약 요약을 캔버스로 래스터화한 뒤 jsPDF에 삽입합니다. (기본 폰트 한글 미지원 보완)
 */

function rasterizeLines(lines, fontSize = 11) {
  const lh = fontSize * 1.42;
  const pad = 14;
  const widthPx = 540;
  const heightPx = Math.ceil(lines.length * lh + pad * 2);
  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, widthPx, heightPx);
  ctx.fillStyle = '#111827';
  ctx.font = `${fontSize}px Pretendard, "Noto Sans KR", "Malgun Gothic", sans-serif`;
  lines.forEach((line, i) => {
    ctx.fillText(line, pad, pad + (i + 1) * lh);
  });
  return { dataUrl: canvas.toDataURL('image/jpeg', 0.92), aspect: heightPx / widthPx };
}

export async function downloadInsuranceContractPdf(meta) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const margin = 14;
  const pageW = doc.internal.pageSize.getWidth();
  const imgW = pageW - margin * 2;

  let y = margin;

  const pushBlock = (lines, fontSize = 11) => {
    const { dataUrl, aspect } = rasterizeLines(lines, fontSize);
    const imgH = imgW * aspect;
    if (y + imgH > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    doc.addImage(dataUrl, 'JPEG', margin, y, imgW, imgH);
    y += imgH + 5;
  };

  pushBlock(['보험대차 자동차 임대차 계약서', '(전자계약 · 데모 버전)'], 15);

  pushBlock([
    `계약번호: ${meta.contractNo}`,
    `작성일: 2026년 5월 3일`,
    '',
    '제1조 (목적)',
    '본 계약은 보험사 승인에 따른 보험대차로서, 임대인이 임차인에게 첨부 차량을 일정 기간 임대하고 임차인이 이에 따른 의무를 이행함을 확정하기 위합니다.',
    '',
    '제2조 (당사자)',
    `① 임차인: ${meta.lesseeName} (이하 "임차인")`,
    `② 임대차량: ${meta.vehicle} / 자동차등록번호 ${meta.plate}`,
    `③ 보험사: ${meta.insuranceCo} / 접수번호 ${meta.claimNo}`,
  ]);

  pushBlock([
    '제3조 (임대기간 및 반환)',
    `① 임대기간: ${meta.startDate}부터 ${meta.endDate}까지 (${meta.days}일)`,
    '② 임차인은 기간 종료 후 지체 없이 차량을 반환하고, 반환 지연 시 별도 연체료가 부과될 수 있습니다.',
  ]);

  pushBlock([
    '제4조 (요금 및 결제)',
    `① 일 대여료: ${meta.dailyRate.toLocaleString('ko-KR')}원`,
    `② 보증금: ${meta.deposit.toLocaleString('ko-KR')}원`,
    '③ 실제 확정 금액은 보험 처리 결과 및 반납 검수 후 정산 내역에 따릅니다.',
  ]);

  pushBlock([
    '제5조 (차량 인도)',
    '임차인은 인도 시 차량 상태·연료·부속품을 확인하였으며, 인도 후 발생한 관리 소홀에 따른 손해는 임차인이 부담합니다.',
  ]);

  pushBlock([
    '제6조 (금지 행위)',
    '임차인은 영업용 운행, 전대·양도, 무단 개조, 법령 위반 운행 등을 하여서는 아니 됩니다.',
  ]);

  pushBlock([
    '제7조 (손해배상 및 보험)',
    '사고·도난 등 발생 시 즉시 임대인 및 보험사에 통지하고, 관련 절차에 협조합니다.',
  ]);

  pushBlock([
    '제8조 (준거법 및 분쟁)',
    '본 계약은 대한민국 법령에 따르며, 분쟁 시 관할 법원은 민사소송법 등 관련 법령에 따릅니다.',
    '',
    '본 계약의 내용을 확인하였으며 이에 동의합니다.',
    '',
    `임차인: ${meta.lesseeName} (전자서명 생략 — 앱 내 서명본 참조)`,
  ]);

  doc.save(`OLYMPOS_보험대차_계약서_${meta.contractNo}.pdf`);
}
