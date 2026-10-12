import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getOrCreateMercadoPagoPreference, getBillingStatus } from "@/services/billing";

export async function POST(request: Request) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const billingStatus = await getBillingStatus();
    const monthRef = body.monthRef || billingStatus.dueMonthRef;

    // Determina a URL base dinamicamente da requisição
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = `${proto}://${host}`;

    const { initPoint, preferenceId } = await getOrCreateMercadoPagoPreference(monthRef, baseUrl);

    return NextResponse.json({
      success: true,
      initPoint,
      preferenceId,
      monthRef,
    });
  } catch (error: unknown) {
    console.error("Erro ao gerar checkout:", error);
    const message = error instanceof Error ? error.message : "Erro ao gerar checkout do Mercado Pago";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
