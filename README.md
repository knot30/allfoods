# allfoods

경북(예천·영주 1차) **학교급식 식자재 입찰·가격 인텔리전스** 프로토타입.
나라장터(조달청) 입찰공고 + KAMIS 농산물 도매가를 한 화면에서 묶고, 선택한 공고를
AI가 분석해 **적합도 / 권장 투찰가 / 리스크**를 자동 리포트로 뽑습니다.

> 키가 없어도 바로 동작합니다 — 외부 API 키가 비어 있으면 현실적인 **데모(fixture) 데이터**로
> 4개 화면이 전부 돌아가고, 키를 채우면 자동으로 실데이터로 전환됩니다.

## 스택

Next.js 16 (App Router) · TypeScript · Tailwind v4 · recharts · AI SDK v6 · Vercel 배포

## 화면

| 경로 | 화면 | 내용 |
|---|---|---|
| `/` | 대시보드 | 오늘 신규 공고·마감 임박·주요 품목 등락 |
| `/bids` | 입찰 공고 | 나라장터 물품 공고 목록, 지역 토글(예천·영주/경북북부/전체), 행별 AI 분석 |
| `/prices` | 가격 추적 | KAMIS 도매가 30일 추이 라인차트 + 전월 대비 |
| `/analysis` | AI 입찰 분석 | 공고 선택 → 분석 리포트 자동 생성 |

## 구조

```
app/
  api/bids/route.ts      나라장터 프록시
  api/prices/route.ts    KAMIS 프록시
  api/analyze/route.ts   공고+가격 → AI 분석
  page.tsx /bids /prices /analysis
lib/
  g2b.ts        나라장터 클라이언트
  kamis.ts      KAMIS 클라이언트 + 급식 품목 카탈로그
  ai-analyze.ts AI SDK generateObject 분석
  data.ts       실데이터 ↔ fixture 폴백 로더 (라우트·서버컴포넌트 공용)
  fixtures.ts   데모 데이터
  config.ts     env·필터 상수   format.ts  표시 헬퍼   types.ts  도메인 타입
components/     Sidebar, BidsView, PricesView, AnalysisView, AnalysisCard, ui
```

설계 원칙: **외부 정부 API는 서버(라우트/서버컴포넌트)에서만 호출** (키 노출·CORS·캐싱).
모든 외부 호출은 60초 캐시 + 에러/빈응답 가드 → 실패해도 데모 데이터로 폴백.

## 시작

```bash
npm install
cp .env.example .env.local   # 키는 나중에 채워도 됨 (없으면 데모 데이터)
npm run dev                  # http://localhost:3000
```

## API 키 발급 절차

### 1. 나라장터 (공공데이터포털)
1. [data.go.kr](https://www.data.go.kr/data/15129394/openapi.do) 로그인 → "조달청_나라장터 입찰공고정보서비스" **활용신청**
2. 승인 후 마이페이지에서 **일반 인증키(Decoding)** 복사 → `.env.local` 의 `G2B_SERVICE_KEY`
3. Swagger 에서 base 경로 확인. 호출이 실패하면 `G2B_BASE_URL` 을 `/ad/` 없는 버전으로 교체

### 2. KAMIS (농산물유통정보)
1. [kamis.or.kr](https://www.kamis.or.kr/customer/reference/openapi_list.do) 가입 → Open-API 인증키 신청
2. 발급된 **인증키 → `KAMIS_CERT_KEY`**, **가입 ID → `KAMIS_CERT_ID`**
3. `lib/kamis.ts` 의 `MEAL_ITEMS` item/category/kind 코드를 KAMIS 명세표로 최종 검증

### 3. AI 분석
- `ANTHROPIC_API_KEY` 직접 호출, 또는 `AI_GATEWAY_API_KEY` + `ANALYZE_MODEL='anthropic/claude-...'`

## 배포 (Vercel)

```bash
vercel link
# 환경변수는 Vercel 대시보드 또는 `vercel env add` 로 등록 (.env.local 은 커밋 금지)
vercel --prod
```

타깃 도메인: `allfoods.co.kr`
