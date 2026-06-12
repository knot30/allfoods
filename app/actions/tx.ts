"use server";

// ③④ 수주/매입 서버 액션. 라인아이템이 동적이라 FormData 대신 구조화 인자 사용.
import { revalidatePath } from "next/cache";
import { createTx, updateTxStatus, deleteTx, type TxInput } from "@/lib/db/tx";
import type { TxKind } from "@/lib/types-tx";
import type { ActionResult } from "@/lib/types-master";

const pathOf = (kind: TxKind) => (kind === "order" ? "/orders" : "/purchases");
const fail = (e: unknown): ActionResult => ({
  ok: false,
  error: e instanceof Error ? e.message : "처리 실패",
});

export async function createTxAction(kind: TxKind, input: TxInput): Promise<ActionResult> {
  try {
    if (!input.partyName) throw new Error(kind === "order" ? "거래처를 선택하세요." : "공급처를 선택하세요.");
    if (!input.items.some((it) => it.productName && it.qty > 0))
      throw new Error("품목을 1개 이상 입력하세요.");
    await createTx(kind, input);
    revalidatePath(pathOf(kind));
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateStatusAction(kind: TxKind, id: string, status: string): Promise<ActionResult> {
  try {
    await updateTxStatus(kind, id, status);
    revalidatePath(pathOf(kind));
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteTxAction(kind: TxKind, id: string): Promise<ActionResult> {
  try {
    await deleteTx(kind, id);
    revalidatePath(pathOf(kind));
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
