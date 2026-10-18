import { NextResponse } from "next/server";
import { createOrder, getOrders, getOrdersGroupedByNeighborhood } from "@/services/orders";
import { isAdminAuthenticated } from "@/lib/auth";
import type { OrderStatus } from "@/types/order";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.customerWhatsapp || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Dados do pedido incompletos. Nome, WhatsApp e itens são obrigatórios." },
        { status: 400 }
      );
    }

    const order = await createOrder({
      customerName: body.customerName,
      customerWhatsapp: body.customerWhatsapp,
      deliveryType: body.deliveryType || "delivery",
      neighborhoodId: body.neighborhoodId || null,
      neighborhoodName: body.neighborhoodName || null,
      address: body.address || null,
      addressNumber: body.addressNumber || null,
      complement: body.complement || null,
      reference: body.reference || null,
      deliveryFee: Number(body.deliveryFee) || 0,
      subtotal: Number(body.subtotal) || 0,
      total: Number(body.total) || 0,
      paymentMethod: body.paymentMethod || "pix",
      paymentDetails: body.paymentDetails || null,
      items: body.items,
      notes: body.notes || null,
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json({ error: "Erro interno ao registrar pedido" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const grouped = searchParams.get("grouped") === "true";
    const status = (searchParams.get("status") || "all") as OrderStatus | "all";
    const deliveryType = (searchParams.get("deliveryType") || "all") as "delivery" | "pickup" | "all";
    const neighborhoodId = searchParams.get("neighborhoodId") || undefined;
    const search = searchParams.get("search") || undefined;

    if (grouped) {
      const groups = await getOrdersGroupedByNeighborhood(status);
      return NextResponse.json({ success: true, groups });
    }

    const orders = await getOrders({
      status,
      deliveryType,
      neighborhoodId,
      search,
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return NextResponse.json({ error: "Erro ao buscar pedidos" }, { status: 500 });
  }
}
