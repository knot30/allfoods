// ⑤ 일일 납품 보드 — 표준표 + 상품원가를 엮어 매일 납품 체크/기록.
import { listContracts, listDeliveries, deliveryTablesReady } from "@/lib/db/delivery";
import { listCustomers, listProducts } from "@/lib/db/master";
import { DeliveryBoard } from "@/components/delivery/DeliveryBoard";

export const dynamic = "force-dynamic";

export default async function DeliveriesPage() {
  const [contracts, deliveries, customers, products, ready] = await Promise.all([
    listContracts(),
    listDeliveries(),
    listCustomers(),
    listProducts(),
    deliveryTablesReady(),
  ]);
  return (
    <DeliveryBoard
      customers={customers.map((c) => ({ id: c.id, name: c.name }))}
      products={products}
      contracts={contracts}
      deliveries={deliveries}
      usingSeed={!ready}
    />
  );
}
