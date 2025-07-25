
# IP 대시보드 🌐

**IP 주소를 분석하고, 연결 상태를 점검하며, AI로 위치 기반 디지털 엽서까지 생성하는 올인원 웹 애플리케이션입니다.**

이 프로젝트는 사용자가 입력한 IP 주소 또는 자신의 IP 주소에 대한 상세 정보를 제공합니다. 분석 결과에는 지리적 위치, ISP(인터넷 서비스 제공업체), 소속 기관 등이 포함됩니다. 또한, Google Gemini AI를 활용하여 연결 상태를 진단하고 프라이버시 팁을 제공하며, 현재 위치를 기반으로 한 독창적인 디지털 엽서를 생성하는 고급 기능을 제공합니다.

실행주소1 : https://ip-board.vercel.app/

실행주소2 : https://dev-canvas-pi.vercel.app/

---

## ✨ 주요 기능

*   **🌐 IP 상세 분석**: IP 주소의 지리적 위치(국가, 도시), ISP, 소속 기관, AS 번호 등 핵심 정보를 조회합니다.
*   **🛡️ 내 연결 상태 점검**: '내 IP로 분석' 시, 현재 연결의 HTTP/TLS 버전과 같은 보안 관련 정보를 함께 제공하여 연결 안전성을 확인할 수 있습니다.
*   **🤖 AI 기반 프라이버시 진단 (Gemini)**: 사용자의 연결 데이터를 심층 분석하여, 재치 있는 '인터넷 성향'과 함께 프라이버시 보호를 위한 맞춤형 팁을 제공합니다. (Gemini API 키 필요)
*   **🖼️ AI 디지털 엽서 생성 (Imagen)**: 분석된 IP의 국가 정보를 기반으로, 세상에 하나뿐인 아름다운 디지털 엽서를 AI가 생성합니다. (Gemini API 키 필요)
*   **💾 분석 기록**: 최근 분석 기록을 브라우저의 로컬 스토리지에 저장하고 언제든지 다시 확인할 수 있습니다.
*   **🔒 강력한 개인정보 보호**: 사용자의 API 키와 분석 기록은 서버에 전송되거나 저장되지 않습니다. 모든 데이터는 사용자의 브라우저 내에만 안전하게 보관됩니다.
*   **📱 반응형 디자인**: 데스크톱, 태블릿, 모바일 등 모든 기기에서 최적화된 화면을 제공합니다.

---

## 🛠️ 기술 스택

*   **프레임워크**: React (v19 with Hooks)
*   **언어**: TypeScript
*   **스타일링**: Tailwind CSS
*   **AI 모델**:
    *   `gemini-2.5-flash`: 프라이버시 진단 및 텍스트 기반 분석
    *   `imagen-3.0-generate-002`: 디지털 엽서 이미지 생성
*   **API**:
    *   Google Gemini API (`@google/genai` SDK)
    *   ipinfo.io: IP 지리 정보 조회
    *   Cloudflare Trace: 사용자 연결 상세 정보 조회
*   **실행 환경**: 최신 브라우저 (ES Modules 지원) / 별도의 빌드 과정 없음

---

## 🚀 시작하기

이 애플리케이션은 별도의 빌드 과정 없이 정적 파일 서버를 통해 바로 실행할 수 있습니다.

### 1. 소스 코드 받기

프로젝트를 클론하거나 다운로드합니다.

```bash
git clone https://github.com/your-repo/ip-dashboard.git
cd ip-dashboard
```

### 2. 로컬 서버 실행

프로젝트 폴더 내에서 간단한 HTTP 서버를 실행합니다.

**Node.js `serve` 사용 (추천):**
```bash
npx serve
```

**Python 사용:**
```bash
# Python 3
python -m http.server
```

이제 브라우저에서 `http://localhost:3000` (또는 서버가 알려주는 주소)로 접속하면 애플리케이션을 확인할 수 있습니다.

### 3. Gemini API 키 설정

AI 기반 기능(진단, 디지털 엽서)을 사용하려면 Google Gemini API 키가 필요합니다.

*   **키 발급**: [Google AI Studio](https://aistudio.google.com/app/apikey)에서 무료로 API 키를 발급받으세요.

키를 설정하는 방법은 두 가지입니다.

1.  **환경 변수 (운영/배포 시 권장)**
    이 프로젝트는 `process.env.API_KEY` 환경 변수에서 API 키를 자동으로 읽도록 설정되어 있습니다. Vercel, Netlify 등 호스팅 서비스에 배포할 때 환경 변수로 API 키를 설정하면, 사용자가 별도로 키를 입력할 필요 없이 AI 기능을 바로 사용할 수 있습니다.

2.  **애플리케이션 UI에 직접 입력**
    로컬에서 테스트하거나 환경 변수 설정이 어려운 경우, 앱 화면 상단의 API 키 관리 섹션에 직접 키를 입력하여 사용할 수 있습니다.
    *   입력된 키는 브라우저의 **로컬 스토리지**에만 저장되어 안전합니다.
    *   만약 환경 변수 키가 설정되어 있다면, UI를 통해 입력한 키는 현재 브라우저 세션에서만 임시로 우선 적용됩니다.

---

## 📁 프로젝트 구조

```
/
├── components/         # 재사용 가능한 React 컴포넌트
│   ├── ui/             # 버튼, 카드 등 기본 UI 컴포넌트
│   ├── AnalysisInputForm.tsx
│   ├── Dashboard.tsx
│   ├── HistoryLog.tsx
│   ├── PostcardCreator.tsx
│   └── PrivacyAnalyzer.tsx
├── services/           # 외부 API 연동 및 비즈니스 로직
│   ├── geminiService.ts  # Google Gemini API 호출
│   ├── ipApiService.ts   # IP 정보 API 호출
│   ├── logService.ts     # 로컬 스토리지 기반 로그 관리
│   └── traceService.ts   # Cloudflare Trace API 호출
├── utils/              # 유틸리티 함수
│   ├── country.ts
│   └── securityScore.ts
├── App.tsx             # 메인 애플리케이션 컴포넌트
├── index.html          # HTML 진입점
├── index.tsx           # React 앱 마운트 스크립트
├── types.ts            # TypeScript 타입 정의
└── README.md           # 프로젝트 설명서
```

---

## 🔒 개인정보 보호 정책

본 애플리케이션은 사용자의 개인정보 보호를 최우선으로 생각합니다.

*   **API 키**: 사용자가 입력한 Gemini API 키는 **오직 사용자의 브라우저 내 로컬 스토리지(localStorage)에만 저장**됩니다. 이 정보는 외부 서버로 절대 전송되거나 기록되지 않습니다.
*   **분석 기록**: IP 분석 기록 또한 로컬 스토리지에만 저장되며, 개발자를 포함한 그 누구도 사용자의 분석 기록에 접근할 수 없습니다.

모든 민감한 정보는 사용자의 컴퓨터를 벗어나지 않으므로 안심하고 사용하셔도 좋습니다.
