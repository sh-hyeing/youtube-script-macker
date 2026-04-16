# 🎬 YouTube Script Maker

**유튜브 자막을 영어/한국어 학습 스크립트로 변환하는 AI 기반 웹 애플리케이션**

<br/>

> 긴 유튜브 자막을 그대로 읽기 어렵다는 문제를 해결합니다.  
> **자막 추출 → 텍스트 정리 → 스크립트 생성 → PDF 저장** 흐름을 한 번에 처리합니다.

---

## ✨ 주요 기능

| 기능                              | 설명                                                     |
| --------------------------------- | -------------------------------------------------------- |
| 🔍 유튜브 자막 추출               | URL 입력만으로 자막을 텍스트로 정리                      |
| ⭐ 공식 자막 우선 처리            | 공식 자막 우선 사용으로 안정적인 품질 보장               |
| 🎙️ 클라이언트 Gemini STT fallback | 공식 자막 미제공 영상은 브라우저에서 직접 음성 인식 보완 |
| 🔪 자동 청크 분할                 | 긴 자막도 분할 처리해 요청 실패 최소화                   |
| 🤖 AI 스크립트 생성               | Gemini 기반 영어/한국어 학습 스크립트 재구성             |
| 🔑 다중 API 키 회전               | 여러 Gemini API 키를 등록해 순환 사용                    |
| ♻️ quota exceeded 자동 재시도     | `Please retry in XXs` 파싱 후 자동 카운트다운 재시도     |
| ⏸️ 중단 / 이어하기                | 작업 중단 후 같은 지점부터 이어서 진행                   |
| 📄 PDF 다운로드                   | 교재형 레이아웃으로 완성된 스크립트 저장                 |
| 📱 반응형 UI                      | 모바일 접고 펼치기 + 자연스러운 읽기 구조                |

---

## 🏗 아키텍처

초기에는 Next.js API에서 직접 유튜브 자막을 가져오는 구조로 구현했으나, Vercel 배포 환경에서 YouTube 요청이 불안정했습니다. 자막 추출 책임을 Railway 별도 서버로 분리하여 현재 구조로 안정화했습니다.

```
Browser
  └─▶ Next.js /api/transcript  (Vercel)
        └─▶ Railway transcript server  (yt-dlp + Deno)
              └─▶ YouTube
```

| 레이어               | 역할                                                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js / Vercel** | 사용자 입력 처리, `/api/transcript` 프록시, Gemini 스크립트 생성, PDF 다운로드, UI 렌더링                                               |
| **Railway**          | yt-dlp 기반 자막 추출, 공식 자막 우선 처리, audio fallback용 오디오 준비, cookies 기반 요청, Deno runtime으로 YouTube JS challenge 대응 |
| **Browser**          | Gemini API 키 관리, 키 회전, 클라이언트 STT 실행, 스크립트 생성 요청                                                                    |

---

## 🔄 처리 흐름

**공식 자막이 있는 경우**

```
YouTube URL 입력
  → transcript 서버에서 공식 자막 추출
  → 텍스트 정규화
  → 청크 분할
  → Gemini 스크립트 생성
  → PDF 저장
```

**공식 자막이 없는 경우**

```
YouTube URL 입력
  → transcript 서버에서 메타 확인
  → 브라우저에서 Gemini STT 수행
  → 텍스트 정리 및 청크 분할
  → Gemini 스크립트 생성
  → PDF 저장
```

---

## 🚀 시작하기

### 1. 설치

