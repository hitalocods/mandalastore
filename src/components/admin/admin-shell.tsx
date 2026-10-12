"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Layers,
  MapPin,
  ShieldCheck,
  Store,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { signOutAdmin } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import type { BillingStatus } from "@/services/billing";

interface AdminShellProps {
  children: React.ReactNode;
  billingStatus: BillingStatus;
}

export function AdminShell({ children, billingStatus }: AdminShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Não renderiza a casca do painel se estiver na tela de login
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "Produtos",
      href: "/admin/produtos",
      icon: Package,
      exact: false,
    },
    {
      title: "Cadastrar Produto",
      href: "/admin/produtos/novo",
      icon: PlusCircle,
      exact: true,
    },
    {
      title: "Categorias",
      href: "/admin/categorias",
      icon: Layers,
      exact: true,
    },
    {
      title: "Bairros & Taxas",
      href: "/admin/bairros",
      icon: MapPin,
      exact: true,
    },
    {
      title: "Licença Atlas",
      href: "/admin/licenca",
      icon: ShieldCheck,
      badge: "R$ 60/mês",
      exact: true,
    },
  ];

  const isLinkActive = (itemHref: string, exact: boolean) => {
    if (exact) {
      return pathname === itemHref;
    }
    return pathname.startsWith(itemHref);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col lg:flex-row">
      {/* Mobile Header Bar */}
      <header className="lg:hidden sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md">
        <Link href="/admin" className="flex items-center gap-2 font-bold tracking-wider text-sm">
          <Store className="h-5 w-5 text-[#cc0000]" />
          <span className="bg-gradient-to-r from-[#cc0000] to-[#d4af37] bg-clip-text text-transparent">
            MANDALLA
          </span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
            Admin
          </span>
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          aria-label="Abrir menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Backdrop para Menu Mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop fixo / Mobile deslizante) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Topo da Sidebar: Logo & Identidade */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#cc0000] to-[#d4af37] text-white shadow-xs">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-black tracking-wider text-slate-900 block leading-tight">
                MANDALLA PRIME
              </span>
              <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                Painel Gerencial
              </span>
            </div>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-700 lg:hidden cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links de Navegação */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">
            Navegação Principal
          </p>

          {navItems.map((item) => {
            const active = isLinkActive(item.href, item.exact);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      active ? "text-amber-400" : "text-slate-600 group-hover:text-slate-700"
                    }`}
                  />
                  <span>{item.title}</span>
                </div>

                {item.badge ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      active ? "bg-slate-800 text-amber-300" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : active ? (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                ) : null}
              </Link>
            );
          })}
        </div>

        {/* Card Inferior: Status da Licença Atlas */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <Link
            href="/admin/licenca"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 hover:bg-slate-100/80 transition-all group"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Licença Atlas
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Ativa
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Vencimento: <strong className="text-slate-700">{billingStatus.dueDateFormatted}</strong> (R$ {billingStatus.amount.toFixed(2).replace(".", ",")})
            </p>
          </Link>

          {/* Atalho Ver Loja & Logout */}
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 rounded-xl text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-100 h-9"
            >
              <Link href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Ver Loja
              </Link>
            </Button>

            <form action={signOutAdmin}>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 h-9 px-3"
                title="Sair do painel"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Área de Conteúdo Central */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
