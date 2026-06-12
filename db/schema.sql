-- allfoods 스키마 (Supabase / Postgres)
-- ② 마스터 데이터부터. ③~⑥ 운영 테이블은 이 마스터를 FK 로 참조하며 추가될 예정.
-- 실행: Supabase 대시보드 > SQL Editor 에 붙여넣고 RUN.

-- 확장 (uuid 생성)
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- 거래처 (매출처) — 학교/기관 등 수요처
create table if not exists customers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text not null default '학교',      -- 학교/유치원/어린이집/요양시설/기관/기타
  region        text not null default '',           -- 예: 경상북도 예천군
  biz_no        text,                                -- 사업자등록번호
  contact_name  text,                                -- 담당자(영양사 등)
  contact_phone text,
  contact_email text,
  address       text,
  delivery_route text,                               -- 배송 권역/동선 (⑤ 물류 연결)
  notes         text,
  created_at    timestamptz not null default now()
);

-- 공급처 (매입처) — 산지/도매시장/생산자
create table if not exists suppliers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text not null default '산지',        -- 산지/도매시장/생산자/벤더/기타
  region        text not null default '',
  biz_no        text,
  contact_name  text,
  contact_phone text,
  notes         text,
  created_at    timestamptz not null default now()
);

-- 상품 (식자재)
create table if not exists products (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  category        text not null default '채소류',     -- 식량작물/채소류/축산물/수산물/과일류/가공식품/기타
  unit            text not null default '',           -- 20kg, 1kg, 특란 30개
  origin          text,                               -- 원산지 (⑦ 규정)
  spec            text,                               -- 규격
  is_eco          boolean not null default false,     -- 친환경 여부
  cert            text,                               -- 인증 (HACCP/무농약/유기농)
  kamis_item_code text,                               -- ① 가격추적(KAMIS) 연결 키
  purchase_price  integer,                            -- 매입 단가(원) — ① 권장투찰가 원가 기준
  sale_price      integer,                            -- 판매 단가(원)
  notes           text,
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- 향후 추가될 운영 테이블 (유기적 연결 설계 메모):
--   bids        입찰이력  → customer_id(수요기관), basis_price, our_bid_price, outcome(win/loss)
--                          → 낙찰률·투찰율 집계가 ① AI 분석으로 되먹임
--   orders      수주      → customer_id, 납품일, order_items(product_id, qty, price)
--   purchases   매입      → supplier_id, 입고일, purchase_items(product_id, qty, price)
--                          → 실매입가 이력이 ① 권장투찰가의 원가로 사용
--   deliveries  배송      → order_id, 거래명세/납품확인
--   invoices    정산      → customer_id, 매출/미수금/세금계산서
-- 분석 뷰(추후): v_item_cost(품목별 평균 실매입가), v_bid_winrate(수요기관별 낙찰률),
--                v_item_margin(품목별 마진) → ① analyze 가 이 뷰들을 읽어 추천 정밀화.

-- RLS: service role 로만 서버 접근(프로토타입). 공개 정책 없음 → 익명 차단.
alter table customers enable row level security;
alter table suppliers enable row level security;
alter table products  enable row level security;