```bash
git clone https://github.com/your-username/youtube-script-maker.git
cd youtube-script-maker
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성합니다.

```env
YTDLP_TRANSCRIPT_SERVER_URL=https://your-railway-domain
```

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 사용 순서

```
1. 유튜브 URL 입력
2. Gemini API 키 등록
3. 스크립트 생성 실행
4. 필요 시 자동 재시도 또는 이어하기
5. 최종 결과를 PDF로 다운로드
```

---

## 🔐 보안 및 데이터 처리

- Gemini API 키는 **사용자 브라우저에서만 관리**하며 별도 서버에 저장하지 않습니다.
- 유튜브 자막 추출은 Railway transcript 서버에서만 수행합니다.
- 장기 저장소 없이 **임시 데이터 중심**으로 처리하도록 구성했습니다.
- 브라우저 저장소 기반 구조이므로 공개 서비스 운영 시 XSS 대응 및 서버 접근 제어 보완이 필요합니다.

---

## 🛠 트러블슈팅 기록

<details>
<summary><b>1. Vercel 환경에서 YouTube 자막 추출 실패</b></summary>

**문제** Next.js API에서 직접 유튜브 자막을 가져오는 구조로 구현했으나, 배포 환경에서 YouTube 요청이 안정적으로 처리되지 않아 자막 추출이 실패했습니다.

**해결** 자막 추출 책임을 Railway 별도 서버로 분리하고, Next.js는 Railway 서버를 호출하는 프록시 구조로 변경했습니다.

</details>

<details>
<summary><b>2. yt-dlp 적용 후 429 Too Many Requests 발생</b></summary>

**문제** Railway에 yt-dlp 서버를 올린 뒤에도 YouTube 자막 요청이 429로 차단되는 문제가 있었습니다.

**해결** `cookies.txt` 적용으로 로그인 세션 기반 요청으로 전환하고, 필요한 언어 위주로 요청하도록 조정했습니다.

</details>

<details>
<summary><b>3. YouTube JS challenge 대응 문제</b></summary>

**문제** yt-dlp가 `Signature solving failed`, `n challenge solving failed` 등으로 포맷 확인에 실패했습니다.

**해결** Deno runtime을 연결해 `yt-dlp + Deno` 조합으로 실제 `.vtt` 자막 생성까지 확인 후 서버 구조에 반영했습니다.

</details>

<details>
<summary><b>4. 자막만 필요하지만 포맷 오류로 전체 요청 실패</b></summary>

**문제** 영상 다운로드가 목적이 아닌데도 yt-dlp가 포맷 선택 단계에서 함께 실패했습니다.

**해결** 자막 중심 옵션으로 명령을 재구성하고, `.vtt` 생성 후 텍스트만 정규화해 사용하는 흐름으로 단순화했습니다.

</details>

<details>
<summary><b>5. Gemini 무료 쿼터 초과</b></summary>

**문제** 긴 자막 처리 시 Gemini 무료 플랜의 quota exceeded 오류가 자주 발생했습니다.

**해결** 다중 API 키 회전 구조를 구현하고, `Please retry in XXs` 응답을 파싱해 자동 카운트다운 후 재시도하도록 구성했습니다. 중단 / 이어하기 기능을 추가해 긴 작업도 처음부터 다시 하지 않아도 됩니다.

</details>

<details>
<summary><b>6. 공식 자막이 없는 영상 대응</b></summary>

**문제** 공식 자막이 없는 영상에서는 학습용 스크립트 품질이 크게 흔들렸습니다.

**해결** 공식 자막 우선 사용 구조를 정착시키고, 필요 시 클라이언트 Gemini STT fallback을 적용했습니다.

</details>

<details>
<summary><b>7. 노래 / 일반 학습 영상 처리 품질 차이</b></summary>

**문제** 노래 영상과 일반 학습 영상을 같은 규칙으로 처리했을 때 결과 품질 차이가 컸습니다.

**해결** 노래는 외부 지식 기반 복원을 유도하지 않고 입력 텍스트 기준으로 정리하고, 일반 학습 영상은 서론 제거와 반복 정리에 집중하도록 프롬프트를 분리해 조정했습니다.

</details>

---

## 💻 기술 스택

| 분류           | 사용 기술                                      |
| -------------- | ---------------------------------------------- |
| **Frontend**   | Next.js, React, TypeScript, CSS                |
| **Backend**    | Next.js Route Handler, Railway, Node.js        |
| **자막 추출**  | yt-dlp, Deno                                   |
| **AI**         | Gemini API                                     |
| **라이브러리** | jspdf                                          |
| **배포**       | Vercel (Frontend), Railway (Transcript Server) |

---

## 📁 주요 기능 포인트

```
youtube-script-maker/
├── 자막 추출       yt-dlp 기반 추출, .vtt 정규화, Railway 서버 분리
├── 스크립트 생성   Gemini 기반 영어/한국어 변환, 청크 처리, 긴 영상 대응
├── 안정성          다중 API 키 회전, quota exceeded 자동 재시도, 중단/이어하기
└── UX             반응형 UI, 상태 표시 강화, PDF 저장 지원
```

---
