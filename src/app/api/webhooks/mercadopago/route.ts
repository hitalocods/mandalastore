import { NextResponse } from "next/server";
import { markBillingAsPaid } from "@/services/billing";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));

    // O Mercado Pago pode enviar o ID do pagamento no query param (?data.id=... ou ?id=...) ou no body ({ data: { id: ... } })
    const paymentId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id") ||
      body?.data?.id ||
      body?.id;

    const topic = url.searchParams.get("type") || url.searchParams.get("topic") || body?.type || body?.topic;

    if (!paymentId || (topic && topic !== "payment")) {
      return NextResponse.json({ received: true });
    }

    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "Token não configurado" }, { status: 500 });
    }

    // Consulta os detalhes do pagamento no Mercado Pago
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return NextResponse.json({ received: true });
    }

    const paymentData = await res.json();

    // Se o pagamento foi aprovado
    if (paymentData.status === "approved") {
      const extRef = paymentData.external_reference; // ex: 'billing-2026-10'
      if (extRef && typeof extRef === "string" && extRef.startsWith("billing-")) {
        const monthRef = extRef.replace("billing-", "");
        await markBillingAsPaid(
          monthRef,
          String(paymentData.id),
          paymentData.payment_type_id || paymentData.payment_method_id
        );
        console.log(`[Mercado Pago Webhook] Mensalidade ${monthRef} aprovada e liberada!`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Mercado Pago Webhook Error]:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
