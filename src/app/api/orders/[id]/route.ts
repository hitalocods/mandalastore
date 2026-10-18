import { NextResponse } from "next/server";
import { updateOrderStatus, deleteOrder } from "@/services/orders";
import { isAdminAuthenticated } from "@/lib/auth";
import type { OrderStatus } from "@/types/order";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    if (!body.status) {
      return NextResponse.json({ error: "Status não fornecido" }, { status: 400 });
    }

    const updated = await updateOrderStatus(id, body.status as OrderStatus);
    if (!updated) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    return NextResponse.json({ error: "Erro ao atualizar pedido" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await deleteOrder(id);

    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error("Erro ao excluir pedido:", error);
    return NextResponse.json({ error: "Erro ao excluir pedido" }, { status: 500 });
  }
}
