// 거래처 마스터 — 서버에서 목록 로드 후 클라이언트 뷰에 전달.
import { listCustomers, hasSupabase } from "@/lib/db/master";
import { CustomersView } from "@/components/master/CustomersView";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await listCustomers();
  return <CustomersView customers={customers} usingSeed={!hasSupabase()} />;
}
