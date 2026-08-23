"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/store/cart-store";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  const availableSizes = useMemo(() => {
    if (!product.sizes) return [];
    return product.sizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [product.sizes]);

  const availableColors = useMemo(() => {
    if (!product.colors) return [];
    return product.colors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }, [product.colors]);

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || "");
  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0] || "");

  const handleAddToCart = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      toast.error("Selecione um tamanho antes de adicionar");
      return;
    }

    if (availableColors.length > 0 && !selectedColor) {
      toast.error("Selecione uma cor antes de adicionar");
      return;
    }

    const size = availableSizes.length > 0 ? selectedSize : undefined;
    const color = availableColors.length > 0 ? selectedColor : undefined;

    addItem(product, size, color);

    const details: string[] = [];
    if (size) details.push(`Tam: ${size}`);
    if (color) details.push(`Cor: ${color}`);

    if (details.length > 0) {
      toast.success(`Produto adicionado (${details.join(", ")})`);
    } else {
      toast.success("Produto adicionado");
    }
  };

  return (
    <motion.article
      layout
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="group min-w-0 overflow-hidden rounded-md border bg-card shadow-[0_16px_50px_rgba(15,15,15,0.035)] sm:rounded-lg sm:shadow-[0_20px_60px_rgba(15,15,15,0.04)]"
    >
      <div className="aspect-[1/1.12] overflow-hidden bg-muted sm:aspect-[4/5]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-stone-100 bg-gradient-to-r from-[#cc0000] to-[#d4af37] bg-clip-text text-xs uppercase tracking-[0.22em] text-transparent">
            STORE
          </div>
        )}
      </div>
      <div className="space-y-3 p-3 sm:space-y-4 sm:p-5">
        <div className="space-y-1">
          <p className="truncate text-[9px] uppercase tracking-[0.14em] text-black sm:text-[11px] sm:tracking-[0.18em]">
            {product.category}
          </p>
          <h3 className="line-clamp-2 min-h-9 text-sm font-medium leading-[1.15] tracking-tight text-black sm:line-clamp-1 sm:min-h-0 sm:text-base">
            {product.name}
          </h3>
          <p className="hidden line-clamp-2 min-h-10 text-sm leading-5 text-black sm:block">
            {product.description || "Selecao premium STORE."}
          </p>
        </div>

        {availableSizes.length > 0 && (
          <div className="space-y-1 pt-0.5">
            <p className="text-[10px] font-bold text-[#cc0000] uppercase tracking-wider">Tamanho:</p>
            <div className="flex flex-wrap gap-1">
              {availableSizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition cursor-pointer select-none ${
                    selectedSize === sz
                      ? "bg-[#cc0000] text-white border-[#cc0000] shadow-xs"
                      : "bg-background text-foreground border-border hover:border-foreground/40"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        )}

        {availableColors.length > 0 && (
          <div className="space-y-1 pt-0.5">
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Cor:</p>
            <div className="flex flex-wrap gap-1">
              {availableColors.map((cl) => (
                <button
                  key={cl}
                  type="button"
                  onClick={() => setSelectedColor(cl)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium border transition cursor-pointer select-none ${
                    selectedColor === cl
                      ? "bg-[#cc0000] text-white border-[#cc0000] shadow-xs font-semibold"
                      : "bg-background text-foreground border-border hover:border-foreground/40"
                  }`}
                >
                  {cl}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:flex sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-tight text-black sm:text-lg">{formatCurrency(product.price)}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-full rounded-full px-2 text-xs sm:w-auto sm:px-3 sm:text-sm"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Adicionar</span>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
