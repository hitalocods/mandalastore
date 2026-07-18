"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { CartDrawer } from "@/components/cart-drawer";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { useProductFilter } from "@/hooks/use-product-filter";
import { CartProvider } from "@/store/cart-store";
import { categories as defaultCategories } from "@/types/product";
import type { Product } from "@/types/product";
import type { Neighborhood } from "@/types/neighborhood";
import type { CategoryWithChildren } from "@/types/category";

export function Storefront({
  products,
  neighborhoods,
  categoriesTree = [],
}: {
  products: Product[];
  neighborhoods: Neighborhood[];
  categoriesTree?: CategoryWithChildren[];
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const { activeCategory, filteredProducts, setActiveCategory } = useProductFilter(products, categoriesTree);

  // Extract deduplicated list of category names for horizontal pill scroll (on desktop)
  const displayCategories = useMemo(() => {
    let names: string[] = [];
    if (categoriesTree.length > 0) {
      categoriesTree.forEach((cat) => {
        names.push(cat.name);
        if (cat.children) {
          cat.children.forEach((child) => names.push(child.name));
        }
      });
    } else {
      names = [...defaultCategories];
    }
    // Remove duplicates
    const uniqueNames = Array.from(new Set(names));
    return ["Todos", ...uniqueNames];
  }, [categoriesTree]);

  return (
    <CartProvider>
      <SiteHeader
        onCartOpen={() => setCartOpen(true)}
        categoriesTree={categoriesTree}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />
      <main className="min-h-screen bg-background">
        <section className="mx-auto grid max-w-7xl gap-6 px-3 pb-6 pt-7 sm:px-6 sm:pb-12 sm:pt-14 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:pb-20 lg:pt-20">
          <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-foreground/70 sm:mb-4 sm:text-xs">
              Acessórios premium
            </p>
            <h1 className="max-w-2xl bg-gradient-to-r from-[#cc0000] via-[#e63946] to-[#d4af37] bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
              Mandalla Prime
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:mt-5 sm:text-base sm:leading-7">
              Capas, acessórios, roupas, artigos religiosos e muito mais.
            </p>
          </motion.div>
          <motion.div
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="flex items-center justify-center"
          >
            <Image
              src="/logo-mandala.jpg"
              alt="Mandalla Prime"
              width={600}
              height={900}
              className="w-full max-w-[340px] sm:max-w-md h-auto rounded-2xl shadow-2xl object-cover border border-amber-500/30"
              priority
            />
          </motion.div>
        </section>

        {/* Categories Bar: Visible only on desktop (sm:block). On mobile, categories are in the hamburger menu */}
        <section id="categories" className="hidden sm:block mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="premium-scrollbar -mx-3 flex snap-x gap-2 overflow-x-auto px-3 pb-3 sm:mx-0 sm:px-0">
              {displayCategories.map((category, index) => (
                <button
                  key={`${category}-${index}`}
                  onClick={() => setActiveCategory(category)}
                  className={`min-h-10 shrink-0 snap-start rounded-full border px-4 py-2 text-xs font-semibold transition sm:px-5 sm:text-sm ${
                    activeCategory === category
                      ? "border-[#cc0000] bg-gradient-to-r from-[#cc0000] to-[#b30000] text-white shadow-sm"
                      : "bg-background text-foreground border-border hover:border-foreground/40"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="products" className="mx-auto max-w-7xl px-3 pb-20 pt-6 sm:px-6 sm:pt-8 lg:px-8">
          <div className="mb-5 flex items-end justify-between gap-4 sm:mb-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
                {filteredProducts.length} itens encontrados
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:mt-2 sm:text-2xl">
                {activeCategory === "Todos" ? "Catálogo Completo" : activeCategory}
              </h2>
            </div>
          </div>
          <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>
        </section>
      </main>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} neighborhoods={neighborhoods} />
    </CartProvider>
  );
}
