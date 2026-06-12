// AI 입찰 분석 — 서버에서 공고(경북 범위) 로드 후 클라이언트 뷰에 전달.
import { loadBids } from "@/lib/data";
import { AnalysisView } from "@/components/AnalysisView";

export const revalidate = 60;

export default async function AnalysisPage() {
  const bidsRes = await loadBids("gb");
  return <AnalysisView bidsRes={bidsRes} />;
}
