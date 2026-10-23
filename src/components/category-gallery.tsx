"use client";

import { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { CategoryWithChildren } from "@/types/category";
import type { Product } from "@/types/product";
import { categories as defaultCategories } from "@/types/product";

type CategoryGalleryProps = {
  categoriesTree?: CategoryWithChildren[];
  products?: Product[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
};

// Imagens padrão de alta resolução e representativas para categorias comuns
const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
  cachimbos: "/produtos_mandala_prime/cachimbos/cachimbo_01.jpg",
  charutos: "/produtos_mandala_prime/charutos_cigarros_fumos/item_01.jpg",
  fumos: "/produtos_mandala_prime/charutos_cigarros_fumos/item_05.jpg",
  cigarros: "/produtos_mandala_prime/charutos_cigarros_fumos/item_10.jpg",
  "vestuário masculino": "/produtos_mandala_prime/vestuario_masculino/vestuario_01.jpg",
  "vestuário feminino": "/produtos_mandala_prime/vestuario_masculino/vestuario_15.jpg",
  baralhos: "/produtos_mandala_prime/baralho_tarot/baralho_01.jpg",
  acessórios: "/produtos_mandala_prime/baralho_tarot/baralho_10.jpg",
  bebidas: "/banner.jpeg",
  guias: "/logo-mandala.jpg",
  orixás: "/mandala.jpeg",
  velas: "/banner.jpeg",
  ervas: "/produtos_mandala_prime/charutos_cigarros_fumos/item_20.jpg",
  essências: "/mandala.jpeg",
};

export function CategoryGallery({
  categoriesTree = [],
  products = [],
  activeCategory,
  onSelectCategory,
}: CategoryGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mapeia as categorias escolhidas pela dona no painel (estrela) com uma imagem representativa
  const categoryItems = useMemo(() => {
    const list: Array<{ key: string; name: string; imageUrl: string }> = [];

    // Monta a lista na ordem do painel: apenas as categorias marcadas com estrela (show_in_gallery === true)
    const selected: Array<{ key: string; name: string; image_url?: string | null }> = [];
    for (const root of categoriesTree) {
      if (root.show_in_gallery === true) {
        selected.push({ key: root.id, name: root.name, image_url: root.image_url });
      }
      for (const sub of root.children || []) {
        if (sub.show_in_gallery === true) {
          selected.push({ key: sub.id, name: sub.name, image_url: sub.image_url });
        }
      }
    }

    for (const cat of selected) {
      const nameLower = cat.name.trim().toLowerCase();

      // 0. Foto cadastrada pela dona no painel
      let imageUrl = cat.image_url || undefined;

      // 1. Foto do primeiro produto dessa categoria
      if (!imageUrl) {
        const matchedProduct = products.find(
          (p) =>
            p.category?.trim().toLowerCase() === nameLower &&
            p.image_url &&
            p.image_url.trim() !== ""
        );
        imageUrl = matchedProduct?.image_url || undefined;
      }

      // 2. Fotos locais de reserva
      if (!imageUrl) {
        for (const [key, fallbackUrl] of Object.entries(FALLBACK_CATEGORY_IMAGES)) {
          if (nameLower.includes(key) || key.includes(nameLower)) {
            imageUrl = fallbackUrl;
            break;
          }
        }
      }

      // 3. Reserva genérica
      list.push({ key: cat.key, name: cat.name, imageUrl: imageUrl || "/mandala.jpeg" });
    }

    return list;
  }, [categoriesTree, products]);

  const handleSelect = (categoryName: string) => {
    // Se clicar na mesma categoria que já está ativa, volta para "Todos"
    onSelectCategory(activeCategory === categoryName ? "Todos" : categoryName);
    const productsEl = document.getElementById("products");
    if (productsEl) {
      productsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Se a dona desmarcar todas as categorias, a faixa some da loja
  if (categoryItems.length === 0) return null;

  return (
    <section className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground/90">
            Itens
          </h3>
        </div>

        {/* Setas de navegação horizontal para desktop/tablet */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scroll("left")}
            aria-label="Rolar para esquerda"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background hover:bg-muted text-foreground transition cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Rolar para direita"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background hover:bg-muted text-foreground transition cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Lista horizontal com rolagem suave */}
      <div
        ref={scrollRef}
        className="flex items-start gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >

        {/* Cards de cada categoria */}
        {categoryItems.map((item) => {
          const isActive = activeCategory === item.name;

          return (
            <button
              key={item.key}
              onClick={() => handleSelect(item.name)}
              className="group flex flex-col items-center shrink-0 w-20 sm:w-24 text-center cursor-pointer transition-transform active:scale-95"
            >
              <div
                className={`relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden p-0.5 transition-all duration-300 ${
                  isActive
                    ? "ring-2 ring-[#cc0000] shadow-lg shadow-[#cc0000]/25 scale-105"
                    : "border border-border/80 bg-background hover:border-amber-500/50 hover:shadow-md"
                }`}
              >
                <div className="relative h-full w-full rounded-[14px] overflow-hidden bg-muted/40 flex items-center justify-center">
                  <img
                    loading="lazy"
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/mandala.jpeg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                </div>
              </div>
              <span
                className={`mt-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-tight line-clamp-2 leading-tight transition-colors ${
                  isActive
                    ? "text-[#cc0000]"
                    : "text-foreground/80 group-hover:text-amber-600 dark:group-hover:text-amber-400"
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
