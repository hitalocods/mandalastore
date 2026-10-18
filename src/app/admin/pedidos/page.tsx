import { getOrders } from "@/services/orders";
import { getNeighborhoods } from "@/services/neighborhoods";
import { OrdersManager } from "@/components/admin/orders-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pedidos & Rotas por Bairro | Mandala Prime Admin",
};

export default async function AdminPedidosPage() {
  const [orders, neighborhoods] = await Promise.all([
    getOrders(),
    getNeighborhoods(),
  ]);

  return <OrdersManager initialOrders={orders} neighborhoods={neighborhoods} />;
}
