"use server";

// ② 마스터 CRUD 서버 액션. 폼에서 직접 호출. 결과는 {ok,error} 로 반환(throw 대신)해 UI 표시.
import { revalidatePath } from "next/cache";
import {
  upsertCustomer,
  deleteCustomer,
  upsertSupplier,
  deleteSupplier,
  upsertProduct,
  deleteProduct,
} from "@/lib/db/master";
import type { ActionResult } from "@/lib/types-master";

const str = (fd: FormData, k: string): string | null => {
  const v = (fd.get(k) as string | null)?.trim();
  return v ? v : null;
};
const intOf = (fd: FormData, k: string): number | null => {
  const v = str(fd, k);
  if (v == null) return null;
  const n = Number(v.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : null;
};

function fail(e: unknown): ActionResult {
  return { ok: false, error: e instanceof Error ? e.message : "저장 실패" };
}

// ── 거래처 ─────────────────────────────────────────────────────
export async function saveCustomer(
  _prev: ActionResult,
  fd: FormData,
): Promise<ActionResult> {
  try {
    await upsertCustomer({
      id: str(fd, "id") ?? undefined,
      name: str(fd, "name") ?? "",
      type: (str(fd, "type") as never) ?? "학교",
      region: str(fd, "region") ?? "",
      bizNo: str(fd, "bizNo"),
      contactName: str(fd, "contactName"),
      contactPhone: str(fd, "contactPhone"),
      contactEmail: str(fd, "contactEmail"),
      address: str(fd, "address"),
      deliveryRoute: str(fd, "deliveryRoute"),
      notes: str(fd, "notes"),
    });
    revalidatePath("/customers");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
export async function removeCustomer(id: string): Promise<ActionResult> {
  try {
    await deleteCustomer(id);
    revalidatePath("/customers");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ── 공급처 ─────────────────────────────────────────────────────
export async function saveSupplier(
  _prev: ActionResult,
  fd: FormData,
): Promise<ActionResult> {
  try {
    await upsertSupplier({
      id: str(fd, "id") ?? undefined,
      name: str(fd, "name") ?? "",
      type: (str(fd, "type") as never) ?? "산지",
      region: str(fd, "region") ?? "",
      bizNo: str(fd, "bizNo"),
      contactName: str(fd, "contactName"),
      contactPhone: str(fd, "contactPhone"),
      notes: str(fd, "notes"),
    });
    revalidatePath("/suppliers");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
export async function removeSupplier(id: string): Promise<ActionResult> {
  try {
    await deleteSupplier(id);
    revalidatePath("/suppliers");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ── 상품 ───────────────────────────────────────────────────────
export async function saveProduct(
  _prev: ActionResult,
  fd: FormData,
): Promise<ActionResult> {
  try {
    await upsertProduct({
      id: str(fd, "id") ?? undefined,
      name: str(fd, "name") ?? "",
      category: (str(fd, "category") as never) ?? "채소류",
      unit: str(fd, "unit") ?? "",
      origin: str(fd, "origin"),
      spec: str(fd, "spec"),
      isEco: fd.get("isEco") === "on" || fd.get("isEco") === "true",
      cert: str(fd, "cert"),
      kamisItemCode: str(fd, "kamisItemCode"),
      purchasePrice: intOf(fd, "purchasePrice"),
      salePrice: intOf(fd, "salePrice"),
      notes: str(fd, "notes"),
    });
    revalidatePath("/products");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
export async function removeProduct(id: string): Promise<ActionResult> {
  try {
    await deleteProduct(id);
    revalidatePath("/products");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
