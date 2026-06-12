// ⑤ 납품 표준표 — 거래처별 표준 납품 품목·수량·단가.
import { listContracts, deliveryTablesReady } from "@/lib/db/delivery";
import { listCustomers, listProducts } from "@/lib/db/master";
import { ContractsView } from "@/components/delivery/ContractsView";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  const [contracts, customers, products, ready] = await Promise.all([
    listContracts(),
    listCustomers(),
    listProducts(),
    deliveryTablesReady(),
  ]);
  return (
    <ContractsView
      customers={customers.map((c) => ({ id: c.id, name: c.name }))}
      products={products}
      contracts={contracts}
      usingSeed={!ready}
    />
  );
}
