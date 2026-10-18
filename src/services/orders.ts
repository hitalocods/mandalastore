import { sql } from "@/lib/db";
import type { Order, OrderStatus, NeighborhoodRouteGroup, OrderItem, OrderPaymentDetails } from "@/types/order";

/**
 * Garante que a tabela orders existe no banco
 */
export async function ensureOrdersTable(): Promise<void> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        order_number SERIAL,
        customer_name TEXT NOT NULL,
        customer_whatsapp TEXT NOT NULL,
        delivery_type TEXT NOT NULL DEFAULT 'delivery',
        neighborhood_id TEXT,
        neighborhood_name TEXT,
        address TEXT,
        address_number TEXT,
        complement TEXT,
        reference TEXT,
        delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
        subtotal DECIMAL(10, 2) NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        payment_method TEXT NOT NULL,
        payment_details JSONB,
        items JSONB NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_orders_neighborhood ON orders(neighborhood_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)`;
  } catch (error) {
    console.error("Erro ao garantir tabela orders:", error);
  }
}

interface CreateOrderInput {
  customerName: string;
  customerWhatsapp: string;
  deliveryType: "delivery" | "pickup";
  neighborhoodId?: string | null;
  neighborhoodName?: string | null;
  address?: string | null;
  addressNumber?: string | null;
  complement?: string | null;
  reference?: string | null;
  deliveryFee: number;
  subtotal: number;
  total: number;
  paymentMethod: "pix" | "money" | "debit" | "credit";
  paymentDetails?: OrderPaymentDetails | null;
  items: OrderItem[];
  notes?: string | null;
}

/**
 * Cria um novo pedido no banco de dados
 */
export async function createOrder(data: CreateOrderInput): Promise<Order> {
  await ensureOrdersTable();

  const id = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const paymentDetailsJson = JSON.stringify(data.paymentDetails || {});
  const itemsJson = JSON.stringify(data.items || []);

  const result = await sql`
    INSERT INTO orders (
      id,
      customer_name,
      customer_whatsapp,
      delivery_type,
      neighborhood_id,
      neighborhood_name,
      address,
      address_number,
      complement,
      reference,
      delivery_fee,
      subtotal,
      total,
      payment_method,
      payment_details,
      items,
      status,
      notes
    ) VALUES (
      ${id},
      ${data.customerName},
      ${data.customerWhatsapp},
      ${data.deliveryType},
      ${data.neighborhoodId || null},
      ${data.neighborhoodName || null},
      ${data.address || null},
      ${data.addressNumber || null},
      ${data.complement || null},
      ${data.reference || null},
      ${data.deliveryFee},
      ${data.subtotal},
      ${data.total},
      ${data.paymentMethod},
      ${paymentDetailsJson}::jsonb,
      ${itemsJson}::jsonb,
      'pending',
      ${data.notes || null}
    )
    RETURNING *
  `;

  return mapRowToOrder(result[0]);
}

/**
 * Lista pedidos com filtros opcionais
 */
export async function getOrders(filters?: {
  status?: OrderStatus | "all";
  deliveryType?: "delivery" | "pickup" | "all";
  neighborhoodId?: string;
  search?: string;
}): Promise<Order[]> {
  await ensureOrdersTable();

  let query = sql`
    SELECT * FROM orders
    WHERE 1=1
  `;

  if (filters?.status && filters.status !== "all") {
    query = sql`${query} AND status = ${filters.status}`;
  }

  if (filters?.deliveryType && filters.deliveryType !== "all") {
    query = sql`${query} AND delivery_type = ${filters.deliveryType}`;
  }

  if (filters?.neighborhoodId) {
    query = sql`${query} AND neighborhood_id = ${filters.neighborhoodId}`;
  }

  if (filters?.search && filters.search.trim().length > 0) {
    const searchPattern = `%${filters.search.trim()}%`;
    query = sql`${query} AND (
      customer_name ILIKE ${searchPattern}
      OR customer_whatsapp ILIKE ${searchPattern}
      OR address ILIKE ${searchPattern}
      OR neighborhood_name ILIKE ${searchPattern}
      OR id ILIKE ${searchPattern}
    )`;
  }

  const rows = await sql`
    ${query}
    ORDER BY created_at DESC
  `;

  return rows.map(mapRowToOrder);
}

/**
 * Agrupa pedidos de entrega por bairro para facilitar rotas
 */
export async function getOrdersGroupedByNeighborhood(statusFilter?: OrderStatus | "all"): Promise<NeighborhoodRouteGroup[]> {
  await ensureOrdersTable();

  // Busca todos os pedidos que são do tipo 'delivery'
  let query = sql`
    SELECT o.*, COALESCE(n.sort_order, 999) as neighborhood_sort
    FROM orders o
    LEFT JOIN neighborhoods n ON n.id = o.neighborhood_id
    WHERE o.delivery_type = 'delivery'
  `;

  if (statusFilter && statusFilter !== "all") {
    query = sql`${query} AND o.status = ${statusFilter}`;
  } else {
    // Por padrão na visão de rota, focar nos não cancelados
    query = sql`${query} AND o.status != 'cancelled'`;
  }

  const rows = await sql`
    ${query}
    ORDER BY neighborhood_sort ASC, o.neighborhood_name ASC, o.created_at ASC
  `;

  const groupsMap = new Map<string, NeighborhoodRouteGroup>();

  for (const row of rows) {
    const order = mapRowToOrder(row);
    const nId = order.neighborhood_id || "sem-bairro";
    const nName = order.neighborhood_name || "Bairro não informado";

    if (!groupsMap.has(nId)) {
      groupsMap.set(nId, {
        neighborhoodId: nId,
        neighborhoodName: nName,
        deliveryFee: order.delivery_fee,
        totalOrders: 0,
        totalRevenue: 0,
        orders: [],
      });
    }

    const group = groupsMap.get(nId)!;
    group.totalOrders += 1;
    group.totalRevenue += order.total;
    group.orders.push(order);
  }

  return Array.from(groupsMap.values());
}

/**
 * Atualiza o status de um pedido
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
  await ensureOrdersTable();

  const rows = await sql`
    UPDATE orders
    SET status = ${status}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${orderId}
    RETURNING *
  `;

  if (rows.length === 0) return null;
  return mapRowToOrder(rows[0]);
}

/**
 * Exclui um pedido
 */
export async function deleteOrder(orderId: string): Promise<boolean> {
  await ensureOrdersTable();

  const result = await sql`
    DELETE FROM orders
    WHERE id = ${orderId}
  `;

  return (result as unknown as { count?: number })?.count !== 0;
}

/**
 * Retorna estatísticas rápidas dos pedidos
 */
export async function getOrderStats(): Promise<{
  totalOrders: number;
  pendingCount: number;
  preparingCount: number;
  dispatchedCount: number;
  deliveredCount: number;
  totalRevenue: number;
}> {
  await ensureOrdersTable();

  const rows = await sql`
    SELECT
      COUNT(*)::int AS total_orders,
      COUNT(CASE WHEN status = 'pending' THEN 1 END)::int AS pending_count,
      COUNT(CASE WHEN status = 'preparing' THEN 1 END)::int AS preparing_count,
      COUNT(CASE WHEN status = 'dispatched' THEN 1 END)::int AS dispatched_count,
      COUNT(CASE WHEN status = 'delivered' THEN 1 END)::int AS delivered_count,
      COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0)::float AS total_revenue
    FROM orders
  `;

  const row = rows[0] || {};
  return {
    totalOrders: Number(row.total_orders) || 0,
    pendingCount: Number(row.pending_count) || 0,
    preparingCount: Number(row.preparing_count) || 0,
    dispatchedCount: Number(row.dispatched_count) || 0,
    deliveredCount: Number(row.delivered_count) || 0,
    totalRevenue: Number(row.total_revenue) || 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToOrder(row: any): Order {
  let items: OrderItem[] = [];
  if (typeof row.items === "string") {
    try {
      items = JSON.parse(row.items);
    } catch {
      items = [];
    }
  } else if (Array.isArray(row.items)) {
    items = row.items;
  }

  let paymentDetails: OrderPaymentDetails | null = null;
  if (typeof row.payment_details === "string") {
    try {
      paymentDetails = JSON.parse(row.payment_details);
    } catch {
      paymentDetails = null;
    }
  } else if (row.payment_details && typeof row.payment_details === "object") {
    paymentDetails = row.payment_details;
  }

  return {
    id: String(row.id),
    order_number: Number(row.order_number) || 0,
    customer_name: String(row.customer_name),
    customer_whatsapp: String(row.customer_whatsapp),
    delivery_type: (row.delivery_type as "delivery" | "pickup") || "delivery",
    neighborhood_id: row.neighborhood_id ? String(row.neighborhood_id) : null,
    neighborhood_name: row.neighborhood_name ? String(row.neighborhood_name) : null,
    address: row.address ? String(row.address) : null,
    address_number: row.address_number ? String(row.address_number) : null,
    complement: row.complement ? String(row.complement) : null,
    reference: row.reference ? String(row.reference) : null,
    delivery_fee: Number(row.delivery_fee) || 0,
    subtotal: Number(row.subtotal) || 0,
    total: Number(row.total) || 0,
    payment_method: row.payment_method,
    payment_details: paymentDetails,
    items,
    status: (row.status as OrderStatus) || "pending",
    notes: row.notes ? String(row.notes) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}
