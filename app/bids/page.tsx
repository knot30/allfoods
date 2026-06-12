// 입찰 공고 — 서버에서 초기(예천·영주) 로드 후 클라이언트 뷰에 전달.
import { loadBids } from "@/lib/data";
import { BidsView } from "@/components/BidsView";

export const revalidate = 60;

export default async function BidsPage() {
  const initial = await loadBids("local");
  return <BidsView initial={initial} initialRegion="local" />;
}
