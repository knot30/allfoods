// ④ 매입 — 공급처(매입처) + 상품 마스터를 엮어 발주·입고. 실매입가가 ① 원가로 연결됨.
import { listTx, txTablesReady } from "@/lib/db/tx";
import { listSuppliers, listProducts } from "@/lib/db/master";
import { TxView } from "@/components/tx/TxView";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const [list, suppliers, products, ready] = await Promise.all([
    listTx("purchase"),
    listSuppliers(),
    listProducts(),
    txTablesReady(),
  ]);
  const parties = suppliers.map((s) => ({ id: s.id, name: s.name }));
  return (
    <TxView kind="purchase" list={list} parties={parties} products={products} usingSeed={!ready} />
  );
}
