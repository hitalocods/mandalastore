"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Tag,
  User,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/store/cart-store";
import { SITE_CONFIG } from "@/lib/site-config";
import type { CategoryWithChildren } from "@/types/category";

type SiteHeaderProps = {
  onCartOpen: () => void;
  categoriesTree?: CategoryWithChildren[];
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
};

export function SiteHeader({
  onCartOpen,
  categoriesTree = [],
  activeCategory = "Todos",
  onSelectCategory,
  searchQuery = "",
  onSearchChange,
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

    // Scroll suave até a seção de produtos
    const productsEl = document.getElementById("products");
    if (productsEl) {
      productsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleParentCategoryClick = (cat: CategoryWithChildren) => {
    const hasChildren = cat.children && cat.children.length > 0;
    if (hasChildren) {
      toggleExpand(cat.id);
    } else {
      handleCategorySelect(cat.name);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-white/95 backdrop-blur-xl dark:bg-zinc-950/95 shadow-xs">
      {/* Linha Principal do Topo */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* ESQUERDA NO MOBILE: Menu em destaque (Oculto em computador e notebook: md:hidden) */}
        <div className="flex items-center md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Abrir Menu de Navegação"
                className="relative flex items-center gap-2 rounded-xl border border-amber-500/40 bg-gradient-to-r from-zinc-900 to-zinc-950 px-3 py-2 text-white shadow-md shadow-amber-900/10 hover:border-amber-400 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <Menu className="h-5 w-5 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider hidden xs:inline sm:inline bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                  Menu
                </span>
              </button>
            </SheetTrigger>

            {/* Gaveta Lateral (Drawer) de Categorias no Mobile */}
            <SheetContent side="left" className="w-[85vw] max-w-xs p-0 border-r border-border/50">
              <div className="flex h-full flex-col bg-background">
                {/* Topo da Gaveta: Apenas 'Iniciar sessão' e Fechar */}
                <div className="border-b px-4 py-3.5 bg-gradient-to-r from-zinc-900 to-zinc-950 text-white flex items-center justify-between">
                  <Link
                    href="/admin/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white transition"
                  >
                    <User className="h-4 w-4 text-zinc-400" />
                    <span>Iniciar sessão</span>
                  </Link>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md p-1 text-zinc-400 hover:text-white transition cursor-pointer"
                    aria-label="Fechar menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Identidade do Drawer */}
                <div className="px-5 py-4 border-b border-border/30 bg-muted/10">
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden ring-1 ring-amber-500/40 shadow-xs">
                      <Image
                        src={SITE_CONFIG.logoUrl}
                        alt={SITE_CONFIG.name}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="bg-gradient-to-r from-[#cc0000] to-[#d4af37] bg-clip-text text-sm font-black tracking-widest text-transparent block">
                        {SITE_CONFIG.name}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                        Catálogo de Itens
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lista de Categorias com Rolagem */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
                  <div>
                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-amber-500" /> NAVEGAÇÃO
                    </p>
                    <button
                      onClick={() => handleCategorySelect("Todos")}
                      className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition cursor-pointer ${
                        activeCategory === "Todos"
                          ? "bg-gradient-to-r from-[#cc0000] to-[#b30000] text-white shadow-xs"
                          : "hover:bg-accent text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-amber-500" /> Todos os Produtos
                      </span>
                    </button>
                  </div>

                  {categoriesTree.length > 0 && (
                    <div>
                      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        ITENS & CATEGORIAS
                      </p>
                      <div className="divide-y divide-border/20 border-y border-border/20">
                        {categoriesTree.map((cat) => {
                          const hasChildren = cat.children && cat.children.length > 0;
                          const isExpanded = !!expandedCats[cat.id];
                          const isParentActive = activeCategory === cat.name;

                          return (
                            <div key={cat.id} className="py-0.5">
                              <div
                                className={`flex items-center justify-between px-3 py-2.5 text-xs font-semibold uppercase tracking-wide cursor-pointer transition select-none ${
                                  isParentActive
                                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                    : "hover:bg-accent text-foreground"
                                }`}
                                onClick={() => handleParentCategoryClick(cat)}
                              >
                                <span className="flex items-center gap-2">
                                  {cat.image_url && (
                                    <img
                                      src={cat.image_url}
                                      alt={cat.name}
                                      className="h-5 w-5 rounded-full object-cover border border-amber-500/30"
                                    />
                                  )}
                                  {cat.name}
                                </span>
                                {hasChildren ? (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                                      {cat.children.length}
                                    </span>
                                    {isExpanded ? (
                                      <ChevronDown className="h-3.5 w-3.5 text-amber-500" />
                                    ) : (
                                      <ChevronRight className="h-3.5 w-3.5" />
                                    )}
                                  </div>
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                                )}
                              </div>

                              {/* Subcategorias expandidas */}
                              {hasChildren && isExpanded && (
                                <div className="bg-muted/30 px-3 py-1 space-y-0.5 border-t border-border/10">
                                  <button
                                    onClick={() => handleCategorySelect(cat.name)}
                                    className={`w-full text-left rounded-md px-3 py-1.5 text-[11px] font-medium transition flex items-center justify-between cursor-pointer ${
                                      activeCategory === cat.name
                                        ? "text-[#cc0000] font-bold bg-[#cc0000]/10"
                                        : "text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                    }`}
                                  >
                                    <span>Ver tudo de {cat.name}</span>
                                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                  </button>

                                  {cat.children.map((sub) => {
                                    const isSubActive = activeCategory === sub.name;
                                    return (
                                      <button
                                        key={sub.id}
                                        onClick={() => handleCategorySelect(sub.name)}
                                        className={`w-full text-left rounded-md px-3 py-1.5 text-[11px] transition flex items-center gap-2 cursor-pointer ${
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
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* CENTRO (ou Esquerda no Desktop): Logo + MANDALLA PRIME + Subtítulo "Itens" */}
        <Link
          href="/"
          className="flex flex-col items-center justify-center text-center group py-1 select-none"
        >
          <div className="flex items-center gap-2">
            <div className="relative h-9 w-9 sm:h-10 sm:w-10 overflow-hidden rounded-full ring-2 ring-amber-500/40 shadow-sm transition-transform group-hover:scale-105">
              <Image
                src={SITE_CONFIG.logoUrl}
                alt={SITE_CONFIG.name}
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </div>
            <span className="bg-gradient-to-r from-[#cc0000] via-[#e63946] to-[#d4af37] bg-clip-text text-base sm:text-xl font-black tracking-[0.22em] text-transparent transition-opacity group-hover:opacity-90">
              {SITE_CONFIG.name}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400 mt-0.5">
            {SITE_CONFIG.subtitle}
          </span>
        </Link>

        {/* NAVEGAÇÃO NO DESKTOP: Exibida em computadores e notebooks */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a
            href="#products"
            className="text-foreground/80 transition hover:text-[#cc0000]"
          >
            Produtos
          </a>

          {/* Dropdown de Categorias no Desktop */}
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
                              <span className="flex items-center gap-2">
                                {cat.image_url && (
                                  <img
                                    src={cat.image_url}
                                    alt={cat.name}
                                    className="h-4 w-4 rounded-full object-cover"
                                  />
                                )}
                                {cat.name}
                              </span>
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

        {/* DIREITA: Carrinho Maior com Badge de Quantidade */}
        <div className="flex items-center">
          <button
            type="button"
            aria-label="Carrinho de Compras"
            onClick={onCartOpen}
            className="relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-slate-800 dark:text-white hover:bg-amber-500/20 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="h-6 w-6 sm:h-7 sm:w-7 text-slate-900 dark:text-amber-300" />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#cc0000] px-1 text-[11px] font-extrabold text-white shadow-md shadow-[#cc0000]/40 animate-pulse">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* BARRA DE BUSCA: Logo em baixo do nome Mandala ocupando a largura total */}
      <div className="border-t border-border/30 bg-muted/20 px-3 py-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Buscar no catálogo..."
              className="w-full rounded-xl border border-border bg-white px-4 py-2 pr-10 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground shadow-xs transition focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 dark:bg-zinc-900"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange && onSearchChange("")}
                aria-label="Limpar busca"
                className="absolute right-3 p-0.5 text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <div className="pointer-events-none absolute right-3 flex items-center text-muted-foreground">
                <Search className="h-4 w-4 text-amber-600" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
