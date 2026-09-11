import type { Product } from "@/types/product";

export type CartItem = {
  id: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  /** Effective price for the chosen size variant. Falls back to product.price when absent. */
  selectedPrice?: number;
};
