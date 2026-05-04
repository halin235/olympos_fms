# Olympos FMS

**올림포스 FMS(Olympos FMS)**는 렌터카·보험대차 환경을 가정한 **스마트 배차·정산·전자계약 데모**입니다. 직원용 운영 대시보드와 고객용 앱 UI를 한 코드베이스에서 전환해 볼 수 있으며, 데모 타임라인은 **2026년 5월** 기준으로 통일되어 있습니다.

## 핵심 기능

| 영역 | 설명 |
|------|------|
| **배차 관리 대시보드** | KPI, 배차 필터/정렬, 연료 상태, 월 통계(직원 모드) |
| **계약 관리 센터** | 전자계약 상태 필터, 리마인드 알림(데모), 일괄 다운로드 UI |
| **전자 계약·서명** | 계약서 뷰어, PDF 다운로드(jsPDF), 캔버스 서명, 보험사 전송 플로우(고객 모드) |
| **정산 데모** | 연료 차트, 지오펜스 타임라인, 영수증·정산 상태 시뮬레이션 |

첫 화면에서 **「배차 고객용 모드」**를 선택하면 **송하린 데모** 플로우(홈·정산·계약서)로 진입합니다.

## 기술 스택

- **Frontend:** React 18, Tailwind CSS, Create React App, Recharts, jsPDF  
- **Backend (선택):** Node.js API 스켈레톤 (`backend/`) — 프론트 단독 빌드로도 데모 동작  
- **개발 환경:** [Cursor](https://cursor.com/) 등 AI 보조 IDE로 구현·리팩터링  

> 디자인 시안·기획 협업은 Figma·Notion·Lovable 등 외부 도구와 병행할 수 있습니다. 정적 에셋은 현재 `frontend/public` 및 번들 기준으로 제공됩니다.

## 로컬 실행

```bash
# 저장소 루트에서 (프론트만)
npm install --prefix frontend
npm start --prefix frontend
```

또는:

```bash
npm run install:frontend
npm start
```

브라우저: [http://localhost:3000](http://localhost:3000)

### 환경 변수

API를 연결할 때만 필요합니다. 예시는 `frontend/.env.example` 참고.

```bash
cp frontend/.env.example frontend/.env.local
# REACT_APP_API_URL 등 수정
```

데모 화면 대부분은 **목(mock) 데이터**로 동작합니다.

## 프로덕션 빌드

```bash
npm run build
# 출력: frontend/build
```

## 배포

### Vercel

이 저장소는 **`frontend/`** 아래에 CRA 앱이 있습니다. 대시보드의 **Root Directory**와 **Install Command**가 서로 맞아야 합니다.

#### A. Root Directory = 비움 (저장소 루트, 권장과 동일)

`/` 기준으로 빌드합니다. **`cd frontend`** 를 넣지 마세요.

1. [Vercel](https://vercel.com)에서 GitHub 저장소 Import  
2. **Root Directory:** 비워 두기 (또는 `./`)  
3. 루트 `vercel.json`이 다음을 유도합니다:  
   - **Install Command:** `npm ci --prefix frontend`  
   - **Build Command:** `npm run build --prefix frontend`  
   - **Output Directory:** `frontend/build`  
4. SPA: 루트 `vercel.json`의 `rewrites`  

대시보드에 예전 값 `cd frontend && npm ci`가 남아 있으면 **삭제**하거나 위와 같이 고치세요. Root가 `/`일 때 `cd frontend`는 맞지만, **Root Directory를 이미 `frontend`로 둔 상태**에서 같은 명령을 쓰면 `frontend` 폴더가 없어 실패합니다.

#### B. Root Directory = `frontend`

프로젝트 루트가 `frontend/`인 경우 **`cd frontend` 없이** 설치합니다.

- **Install Command:** `npm ci`  
- **Build Command:** `npm run build`  
- **Output Directory:** `build`  

이 경우 `frontend/vercel.json`의 설정을 따릅니다.

### Netlify

루트 `netlify.toml`을 사용하거나, 대시보드에서 위와 동일한 build/publish 경로를 지정합니다.

### 라우팅

클라이언트만 배포할 때 URL은 단일 진입(`/`). 앱 내부는 상태 기반 화면 전환(SPA)이므로 **추가 라우트 파일은 필요 없습니다.**

## 저장소 구조 (요약)

```
frontend/src/     # React 앱 (직원·고객 플로우, 계약·정산 페이지)
frontend/src/constants/demoTimeline.js  # 데모 날짜 단일 소스
backend/          # 선택적 API
```

## 라이선스

Private / 데모 용도 — 배포 시 저장소 설정에 따릅니다.
