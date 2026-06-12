// 가격 추적 — 서버에서 로드 후 클라이언트 차트 뷰에 전달.
import { loadPrices } from "@/lib/data";
import { PricesView } from "@/components/PricesView";

export const revalidate = 60;

export default async function PricesPage() {
  const res = await loadPrices();
  return <PricesView res={res} />;
}
