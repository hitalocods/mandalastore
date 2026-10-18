export type OrderStatus =
  | "pending"
  | "preparing"
  | "dispatched"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string | null;
  color?: string | null;
  imageUrl?: string | null;
}

export interface OrderPaymentDetails {
  installments?: number;
  needsChange?: boolean;
  changeFor?: number;
}

export interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  customer_whatsapp: string;
  delivery_type: "delivery" | "pickup";
  neighborhood_id?: string | null;
  neighborhood_name?: string | null;
  address?: string | null;
  address_number?: string | null;
  complement?: string | null;
  reference?: string | null;
  delivery_fee: number;
  subtotal: number;
  total: number;
  payment_method: "pix" | "money" | "debit" | "credit";
  payment_details?: OrderPaymentDetails | null;
  items: OrderItem[];
  status: OrderStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NeighborhoodRouteGroup {
  neighborhoodId: string;
  neighborhoodName: string;
  deliveryFee: number;
  totalOrders: number;
  totalRevenue: number;
  orders: Order[];
}
