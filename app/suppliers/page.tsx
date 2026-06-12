// 공급처 마스터 — 서버 로드 후 클라이언트 뷰에 전달.
import { listSuppliers, hasSupabase } from "@/lib/db/master";
import { SuppliersView } from "@/components/master/SuppliersView";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const suppliers = await listSuppliers();
  return <SuppliersView suppliers={suppliers} usingSeed={!hasSupabase()} />;
}
