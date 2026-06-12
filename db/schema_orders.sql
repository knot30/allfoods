-- allfoods ③④ 운영 테이블 (수주/매입). Supabase SQL Editor 에서 RUN.
-- (② schema.sql 의 customers/suppliers/products 가 먼저 있어야 함)

-- ── ③ 수주 ─────────────────────────────────────────────────
create table if not exists orders (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid references customers(id) on delete set null,
  customer_name text not null default '',          -- 스냅샷(거래처 변경/삭제돼도 기록 유지)
  order_date    date not null default current_date,
  delivery_date date,
  status        text not null default '접수',        -- 접수/확정/납품완료/취소
  total_amount  integer not null default 0,
  notes         text,
  created_at    timestamptz not null default now()
);
create table if not exists order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid references orders(id) on delete cascade,
  product_id   uuid references products(id) on delete set null,
  product_name text not null default '',
  unit         text default '',
  qty          numeric not null default 0,
  unit_price   integer not null default 0,          -- 판매단가
  amount       integer not null default 0           -- qty*unit_price
);

-- ── ④ 매입 ─────────────────────────────────────────────────
create table if not exists purchases (
  id            uuid primary key default gen_random_uuid(),
  supplier_id   uuid references suppliers(id) on delete set null,
  supplier_name text not null default '',
  purchase_date date not null default current_date,
  status        text not null default '발주',        -- 발주/입고완료/취소
  total_amount  integer not null default 0,
  notes         text,
  created_at    timestamptz not null default now()
);
create table if not exists purchase_items (
  id           uuid primary key default gen_random_uuid(),
  purchase_id  uuid references purchases(id) on delete cascade,
  product_id   uuid references products(id) on delete set null,
  product_name text not null default '',
  unit         text default '',
  qty          numeric not null default 0,
  unit_price   integer not null default 0,          -- 매입단가 (① 권장투찰가 원가로 집계 예정)
  amount       integer not null default 0
);

create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_purchase_items_purchase on purchase_items(purchase_id);
create index if not exists idx_orders_customer on orders(customer_id);
create index if not exists idx_purchases_supplier on purchases(supplier_id);

alter table orders         enable row level security;
alter table order_items    enable row level security;
alter table purchases      enable row level security;
alter table purchase_items enable row level security;
