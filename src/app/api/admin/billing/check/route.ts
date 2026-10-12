import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { checkMercadoPagoPaymentStatus, getBillingStatus } from "@/services/billing";

export async function POST(request: Request) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const billingStatus = await getBillingStatus();
    const monthRef = body.monthRef || billingStatus.dueMonthRef;

    const isPaid = await checkMercadoPagoPaymentStatus(monthRef);
    const updatedStatus = await getBillingStatus();

    return NextResponse.json({
      success: true,
      isPaid,
      isBlocked: updatedStatus.isBlocked,
      status: updatedStatus.status,
    });
  } catch (error: unknown) {
    console.error("Erro ao verificar pagamento:", error);
    const message = error instanceof Error ? error.message : "Erro ao consultar status no Mercado Pago";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
