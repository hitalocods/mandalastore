import Link from "next/link";
import {
  Package,
  Layers,
  DollarSign,
  Boxes,
  Plus,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/services/products";
import { getAllFlatCategories } from "@/services/categories";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const products = (await getProducts().catch(() => [])) || [];
  const flatCategories = (await getAllFlatCategories().catch(() => [])) || [];

  // Métricas do inventário
  const inventory = Array.isArray(products)
    ? products.reduce((sum, product) => sum + (Number(product.stock) || 0), 0)
    : 0;

  const catalogValue = Array.isArray(products)
    ? products.reduce(
        (sum, product) => sum + (Number(product.price) || 0) * (Number(product.stock) || 0),
        0
      )
    : 0;

  // Produtos com estoque baixo ou zerado (crítico)
  const lowStockProducts = products
    .filter((p) => Number(p.stock) <= 5)
    .sort((a, b) => Number(a.stock) - Number(b.stock))
    .slice(0, 8);

  // Contagem por categoria
  const categoryCounts = products.reduce((acc, p) => {
    const cat = p.category || "Sem categoria";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Topo do Dashboard com Boas-Vindas e Ações Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Visão Geral da Loja
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard Financeiro & Estoque
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Acompanhe o desempenho do catálogo, níveis de reposição e saúde financeira da plataforma.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            asChild
            className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 px-4 shadow-sm gap-1.5"
          >
            <Link href="/admin/produtos/novo">
              <Plus className="h-4 w-4" /> Novo Produto
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="rounded-xl border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs h-10 px-4 shadow-2xs gap-1.5"
          >
            <Link href="/admin/produtos">
              <Package className="h-4 w-4 text-slate-500" /> Ver Catálogo
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid de 4 KPIs Financeiros e Operacionais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Valor em Estoque */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs relative overflow-hidden space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Valor em Estoque
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {formatCurrency(catalogValue)}
          </p>
          <p className="text-[11px] text-slate-500">Total do inventário avaliado</p>
        </div>

        {/* KPI 2: Estoque Total em Unidades */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs relative overflow-hidden space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Estoque Total
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{inventory}</p>
          <p className="text-[11px] text-slate-500">Unidades físicas disponíveis</p>
        </div>

        {/* KPI 3: Itens Cadastrados */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs relative overflow-hidden space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Produtos
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{products.length}</p>
          <p className="text-[11px] text-slate-500">Itens ativos no catálogo</p>
        </div>

        {/* KPI 4: Categorias */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs relative overflow-hidden space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Categorias
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{flatCategories.length}</p>
          <p className="text-[11px] text-slate-500">Pai e Subcategorias</p>
        </div>
      </div>

      {/* Seção de Alerta de Estoque Crítico */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Atenção ao Estoque (Crítico ou Baixo)
              </h2>
              <p className="text-xs text-slate-500">
                Produtos que necessitam de reposição imediata (estoque menor ou igual a 5).
              </p>
            </div>
          </div>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <Link href="/admin/produtos">
              Ver todos <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-6 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-emerald-950">Estoque 100% Saudável</p>
            <p className="text-xs text-emerald-700">
              Todos os produtos cadastrados possuem mais de 5 unidades disponíveis no momento.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden">
            {lowStockProducts.map((product) => {
              const stock = Number(product.stock) || 0;
              const isOutOfStock = stock === 0;

              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {product.category} • {formatCurrency(Number(product.price) || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isOutOfStock
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {isOutOfStock ? "Esgotado (0)" : `${stock} restantes`}
                    </span>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-lg text-[11px] font-semibold border-slate-200 px-2.5"
                    >
                      <Link href={`/admin/produtos`}>Gerenciar</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Distribuição por Categorias */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Distribuição por Categorias</h2>
            <p className="text-xs text-slate-500">Volume de itens cadastrados por segmento.</p>
          </div>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <Link href="/admin/categorias">
              Gerenciar Categorias <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {topCategories.map(([catName, count]) => (
            <div
              key={catName}
              className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1 hover:bg-slate-100/70 transition-colors"
            >
              <p className="text-xs font-bold text-slate-800 truncate" title={catName}>
                {catName}
              </p>
              <p className="text-lg font-black text-slate-900">{count}</p>
              <p className="text-[10px] text-slate-400">itens no catálogo</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
