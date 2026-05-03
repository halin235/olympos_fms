# OLYMPOS FMS (Demo)

**스마트 배차 및 정산 플랫폼 OLYMPOS**의 프론트엔드 데모 버전입니다. 실제 결제·실차량 연동 없이, 배차·정산·계약 워크플로우를 화면과 목(Mock) 데이터로 시연할 수 있습니다.

## 프로젝트 소개

- **직원 모드 (B2B · Staff)**  
  배차 대시보드, KPI·필터·긴급도 정렬, 배차 상세(정산 데모·연료 그래프·타임라인), **계약 관리**(링크 발송·리마인드·미리보기·QR) 등 운영 업무 UI를 제공합니다.
- **고객 모드 (B2C · User)**  
  내 차량·정산 금액 안내, **내 정산 내역**(연료 구간·영수증 플로우), **계약서 확인** 등 고객 관점 화면을 제공합니다.

역할은 앱 내에서 전환할 수 있으며, 동일 코드베이스에서 이원화된 UX를 보여 줍니다.

## 주요 기술 스택

| 영역 | 기술 |
|------|------|
| UI | **React 18**, Create React App |
| 스타일 | **Tailwind CSS**, Pretendard |
| 차트 | **Recharts** |
| 데이터 (데모) | 클라이언트 목 데이터 · 커스텀 정산 데모 훅 |
| 개발 방식 | **AI-assisted / Vibe Coding** (Cursor 등) |

## 핵심 기능 (데모)

- **정산 엔진 시연**: 반납 시각·연료 구간 기반 요금 구성, 상태 전환(대기·검토·확정 등)
- **실시간 그래프·보정 UX**: 연료 변화 차트, 스크롤·카드 연동 등 인터랙션
- **계약 관리 (직원)**: 계약서 링크·리마인드·미리보기·QR 등 액션 카드
- **내비게이션**: 직원·고객 각각 하단 탭과 상단 로케이션(헤더 타이틀) 동기화
- **반응형 단일 컬럼 모바일 폭** (`max-w-[430px]` 중심 레이아웃)

## 로컬 실행

```bash
cd frontend
npm install
npm start
```

브라우저에서 CRA 기본 포트(보통 `http://localhost:3000`)로 접속합니다.

프로덕션 빌드:

```bash
cd frontend
npm run build
```

또는 저장소 루트에서:

```bash
npm install --prefix frontend
npm run build
```

## 배포 (Vercel / Netlify)

앱 소스는 **`frontend/`** 디렉터리에 있습니다. 프레임워크는 **Create React App** (`react-scripts`)입니다 (Vite 아님).

### Vercel (권장)

**원인:** 저장소 루트의 `vercel.json`에 `cd frontend && …` 가 있으면, 대시보드에서 **Root Directory**를 `frontend`로 두는 순간 작업 디렉터리가 이미 `frontend/` 라 **`frontend` 하위 폴더가 없어** `cd: frontend: No such file or directory` 가 납니다.

이 저장소는 **저장소 루트의 `vercel.json`을 제거**하고 **`frontend/vercel.json`만** 사용합니다.

**Settings → Build & Deployment**

| 항목 | 권장 값 |
|------|---------|
| **Root Directory** | `frontend` |
| **Framework Preset** | Create React App |
| **Install Command** | Override를 **끄고 비워 두기** (기본 `npm install`). 또는 명시 시 **`npm install`** (`npm ci`는 lockfile 불일치 시 실패할 수 있음) |
| **Build Command** | 비워 두기 → 기본 **`npm run build`** |
| **Output Directory** | 비워 두기 → CRA 기본 **`build`** |

Override를 켠 경우에도 **`cd frontend`는 넣지 마세요.**

선택: Root Directory를 저장소 루트(`.`)로 두려면 루트에 `vercel.json`을 만들고 `npm install --prefix ./frontend`, `npm run build --prefix ./frontend`, Output `frontend/build` 로 두세요. README 하단 접기 블록 예시를 참고합니다.

<details>
<summary>루트 배포용 vercel.json 예시 (Root Directory = `.` 일 때만)</summary>

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "create-react-app",
  "installCommand": "npm install --prefix ./frontend",
  "buildCommand": "npm run build --prefix ./frontend",
  "outputDirectory": "frontend/build",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

</details>

#### (선택) `experimentalServices`

멀티 서비스(Services 프레임워크)를 쓸 때만 공식 문서에 따라 `experimentalServices`를 검토합니다. 일반적인 CRA 단일 앱 배포에는 **Root Directory = `frontend`** 와 위 표만으로 충분합니다.

### Netlify

1. **Base directory**를 `frontend`로 지정합니다.
2. `frontend/netlify.toml`의 build / publish 설정을 사용합니다.

### 환경 변수 (선택)

| 변수 | 설명 |
|------|------|
| `REACT_APP_API_URL` | API 베이스 URL. 미설정 시 코드에서는 `/api` 기본값을 사용합니다. (`frontend/src/api/settlementApi.js`) |

데모만 실행할 경우 **백엔드 없이** 동작하는 화면이 많으며, 실제 API를 붙일 때 위 변수를 배포 환경에 설정하면 됩니다.

로컬 개발용 `package.json`의 `proxy`(예: `localhost:4000`)는 **프로덕션 빌드에는 적용되지 않습니다.** 배포 후에는 `REACT_APP_API_URL` 또는 호스트별 리버스 프록시를 사용하세요.

## 디렉터리 구조 (요약)

```
olympos_fms/
├── frontend/          # React 앱 (진입점)
│   ├── src/
│   ├── public/
│   ├── package-lock.json
│   ├── vercel.json    # SPA rewrites · CRA (Root Directory = frontend)
│   └── netlify.toml
├── backend/           # API (별도 호스팅 시 연동)
├── package.json       # 루트 편의 스크립트 (build/start)
└── README.md
```

## 라이선스 및 고지

본 저장소는 **데모·포트폴리오 목적**의 프론트엔드 프로토타입입니다.

## 개발자

**Song Ha-rin (송하린)**

---

*Repository:* [github.com/halin235/olympos_fms](https://github.com/halin235/olympos_fms)
