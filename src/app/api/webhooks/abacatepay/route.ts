import { NextResponse } from "next/server";
import { markBillingAsPaid, getBillingStatus } from "@/services/billing";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const configuredSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;

    // Validação opcional de segurança por secret se configurado
    const querySecret = url.searchParams.get("webhookSecret") || url.searchParams.get("secret");
    const headerSecret = request.headers.get("x-webhook-secret") || request.headers.get("x-secret");
    const incomingSecret = querySecret || headerSecret;

    if (configuredSecret && incomingSecret && incomingSecret !== configuredSecret) {
      console.warn("[AbacatePay Webhook] Segredo inválido recebido:", incomingSecret);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const event = body?.event;
    const data = body?.data || body;

    console.log(`[AbacatePay Webhook] Evento recebido: ${event || "desconhecido"}`, data?.id);

    // Eventos de sucesso de pagamento na v2 ou v1
    const isPaymentCompleted =
      event === "checkout.completed" ||
      event === "transparent.completed" ||
      event === "billing.paid" ||
      data?.status === "PAID";

    if (isPaymentCompleted && data) {
      const billId = String(data.id || "");
      const externalId = String(data.externalId || "");

      let monthRef: string | null = null;

      if (externalId.startsWith("billing-")) {
        monthRef = externalId.replace("billing-", "");
      }

      // Se não veio no externalId, tenta identificar pelo mês devido atual
      if (!monthRef) {
        const billingStatus = await getBillingStatus();
        monthRef = billingStatus.dueMonthRef;
      }

      if (monthRef) {
        await markBillingAsPaid(monthRef, billId, "PIX/AbacatePay");
        console.log(`[AbacatePay Webhook] Mensalidade ${monthRef} aprovada e liberada com sucesso!`);
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error("[AbacatePay Webhook Error]:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 200 });
  }
}
