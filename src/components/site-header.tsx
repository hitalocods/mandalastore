"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Menu, ShoppingBag, Sparkles, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/store/cart-store";
import type { CategoryWithChildren } from "@/types/category";

type SiteHeaderProps = {
  onCartOpen: () => void;
  categoriesTree?: CategoryWithChildren[];
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
};

export function SiteHeader({
  onCartOpen,
  categoriesTree = [],
  activeCategory = "Todos",
  onSelectCategory,
}: SiteHeaderProps) {
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const toggleExpand = (catId: string) => {
    setExpandedCats((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleCategorySelect = (categoryName: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryName);
    }
    setMobileOpen(false);

    // Scroll to products section smoothly
    const productsEl = document.getElementById("products");
    if (productsEl) {
      productsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleParentCategoryClick = (cat: CategoryWithChildren) => {
    const hasChildren = cat.children && cat.children.length > 0;
    if (hasChildren) {
      // Toggle expansion to reveal subcategories
      toggleExpand(cat.id);
    } else {
      // Direct selection if no subcategories exist
      handleCategorySelect(cat.name);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-white/80 backdrop-blur-xl dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:h-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="bg-gradient-to-r from-[#cc0000] via-[#e63946] to-[#d4af37] bg-clip-text text-base font-bold tracking-[0.24em] text-transparent sm:text-lg sm:tracking-[0.28em]"
        >
          MANDALLA PRIME
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a
            href="#products"
            className="text-foreground/80 transition hover:text-[#cc0000]"
          >
            Produtos
          </a>

          {/* Desktop Hover Category Dropdown Menu */}
          <div className="relative group py-2">
            <a
              href="#categories"
              className="flex items-center gap-1 text-foreground/80 transition hover:text-[#d4af37] group-hover:text-[#d4af37]"
            >
              <span>Categorias</span>
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180 text-amber-500" />
            </a>

            <div className="absolute top-full left-0 pt-1 hidden group-hover:block z-50 w-64 animate-in fade-in-0 zoom-in-95 duration-150">
              <div className="rounded-xl border border-border/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-2 shadow-2xl ring-1 ring-black/5 max-h-[75vh] overflow-y-auto premium-scrollbar">
                <button
                  onClick={() => handleCategorySelect("Todos")}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                    activeCategory === "Todos"
                      ? "bg-gradient-to-r from-[#cc0000] to-[#b30000] text-white shadow-xs"
                      : "text-foreground hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-amber-500" /> Todos os Produtos
                  </span>
                </button>

                {categoriesTree.length > 0 && (
                  <>
                    <div className="my-1.5 border-t border-border/50" />
                    <div className="space-y-1">
                      {categoriesTree.map((cat) => {
                        const hasChildren = cat.children && cat.children.length > 0;
                        const isParentActive = activeCategory === cat.name;
                        const isChildActive = cat.children?.some((sub) => sub.name === activeCategory);

                        return (
                          <div key={cat.id} className="rounded-lg overflow-hidden border border-border/30 bg-muted/20">
                            <button
                              onClick={() => handleCategorySelect(cat.name)}
                              className={`w-full text-left flex items-center justify-between px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                                isParentActive
                                  ? "text-[#cc0000] bg-[#cc0000]/10"
                                  : isChildActive
                                  ? "text-amber-600 dark:text-amber-400 bg-amber-500/10"
                                  : "text-foreground hover:bg-accent"
                              }`}
                            >
                              <span>{cat.name}</span>
                              {hasChildren && (
                                <span className="text-[10px] text-muted-foreground font-normal">
                                  {cat.children.length} sub
                                </span>
                              )}
                            </button>

                            {hasChildren && (
                              <div className="bg-background/60 px-2 py-1 space-y-0.5 border-t border-border/20">
                                {cat.children.map((sub) => {
                                  const isSubActive = activeCategory === sub.name;
                                  return (
                                    <button
                                      key={sub.id}
                                      onClick={() => handleCategorySelect(sub.name)}
                                      className={`w-full text-left rounded-md px-2.5 py-1 text-[11px] transition flex items-center gap-2 cursor-pointer ${
                                        isSubActive
                                          ? "font-bold text-[#cc0000] bg-[#cc0000]/10"
                                          : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                      }`}
                                    >
                                      <span className="h-1 w-1 rounded-full bg-amber-500/70" />
                                      {sub.name}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Carrinho"
            onClick={onCartOpen}
            className="relative h-9 w-9 rounded-full sm:h-10 sm:w-10"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#cc0000] px-1 text-[10px] font-bold text-white shadow-sm">
                {count}
              </span>
            )}
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <div className="relative group md:hidden">
              {/* Ambient glowing ring in Mandalla Prime colors */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#cc0000] via-[#e63946] to-[#d4af37] opacity-80 blur-[3px] animate-pulse group-hover:opacity-100 transition duration-300"
              />

              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Abrir Menu de Categorias"
                  className="relative flex items-center gap-1.5 h-9 rounded-full bg-zinc-950 px-3 text-xs font-bold text-white border border-amber-500/40 hover:bg-zinc-900 active:scale-95 transition-all duration-200 shadow-md shadow-[#cc0000]/25 cursor-pointer select-none"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                  {mobileOpen ? (
                    <>
                      <span className="tracking-wider text-amber-200">FECHAR</span>
                      <X className="h-4 w-4 text-white" />
                    </>
                  ) : (
                    <>
                      <span className="tracking-wider bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                        MENU
                      </span>
                      <Menu className="h-4 w-4 text-amber-400" />
                    </>
                  )}
                </button>
              </SheetTrigger>
            </div>
            <SheetContent side="left" className="w-[85vw] max-w-xs p-0 border-r border-border/50">
              <div className="flex h-full flex-col bg-background">
                {/* Header */}
                <div className="border-b px-5 py-4 bg-gradient-to-r from-zinc-900 to-zinc-950 text-white">
                  <div className="flex items-center justify-between">
                    <span className="bg-gradient-to-r from-[#cc0000] to-[#d4af37] bg-clip-text text-base font-bold tracking-widest text-transparent">
                      MANDALLA PRIME
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                      Menu
                    </span>
                  </div>
                </div>

                {/* Categories Scroll Area */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
                  <div>
                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-amber-500" /> NAVEGAÇÃO RÁPIDA
                    </p>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleCategorySelect("Todos")}
                        className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                          activeCategory === "Todos"
                            ? "bg-gradient-to-r from-[#cc0000] to-[#b30000] text-white shadow-sm"
                            : "hover:bg-accent text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5" /> Todos os Produtos
                        </span>
                      </button>
                    </div>
                  </div>

                  {categoriesTree.length > 0 && (
                    <div>
                      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        CATEGORIAS & SUB-CATEGORIAS
                      </p>
                      <div className="space-y-1">
                        {categoriesTree.map((cat) => {
                          const hasChildren = cat.children && cat.children.length > 0;
                          const isExpanded = !!expandedCats[cat.id];
                          const isParentActive = activeCategory === cat.name;

                          return (
                            <div key={cat.id} className="rounded-lg overflow-hidden border border-border/30">
                              <div
                                className={`flex items-center justify-between px-3 py-2.5 text-xs font-medium cursor-pointer transition select-none ${
                                  isParentActive
                                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold"
                                    : "hover:bg-accent text-foreground"
                                }`}
                                onClick={() => handleParentCategoryClick(cat)}
                              >
                                <span>{cat.name}</span>
                                {hasChildren && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                      {isExpanded ? "Fechar" : `${cat.children.length} sub`}
                                    </span>
                                    {isExpanded ? (
                                      <ChevronDown className="h-3.5 w-3.5 text-amber-500" />
                                    ) : (
                                      <ChevronRight className="h-3.5 w-3.5" />
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Subcategories list */}
                              {hasChildren && isExpanded && (
                                <div className="bg-muted/40 px-3 py-1.5 space-y-1 border-t border-border/20">
                                  <button
                                    onClick={() => handleCategorySelect(cat.name)}
                                    className={`w-full text-left rounded-md px-3 py-1.5 text-[11px] font-semibold transition flex items-center justify-between ${
                                      activeCategory === cat.name
                                        ? "text-[#cc0000] bg-[#cc0000]/10"
                                        : "text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                    }`}
                                  >
                                    <span>Ver todos de {cat.name}</span>
                                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                  </button>

                                  {cat.children.map((sub) => {
                                    const isSubActive = activeCategory === sub.name;
                                    return (
                                      <button
                                        key={sub.id}
                                        onClick={() => handleCategorySelect(sub.name)}
                                        className={`w-full text-left rounded-md px-3 py-1.5 text-[11px] transition flex items-center gap-2 ${
                                          isSubActive
                                            ? "font-bold text-[#cc0000] bg-[#cc0000]/10"
                                            : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                        }`}
                                      >
                                        <span className="h-1 w-1 rounded-full bg-current opacity-60" />
                                        {sub.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
