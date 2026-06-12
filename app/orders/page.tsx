// ③ 수주 — 거래처(매출처) + 상품 마스터를 엮어 발주 접수.
import { listTx, txTablesReady } from "@/lib/db/tx";
import { listCustomers, listProducts } from "@/lib/db/master";
import { TxView } from "@/components/tx/TxView";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const [list, customers, products, ready] = await Promise.all([
    listTx("order"),
    listCustomers(),
    listProducts(),
    txTablesReady(),
  ]);
  const parties = customers.map((c) => ({ id: c.id, name: c.name }));
  return (
    <TxView kind="order" list={list} parties={parties} products={products} usingSeed={!ready} />
  );
}
