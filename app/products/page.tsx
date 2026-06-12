// 상품 마스터 — 서버 로드 후 클라이언트 뷰에 전달.
import { listProducts, hasSupabase } from "@/lib/db/master";
import { ProductsView } from "@/components/master/ProductsView";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await listProducts();
  return <ProductsView products={products} usingSeed={!hasSupabase()} />;
}
