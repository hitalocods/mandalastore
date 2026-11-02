"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CartDrawer } from "@/components/cart-drawer";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { CategoryGallery } from "@/components/category-gallery";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { InitialEntranceCard } from "@/components/initial-entrance-card";
import { useProductFilter } from "@/hooks/use-product-filter";
import { CartProvider } from "@/store/cart-store";
import { categories as defaultCategories } from "@/types/product";
import {
  type StoreMode,
  computeTopicCounts,
  filterProductsByTopicMode,
  filterCategoriesTreeByTopicMode,
} from "@/lib/catalog-topics";
import type { Product } from "@/types/product";
import type { Neighborhood } from "@/types/neighborhood";
import type { CategoryWithChildren } from "@/types/category";

export function Storefront({
  products,
  neighborhoods,
  categoriesTree = [],
  initialMode = "all",
  requireEntranceChoice = true,
  forceMode,
}: {
  products: Product[];
  neighborhoods: Neighborhood[];
  categoriesTree?: CategoryWithChildren[];
  initialMode?: StoreMode;
  requireEntranceChoice?: boolean;
  forceMode?: StoreMode;
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<StoreMode>(forceMode || initialMode);

  // Define se o usuário já escolheu e entrou na loja
  const [hasEntered, setHasEntered] = useState<boolean>(() => {
    if (forceMode) return true;
    if (!requireEntranceChoice) return true;
    return false;
  });

  // Contagem dinâmica dos 3 tópicos a partir dos produtos reais
  const topicCounts = useMemo(
    () => computeTopicCounts(products, categoriesTree),
    [products, categoriesTree]
  );

  // Produtos e categorias ativos baseados no modo/tópico selecionado
  const activeProducts = useMemo(() => {
    return filterProductsByTopicMode(products, categoriesTree, currentMode);
  }, [currentMode, products, categoriesTree]);

  const activeCategoriesTree = useMemo(() => {
    return filterCategoriesTreeByTopicMode(categoriesTree, currentMode);
  }, [categoriesTree, currentMode]);

  const {
    activeCategory,
    filteredProducts,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
  } = useProductFilter(activeProducts, activeCategoriesTree);

  // Garante que o card de entrada sempre seja exibido na página inicial
  useEffect(() => {
    if (forceMode) {
      setCurrentMode(forceMode);
      setHasEntered(true);
      return;
    }

    if (!requireEntranceChoice) {
      setHasEntered(true);
      return;
    }
  }, [requireEntranceChoice, forceMode]);

  const handleSelectModeAndEnter = (mode: StoreMode) => {
    setCurrentMode(mode);
    setHasEntered(true);
    setActiveCategory("Todos");
    try {
      sessionStorage.setItem("mandalla_store_mode", mode);
    } catch {}
  };

  const handleReturnToEntrance = () => {
    try {
      sessionStorage.removeItem("mandalla_store_mode");
    } catch {}
    setHasEntered(false);
  };

  // Se o usuário ainda não escolheu, exibe SOMENTE o Card Inicial
  if (!hasEntered) {
    return (
      <InitialEntranceCard
        onSelectMode={handleSelectModeAndEnter}
        topicCounts={topicCounts}
      />
    );
  }

  // DEPOIS QUE ENTRA NO SITE: Visual limpo e nobre com cores alinhadas à logo
  return (
    <CartProvider>
      <SiteHeader
        onCartOpen={() => setCartOpen(true)}
        categoriesTree={activeCategoriesTree}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentMode={currentMode}
        onSwitchMode={handleReturnToEntrance}
      />

      <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#faf8f5] via-[#f7f4ee] to-[#f3f0ea]">
        {/* Soft atmospheric gradient glow no topo / hero com acento em vermelho e dourado */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[550px] bg-[radial-gradient(ellipse_at_top,rgba(167,1,1,0.08),rgba(201,162,39,0.05)_45%,transparent_75%)] blur-3xl -z-10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-10 right-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(167,1,1,0.04),transparent_70%)] blur-3xl -z-10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-40 left-[-10%] w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(201,162,39,0.05),transparent_70%)] blur-3xl -z-10"
        />

        {/* Hero Section adaptável ao tópico/modo selecionado */}
        <section className="mx-auto grid max-w-7xl items-center gap-4 px-3 pb-3 pt-2 sm:gap-8 sm:px-6 sm:pb-10 sm:pt-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12 lg:px-8 lg:pb-12 lg:pt-10">
          <motion.div
            key={currentMode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="hidden sm:flex flex-col justify-center"
          >
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
              <span className="h-1.5 w-1.5 rounded-full animate-pulse bg-[var(--red)]" />
              <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground/75 sm:text-xs">
                {currentMode === "roupas" || currentMode === "vestuario"
                  ? "Vestuário Sagrado de Axé & Acessórios"
                  : currentMode === "acessorios"
                  ? "Acessórios, Coroas & Bijuterias"
                  : currentMode === "imagens"
                  ? "Imagens Religiosas, Batismo & Livros"
                  : currentMode === "produtos"
                  ? "Produtos Religiosos, Velas & Rituais"
                  : "Catálogo Completo Premium"}
              </p>
            </div>
            <h1 className="max-w-2xl bg-gradient-to-r from-[var(--red-bright)] via-[var(--red)] to-[var(--gold)] bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl lg:text-7xl font-cinzel">
              {currentMode === "roupas" || currentMode === "vestuario"
                ? "Mandalla Axé"
                : currentMode === "acessorios"
                ? "Mandalla Brilho"
                : currentMode === "imagens"
                ? "Mandalla Sagrada"
                : currentMode === "produtos"
                ? "Mandalla Tradição"
                : "Mandalla Prime"}
            </h1>
            <p className="mt-3.5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base sm:leading-7">
              {currentMode === "roupas" || currentMode === "vestuario"
                ? "Vestuário feminino e masculino, conjuntos, batas, saias, guias, chapéus e bengalas consagradas."
                : currentMode === "acessorios"
                ? "Colares, brincos, chapéus, pulseiras, coroas, anéis, luvas, batom, rosas e apliques para cabelo."
                : currentMode === "imagens"
                ? "Imagens católicas e de umbanda, materiais de batismo e livros sagrados com acabamento impecável."
                : currentMode === "produtos"
                ? "Velas, ervas, defumadores, incensos, essências, banhos, perfumes, rituais, baralhos e louças."
                : "Explore toda a nossa coleção sagrada: imagens, vestuário, guias e produtos religiosos completos."}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
              <a
                href="#products"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--red)] to-[#7a0101] border border-[var(--gold)]/40 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[var(--red)]/20 hover:brightness-110 transition sm:text-sm cursor-pointer"
              >
                {currentMode === "roupas" || currentMode === "vestuario"
                  ? "Ver Vestuário"
                  : currentMode === "acessorios"
                  ? "Ver Acessórios"
                  : currentMode === "imagens"
                  ? "Ver Imagens"
                  : currentMode === "produtos"
                  ? "Ver Produtos"
                  : "Explorar Catálogo"}
              </a>
              <a
                href="#categories"
                className="inline-flex items-center justify-center rounded-full border border-[var(--gold)]/40 bg-white/90 px-5 py-2.5 text-xs font-semibold text-foreground hover:border-[var(--gold)] hover:text-[var(--red)] transition sm:text-sm shadow-xs cursor-pointer"
              >
                Ver Categorias
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="relative flex items-center justify-center"
          >
            {/* Ambient background glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-2 sm:-inset-4 rounded-3xl bg-gradient-to-tr from-[var(--red)]/15 via-[var(--gold)]/15 to-transparent blur-2xl -z-10"
            />
            <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-[var(--gold)]/40 bg-black/5 shadow-xl sm:shadow-2xl ring-1 ring-[var(--gold)]/20">
              <Image
                src="/banner.jpeg"
                alt="Mandalla Prime"
                width={1600}
                height={900}
                className="w-full h-auto aspect-video object-cover transition-transform duration-500 hover:scale-[1.015]"
                priority
              />
            </div>
          </motion.div>
        </section>

        {/* Categories Bar: Visible on desktop/tablet with subcategory dropdowns */}
        <section id="categories" className="hidden sm:block mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 z-30 relative">
          <div className="flex flex-wrap items-center gap-2.5 pb-2 overflow-visible">
            {/* "Todos" Pill */}
            <button
              onClick={() => setActiveCategory("Todos")}
              className={`min-h-10 shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition sm:px-5 sm:text-sm cursor-pointer ${
                activeCategory === "Todos"
                  ? "border-[var(--gold)]/60 bg-gradient-to-r from-[var(--red)] to-[#7e0101] text-white shadow-sm shadow-[var(--red)]/25"
                  : "bg-white text-stone-800 border-stone-200/90 hover:border-[var(--gold)]/60 hover:text-[var(--red)] hover:shadow-xs"
              }`}
            >
              Todos
            </button>

            {/* Tree Categories filtradas pelo modo ativo */}
            {activeCategoriesTree.length > 0 ? (
              activeCategoriesTree.map((cat) => {
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
                          ? "border-[var(--gold)]/60 bg-gradient-to-r from-[var(--red)] to-[#7e0101] text-white shadow-sm shadow-[var(--red)]/25"
                          : "bg-white text-stone-800 border-stone-200/90 hover:border-[var(--gold)]/60 hover:text-[var(--red)] hover:shadow-xs"
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
                          ? "border-[var(--gold)]/60 bg-gradient-to-r from-[var(--red)] to-[#7e0101] text-white shadow-sm shadow-[var(--red)]/25"
                          : "bg-white text-stone-800 border-stone-200/90 hover:border-[var(--gold)]/60 hover:text-[var(--red)] hover:shadow-xs"
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
                      <div className="rounded-xl border border-[var(--gold)]/30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-1.5 shadow-xl ring-1 ring-black/5">
                        <button
                          onClick={() => setActiveCategory(cat.name)}
                          className={`w-full text-left rounded-lg px-3 py-2 text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                            isParentActive
                              ? "bg-[var(--red)]/10 text-[var(--red)]"
                              : "text-foreground hover:bg-[var(--gold)]/10 hover:text-[var(--red)]"
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
                                    ? "font-bold text-[var(--red)] bg-[var(--red)]/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    isSubActive ? "bg-[var(--red)]" : "bg-[var(--gold)]/70"
                                  }`}
                                />
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
                      ? "border-[var(--gold)]/60 bg-gradient-to-r from-[var(--red)] to-[#7e0101] text-white shadow-sm shadow-[var(--red)]/25"
                      : "bg-white text-stone-800 border-stone-200/90 hover:border-[var(--gold)]/60 hover:text-[var(--red)] hover:shadow-xs"
                  }`}
                >
                  {category}
                </button>
              ))
            )}
          </div>
        </section>

        {/* Galeria Visual de Fotos de Categorias acima de Lançamentos */}
        <CategoryGallery
          categoriesTree={activeCategoriesTree}
          products={activeProducts}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {/* Seção de Produtos com contagem dinâmica */}
        <section id="products" className="mx-auto max-w-7xl px-3 pb-24 pt-2 sm:px-6 sm:pt-4 lg:px-8">
          <div className="mb-5 flex items-end justify-between gap-4 sm:mb-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
                {filteredProducts.length} itens encontrados em{" "}
                <span className="font-semibold text-foreground">
                  {currentMode === "roupas" || currentMode === "vestuario"
                    ? "Vestuário Sagrado de Axé"
                    : currentMode === "acessorios"
                    ? "Acessórios"
                    : currentMode === "imagens"
                    ? "Imagens Religiosas"
                    : currentMode === "produtos"
                    ? "Produtos Religiosos"
                    : "Todo o Catálogo"}
                </span>
              </p>
              <h2 className="mt-1 text-xl font-black uppercase tracking-wider text-foreground sm:mt-2 sm:text-2xl font-cinzel">
                {searchQuery
                  ? `Busca: "${searchQuery}"`
                  : activeCategory === "Todos"
                  ? currentMode === "roupas" || currentMode === "vestuario"
                    ? "Coleção de Vestuário"
                    : currentMode === "acessorios"
                    ? "Coleção de Acessórios"
                    : currentMode === "imagens"
                    ? "Galeria de Imagens"
                    : currentMode === "produtos"
                    ? "Produtos & Artigos"
                    : "Lançamentos & Destaques"
                  : activeCategory}
              </h2>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-[var(--red)] hover:underline font-semibold cursor-pointer"
              >
                Limpar busca
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-[var(--gold)]/40 bg-white/60 dark:bg-zinc-900/50 p-8 shadow-xs">
              <p className="text-base font-semibold text-foreground">Nenhum produto encontrado nesta seção.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tente buscar por outro termo ou selecione uma categoria diferente acima.
              </p>
              {currentMode !== "all" && (
                <button
                  onClick={() => handleSelectModeAndEnter("all")}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[var(--red)] to-[#7a0101] border border-[var(--gold)]/40 px-4 py-2 text-xs font-semibold text-white shadow hover:brightness-110 transition cursor-pointer"
                >
                  <span>Ver Todos os Produtos</span>
                </button>
              )}
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </main>

      {/* Botão Flutuante do WhatsApp */}
      <WhatsAppButton />

      {/* Gaveta do Carrinho */}
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} neighborhoods={neighborhoods} />
    </CartProvider>
  );
}
