-- allfoods 납품 관리 (⑤). schema.sql(②) 이후 실행. 재실행 안전(if not exists).

-- 상품에 기본 매입처 추가 (납품 줄에 매입가·매입처 자동 snapshot 용)
alter table products add column if not exists default_supplier_id uuid references suppliers(id) on delete set null;
alter table products add column if not exists default_supplier_name text;

-- 거래처별 표준 납품표 (계약: 품목·표준수량·판매단가)
create table if not exists delivery_contracts (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid references customers(id) on delete cascade,
  customer_name text not null default '',
  product_id   uuid references products(id) on delete set null,
  product_name text not null default '',
  unit         text default '',
  std_qty      numeric not null default 0,
  sale_price   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- 일일 납품 (헤더)
create table if not exists deliveries (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid references customers(id) on delete set null,
  customer_name text not null default '',
  delivery_date date not null default current_date,
  status        text not null default '완료',   -- 예정/완료/일부/미납
  total_sale    integer not null default 0,
  total_cost    integer not null default 0,
  total_margin  integer not null default 0,
  notes         text,
  created_at    timestamptz not null default now()
);

-- 납품 품목 (매입가·매입처 snapshot → 어디서 얼마에 → 누구에게 추적)
create table if not exists delivery_items (
  id              uuid primary key default gen_random_uuid(),
  delivery_id     uuid references deliveries(id) on delete cascade,
  product_id      uuid references products(id) on delete set null,
  product_name    text not null default '',
  unit            text default '',
  qty             numeric not null default 0,
  sale_price      integer not null default 0,   -- 판매단가
  sale_amount     integer not null default 0,
  purchase_price  integer not null default 0,   -- 매입단가 snapshot
  purchase_amount integer not null default 0,
  supplier_name   text default '',              -- 매입처 snapshot
  delivered       boolean not null default true
);

create index if not exists idx_contracts_customer on delivery_contracts(customer_id);
create index if not exists idx_deliveries_date on deliveries(delivery_date);
create index if not exists idx_deliveries_customer on deliveries(customer_id);
create index if not exists idx_delivery_items_delivery on delivery_items(delivery_id);
create index if not exists idx_delivery_items_product on delivery_items(product_id);

alter table delivery_contracts enable row level security;
alter table deliveries         enable row level security;
alter table delivery_items     enable row level security;
