# allfoods 진행 현황 (ROADMAP)

> 이 파일이 "작업 내역"이다. 다른 PC에서 `claude` 켜고 이 파일부터 읽으면 어디까지 했는지 안다.
> 새 작업을 끝낼 때마다 이 파일의 상태를 갱신하고 `git push` 한다.

## 한 줄 요약
경북(예천·영주) 학교급식 식자재 유통 ERP. 입찰·가격·AI 인텔리전스(①) + 운영 ERP(②~⑥) + 분석(⑧).
**핵심 원칙: ②~⑥의 실제 운영 데이터가 ①의 AI 입찰 분석으로 되먹임된다** (우리 매입원가·마진·낙찰률).

## 스택 / 인프라
- Next.js 16 (App Router) · TS · Tailwind v4 · recharts · AI SDK v6
- DB: Supabase (서버 service role, 클라 노출 금지) — 미연결 시 seed 폴백
- 배포: Vercel(icn1) — https://allfoods-seven.vercel.app · GitHub: knot30/allfoods
- 비밀키: Vercel env (`npx vercel env pull .env.local` 로 동기화, USB 불필요)

## 모듈 상태
| # | 모듈 | 상태 | 비고 |
|---|---|---|---|
| ① | 입찰·가격·AI 인텔리전스 | ✅ LIVE | 나라장터 실데이터, KAMIS(가격은 키 대기→fixture), AI 분석(haiku) |
| ② | 마스터 DB (거래처·상품·공급처) | ✅ LIVE | Supabase 실 DB, CRUD `/customers /products /suppliers` |
| ③ | 수주관리 | ✅ 코드완료 (테이블 생성 대기) | `/orders` 거래처+품목라인+합계. db/schema_orders.sql 실행 시 저장 활성 |
| ④ | 매입·검수 | ✅ 코드완료 (테이블 생성 대기) | `/purchases` 공급처+품목라인. 실매입가 → ① 원가 연결 예정 |
| ⑤ | 물류·배송 (거래명세·납품확인) | ⬜ 예정 | |
| ⑥ | 정산·재무 (매출·미수금·세금계산서) | ⬜ 예정 | |
| ⑦ | 급식 특화 규정 (원산지·인증·이력추적) | ⬜ 예정 | |
| ⑧ | 분석·보고서 (손익·낙찰률·엑셀) | ⬜ 예정 | |
| ⑨ | 시스템 (admin 로그인·알림·권한) | ⬜ 예정 | 현재 로그인 없음 |

## 유기적 연결 (되먹임) — 구현/예정
- products.kamis_item_code → ① 가격추적 매핑 (구현)
- products.purchase_price/sale_price → ① 권장투찰가 원가·마진 (구현, AI에 주입은 ⑧에서 정교화)
- ④ purchase_items 실매입가 → 품목별 실원가 → ① 권장투찰가 (③④ 후 뷰로 연결 예정)
- 입찰이력(bids) 낙찰/패찰 → 수요기관별 낙찰률 → ① 적합도/투찰율 (⑥ 이후)

## 미해결 / 사용자 액션
- KAMIS 키 발급 대기 (사용용도 작성중) → 받으면 가격 실데이터 전환
- ③④ 신규 테이블: `db/schema_orders.sql` 을 Supabase SQL Editor 에서 RUN 필요
- 도메인 allfoods.co.kr (비용상 보류)

## 작업 재개 방법 (다른 PC)
SETUP.md 참고. 요약: `git clone` → `npx vercel env pull .env.local` → `npm install` → `claude` → "ROADMAP 읽고 이어서 ⑤ 가자"
