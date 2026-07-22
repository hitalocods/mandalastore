"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
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

        {/* Categories Bar: Visible only on desktop/notebook (sm:block) with hover subcategory dropdowns */}
        <section id="categories" className="hidden sm:block mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 z-30 relative">
          <div className="flex flex-wrap items-center gap-2.5 pb-2 overflow-visible">
            {/* "Todos" Pill */}
            <button
              onClick={() => setActiveCategory("Todos")}
              className={`min-h-10 shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition sm:px-5 sm:text-sm cursor-pointer ${
                activeCategory === "Todos"
                  ? "border-[#cc0000] bg-gradient-to-r from-[#cc0000] to-[#b30000] text-white shadow-sm"
                  : "bg-background text-foreground border-border hover:border-foreground/40"
              }`}
            >
              Todos
            </button>

            {/* Tree Categories */}
            {categoriesTree.length > 0 ? (
              categoriesTree.map((cat) => {
                const hasChildren = cat.children && cat.children.length > 0;
                const isParentActive = activeCategory === cat.name;
                const activeChild = cat.children?.find((sub) => sub.name === activeCategory);
                const isCategoryActive = isParentActive || !!activeChild;

                if (!hasChildren) {
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.name)}
                      className={`min-h-10 shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition sm:px-5 sm:text-sm cursor-pointer ${
                        isParentActive
                          ? "border-[#cc0000] bg-gradient-to-r from-[#cc0000] to-[#b30000] text-white shadow-sm"
                          : "bg-background text-foreground border-border hover:border-foreground/40"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                }

                return (
                  <div key={cat.id} className="relative group/cat shrink-0">
                    <button
                      onClick={() => setActiveCategory(cat.name)}
                      className={`min-h-10 flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition sm:px-5 sm:text-sm cursor-pointer ${
                        isCategoryActive
                          ? "border-[#cc0000] bg-gradient-to-r from-[#cc0000] to-[#b30000] text-white shadow-sm"
                          : "bg-background text-foreground border-border hover:border-foreground/40"
                      }`}
                    >
                      <span>
                        {cat.name}
                        {activeChild && (
                          <span className="ml-1 text-[11px] opacity-90 font-normal">
                            ({activeChild.name})
                          </span>
                        )}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform duration-200 group-hover/cat:rotate-180" />
                    </button>

                    {/* Subcategories Dropdown Menu on Hover */}
                    <div className="absolute left-0 top-full pt-1.5 z-50 opacity-0 pointer-events-none group-hover/cat:opacity-100 group-hover/cat:pointer-events-auto transition-all duration-200 transform origin-top-left group-hover/cat:scale-100 scale-95 min-w-[200px]">
                      <div className="rounded-xl border border-border/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-1.5 shadow-xl ring-1 ring-black/5">
                        <button
                          onClick={() => setActiveCategory(cat.name)}
                          className={`w-full text-left rounded-lg px-3 py-2 text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                            isParentActive
                              ? "bg-[#cc0000]/10 text-[#cc0000]"
                              : "text-foreground hover:bg-amber-500/10 hover:text-amber-600"
                          }`}
                        >
                          <span>Ver todos em {cat.name}</span>
                          <ChevronRight className="h-3 w-3 opacity-60" />
                        </button>

                        <div className="my-1 border-t border-border/60" />

                        <div className="space-y-0.5 max-h-56 overflow-y-auto premium-scrollbar">
                          {cat.children.map((sub) => {
                            const isSubActive = activeCategory === sub.name;
                            return (
                              <button
                                key={sub.id}
                                onClick={() => setActiveCategory(sub.name)}
                                className={`w-full text-left rounded-lg px-3 py-1.5 text-xs transition flex items-center gap-2 cursor-pointer ${
                                  isSubActive
                                    ? "font-bold text-[#cc0000] bg-[#cc0000]/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${isSubActive ? "bg-[#cc0000]" : "bg-amber-500/70"}`} />
                                {sub.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              defaultCategories.map((category, index) => (
                <button
                  key={`${category}-${index}`}
                  onClick={() => setActiveCategory(category)}
                  className={`min-h-10 shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition sm:px-5 sm:text-sm cursor-pointer ${
                    activeCategory === category
                      ? "border-[#cc0000] bg-gradient-to-r from-[#cc0000] to-[#b30000] text-white shadow-sm"
                      : "bg-background text-foreground border-border hover:border-foreground/40"
                  }`}
                >
                  {category}
                </button>
              ))
            )}
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
