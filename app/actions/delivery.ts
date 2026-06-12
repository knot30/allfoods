"use server";

// ⑤ 납품 서버 액션 (표준표 저장 / 납품 생성·삭제).
import { revalidatePath } from "next/cache";
import {
  replaceContract,
  createDelivery,
  deleteDelivery,
  type DeliveryInput,
} from "@/lib/db/delivery";
import type { ContractLine } from "@/lib/types-delivery";
import type { ActionResult } from "@/lib/types-master";

const fail = (e: unknown): ActionResult => ({
  ok: false,
  error: e instanceof Error ? e.message : "처리 실패",
});

export async function saveContractAction(
  customerId: string | null,
  customerName: string,
  lines: Omit<ContractLine, "id" | "customerId" | "customerName">[],
): Promise<ActionResult> {
  try {
    if (!customerName) throw new Error("거래처를 선택하세요.");
    await replaceContract(customerId, customerName, lines);
    revalidatePath("/contracts");
    revalidatePath("/deliveries");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function createDeliveryAction(input: DeliveryInput): Promise<ActionResult> {
  try {
    if (!input.customerName) throw new Error("거래처를 선택하세요.");
    if (!input.items.some((it) => it.delivered && it.qty > 0))
      throw new Error("납품 품목을 1개 이상 체크하세요.");
    await createDelivery(input);
    revalidatePath("/deliveries");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteDeliveryAction(id: string): Promise<ActionResult> {
  try {
    await deleteDelivery(id);
    revalidatePath("/deliveries");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
