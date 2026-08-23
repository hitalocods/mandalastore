"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

function getCartItemId(productId: string, selectedSize?: string, selectedColor?: string): string {
  const parts = [productId];
  if (selectedSize) parts.push(`sz:${selectedSize}`);
  if (selectedColor) parts.push(`cl:${selectedColor}`);
  return parts.join("-");
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (product: Product, selectedSize?: string, selectedColor?: string) => void;
  removeItem: (itemId: string) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "store.cart.v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CartItem[];
        const normalized = parsed.map((item) => ({
          ...item,
          id: item.id || getCartItemId(item.product.id, item.selectedSize, item.selectedColor),
        }));
        setItems(normalized);
      } catch {
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Product, selectedSize?: string, selectedColor?: string) => {
    setItems((current) => {
      const itemId = getCartItemId(product.id, selectedSize, selectedColor);
      const existing = current.find(
        (item) =>
          item.id === itemId ||
          (item.product.id === product.id &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor),
      );
      
      if (existing) {
        return current.map((item) =>
          (item.id === itemId ||
          (item.product.id === product.id &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor))
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock || 99) }
            : item,
        );
      }

      return [...current, { id: itemId, product, quantity: 1, selectedSize, selectedColor }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((current) => current.filter((item) => item.id !== itemId && item.product.id !== itemId));
  }, []);

  const setQuantity = useCallback((itemId: string, quantity: number) => {
    setItems((current) =>
      current
        .map((item) =>
          (item.id === itemId || item.product.id === itemId)
            ? { ...item, quantity: Math.max(1, Math.min(quantity, item.product.stock || 99)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    return { items, count, subtotal, addItem, removeItem, setQuantity, clearCart };
  }, [addItem, clearCart, items, removeItem, setQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
