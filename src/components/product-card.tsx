"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Layers, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/store/cart-store";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [modalOpen, setModalOpen] = useState(false);

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

  const allImages = useMemo(() => {
    if (product.images) {
      const list = product.images.split(",").map((s) => s.trim()).filter(Boolean);
      if (list.length > 0) return list;
    }
    return product.image_url ? [product.image_url] : [];
  }, [product.images, product.image_url]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const hasOptions = availableSizes.length > 0 || availableColors.length > 0;
  const hasMultipleImages = allImages.length > 1;

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || "");
  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0] || "");

  const handleCardButtonClick = () => {
    if (hasOptions) {
      setModalOpen(true);
      return;
    }

    addItem(product);
    toast.success("Produto adicionado ao carrinho!");
  };

  const handleOpenModal = () => {
    setActiveImageIndex(0);
    setModalOpen(true);
  };

  const handleAddWithOptions = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      toast.error("Por favor, selecione um tamanho.");
      return;
    }

    if (availableColors.length > 0 && !selectedColor) {
      toast.error("Por favor, selecione uma cor.");
      return;
    }

    const size = availableSizes.length > 0 ? selectedSize : undefined;
    const color = availableColors.length > 0 ? selectedColor : undefined;

    addItem(product, size, color);

    const details: string[] = [];
    if (size) details.push(`Tam: ${size}`);
    if (color) details.push(`Cor: ${color}`);

    if (details.length > 0) {
      toast.success(`Produto adicionado! (${details.join(" • ")})`);
    } else {
      toast.success("Produto adicionado ao carrinho!");
    }
    setModalOpen(false);
  };

  const currentCoverImage = allImages[0] || product.image_url;

  return (
    <>
      <motion.article
        layout
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        whileHover={{ y: -3 }}
        className="group flex h-full flex-col justify-between overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition hover:shadow-[0_16px_40px_rgba(204,0,0,0.08)] sm:rounded-2xl"
      >
        <div>
          {/* Product Image */}
          <div
            onClick={handleOpenModal}
            className="relative aspect-square overflow-hidden bg-slate-50 cursor-pointer"
          >
            {currentCoverImage ? (
              <img
                src={currentCoverImage}
                alt={product.name}
                className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-stone-100 bg-gradient-to-r from-[#cc0000] to-[#d4af37] bg-clip-text text-xs uppercase tracking-[0.22em] text-transparent">
                STORE
              </div>
            )}

            {/* Badges on card */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {hasOptions && (
                <div className="rounded-full bg-black/75 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
                  <Layers className="h-2.5 w-2.5 text-amber-400" />
                  <span>Opções</span>
                </div>
              )}
            </div>

            {hasMultipleImages && (
              <div className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
                <span>{allImages.length} fotos</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-1.5 p-3 sm:p-4">
            <p className="truncate text-[9px] uppercase tracking-[0.16em] font-semibold text-muted-foreground sm:text-[10px]">
              {product.category}
            </p>
            <h3
              onClick={handleOpenModal}
              className="line-clamp-2 min-h-[2.5rem] text-xs font-semibold leading-snug tracking-tight text-slate-900 sm:text-sm hover:text-[#cc0000] transition cursor-pointer"
            >
              {product.name}
            </h3>
            <p className="line-clamp-1 text-xs text-slate-500">
              {product.description || "Produto oficial Mandalla Prime"}
            </p>
          </div>
        </div>

        {/* Price & Action Bottom */}
        <div className="p-3 pt-0 sm:p-4 sm:pt-0">
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
            <div className="min-w-0">
              <span className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
                {formatCurrency(product.price)}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className={`h-8 rounded-full px-2.5 text-xs font-semibold transition sm:h-8.5 sm:px-3.5 cursor-pointer ${
                hasOptions
                  ? "border-[#cc0000]/30 text-[#cc0000] bg-rose-50/50 hover:bg-[#cc0000] hover:text-white"
                  : "border-slate-200 text-slate-800 hover:border-[#cc0000] hover:text-[#cc0000] hover:bg-rose-50/30"
              }`}
              onClick={handleCardButtonClick}
              disabled={product.stock <= 0}
            >
              {hasOptions ? (
                <>
                  <span className="text-[11px] sm:text-xs">Escolher</span>
                  <ChevronRight className="h-3 w-3 ml-0.5" />
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-0.5" />
                  <span>Adicionar</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.article>

      {/* Quick Selection & Image Gallery Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Gallery Image Display */}
              <div className="space-y-2 pb-4 border-b border-slate-100">
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center">
                  {allImages[activeImageIndex] ? (
                    <img
                      src={allImages[activeImageIndex]}
                      alt={product.name}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-xs font-bold text-slate-400">STORE</span>
                  )}

                  {allImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveImageIndex((prev) =>
                            prev === 0 ? allImages.length - 1 : prev - 1,
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-slate-700 shadow-md backdrop-blur-xs hover:bg-white transition cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveImageIndex((prev) =>
                            prev === allImages.length - 1 ? 0 : prev + 1,
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-slate-700 shadow-md backdrop-blur-xs hover:bg-white transition cursor-pointer"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails strip */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {allImages.map((imgUrl, idx) => (
                      <button
                        key={imgUrl}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition cursor-pointer ${
                          activeImageIndex === idx
                            ? "border-[#cc0000] shadow-xs scale-105"
                            : "border-slate-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={imgUrl} alt="" className="h-full w-full object-contain p-0.5 bg-slate-50" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Product Title & Price */}
                <div className="pt-2">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    {product.category}
                  </p>
                  <h4 className="font-bold text-slate-900 text-base leading-snug">
                    {product.name}
                  </h4>
                  {product.description && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                  <p className="text-lg font-extrabold text-[#cc0000] mt-1.5">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </div>

              {/* Variation Options */}
              <div className="space-y-4 py-3">
                {/* Size Selector */}
                {availableSizes.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#cc0000]" />
                      Escolha o Tamanho:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((sz) => {
                        const isSelected = selectedSize === sz;
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedSize(sz)}
                            className={`min-w-[42px] px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                              isSelected
                                ? "bg-[#cc0000] text-white border-[#cc0000] shadow-sm shadow-[#cc0000]/30"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {sz}
                            {isSelected && <Check className="h-3 w-3" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                {availableColors.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Escolha a Cor:
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-0.5">
                      {availableColors.map((cl) => {
                        const isSelected = selectedColor === cl;
                        return (
                          <button
                            key={cl}
                            type="button"
                            onClick={() => setSelectedColor(cl)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-[#cc0000] text-white border-[#cc0000] font-bold shadow-sm shadow-[#cc0000]/30"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {cl}
                            {isSelected && <Check className="h-3 w-3" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Button */}
              <div className="pt-2">
                <Button
                  onClick={handleAddWithOptions}
                  className="w-full rounded-xl bg-gradient-to-r from-[#cc0000] to-[#b30000] text-white font-bold text-sm py-3 shadow-md shadow-[#cc0000]/25 hover:brightness-105"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Adicionar ao Carrinho • {formatCurrency(product.price)}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
