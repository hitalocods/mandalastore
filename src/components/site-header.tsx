"use client";

import { Menu, Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/store/cart-store";

type SiteHeaderProps = {
  onCartOpen: () => void;
};

export function SiteHeader({ onCartOpen }: SiteHeaderProps) {
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = ["Produtos", "Categorias", "Admin"];

  return (
    <header className="sticky top-0 z-40 border-b bg-white/78 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:h-16 sm:px-6 lg:px-8">
        <Link href="/" className="bg-gradient-to-r from-[#cc0000] to-[#d4af37] bg-clip-text text-base font-semibold tracking-[0.26em] text-transparent sm:text-lg sm:tracking-[0.28em]">
          STORE
        </Link>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <a href="#products" className="bg-gradient-to-r from-[#cc0000] to-[#d4af37] bg-clip-text transition text-transparent">
            Produtos
          </a>
          <a href="#categories" className="bg-gradient-to-r from-[#cc0000] to-[#d4af37] bg-clip-text transition text-transparent">
            Categorias
          </a>
          <a href="/admin/login" className="bg-gradient-to-r from-[#cc0000] to-[#d4af37] bg-clip-text transition text-transparent">
            Admin
          </a>
        </nav>
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button size="icon" variant="ghost" aria-label="Buscar" className="h-9 w-9 sm:h-10 sm:w-10">
            <Search className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Carrinho"
            onClick={onCartOpen}
            className="relative h-9 w-9 sm:h-10 sm:w-10"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                {count}
              </span>
            )}
          </Button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="h-9 w-9 md:hidden" aria-label="Menu">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle className="bg-gradient-to-r from-[#cc0000] to-[#d4af37] bg-clip-text text-transparent">STORE</SheetTitle>
              </SheetHeader>
              <div className="grid gap-1 px-6">
                {links.map((link) => (
                  <a
                    key={link}
                    href={link === "Admin" ? "/admin/login" : `#${link.toLowerCase()}`}
                    className="rounded-md bg-gradient-to-r from-[#cc0000] to-[#d4af37] bg-clip-text py-4 text-lg font-medium text-transparent"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
