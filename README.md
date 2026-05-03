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

### Vercel

저장소 **루트에 `vercel.json`**이 있어, 대시보드에서 **Root Directory를 `./`(저장소 루트)** 로 두어도 `frontend/`만 빌드·배포되도록 설정되어 있습니다. Deploy 버튼이 비활성화되던 경우, 이 파일 저장 후 다시 Import 하거나 설정을 저장해 보세요.

| 설정 항목 | Root = `./`(루트) + 루트 `vercel.json` 사용 시 | Root = `frontend` 로 바꿀 때 |
|-----------|-----------------------------------------------|------------------------------|
| **Root Directory** | `.` 또는 비워 둠과 동일 | `frontend` |
| **Install Command** | *(비워 두면)* `vercel.json`의 `cd frontend && npm ci` | `npm ci` 또는 `npm install` |
| **Build Command** | *(비워 두면)* `cd frontend && npm run build` | `npm run build` |
| **Output Directory** | *(비워 두면)* `frontend/build` | `build` |
| **Framework Preset** | **Create React App** 권장 | **Create React App** (자동 감지되는 경우 많음) |

**Root Directory를 `./frontend`로 바꿀 때:** `frontend/package.json`의 스크립트는 이미 `"build": "react-scripts build"`이므로 **별도 수정할 필요 없습니다.** 빌드 산출물은 항상 해당 패키지 기준 **`build/`** 폴더입니다.

**루트 `package.json`:** 편의용으로 `"build": "cd frontend && npm run build"`가 있습니다. Vercel에서 Root를 루트로 둘 때는 `vercel.json`이 우선하고, Root를 `frontend`로 두면 **프로젝트의 `package.json`은 `frontend/package.json`만** 쓰이므로 루트 스크립트는 배포에 필수는 아닙니다.

SPA 라우팅 확장용 **`rewrites`**는 루트 `vercel.json`에 포함되어 있습니다. Root Directory를 `frontend`만 쓰는 프로젝트로 나중에 분리하면 `frontend/vercel.json`의 동일 설정을 참고하면 됩니다.

#### (선택) `experimentalServices` — 멀티 서비스 프리뷰

Vercel 대시보드에서 프로젝트 **Framework를 Services**로 쓰는 멀티 서비스 구성을 쓸 경우, 공식 문서 형태에 가깝게는 다음처럼 **`experimentalServices`**로 웹 엔트리를 `frontend`에 둘 수 있습니다. *(실험 기능이며, 기존 `builds` 설정과는 함께 쓸 수 없습니다.)*

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "experimentalServices": {
    "web": {
      "entrypoint": "frontend",
      "routePrefix": "/",
      "framework": "create-react-app"
    }
  }
}
```

프론트만 우선 배포할 때는 위 방식보다 **이 저장소에 포함된 루트 `vercel.json`(install/build/output 지정)** 방식이 단순하고 안정적인 경우가 많습니다.

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
│   ├── package.json
│   ├── vercel.json    # Root Directory=frontend 배포 시 SPA rewrites 등
│   └── netlify.toml
├── backend/           # API (별도 호스팅 시 연동)
├── package.json       # 루트 편의 스크립트 (build/start)
├── vercel.json        # 루트 배포 시 frontend 빌드 지정
└── README.md
```

## 라이선스 및 고지

본 저장소는 **데모·포트폴리오 목적**의 프론트엔드 프로토타입입니다.

## 개발자

**Song Ha-rin (송하린)**

---

*Repository:* [github.com/halin235/olympos_fms](https://github.com/halin235/olympos_fms)
