import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { markBillingAsPaid, getBillingStatus } from "@/services/billing";

export async function POST(request: Request) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { key, monthRef } = await request.json().catch(() => ({}));
    const masterKey = process.env.SYSTEM_BILLING_BYPASS_KEY || "mandala_master_unlock_2026";

    if (!key || key !== masterKey) {
      return NextResponse.json({ error: "Chave mestre inválida" }, { status: 403 });
    }

    const currentStatus = await getBillingStatus();
    const targetMonth = monthRef || currentStatus.dueMonthRef;

    await markBillingAsPaid(targetMonth, "MANUAL_BYPASS", "admin_override");

    return NextResponse.json({
      success: true,
      message: `Mensalidade de ${targetMonth} liberada manualmente com sucesso!`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao aplicar liberação";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
