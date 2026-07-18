import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Layers,
  MapPin,
  LogOut,
  Plus,
  DollarSign,
  Boxes,
  Sparkles,
  Store,
} from "lucide-react";
import { signOutAdmin } from "@/app/actions/auth";
import { ProductForm } from "@/components/admin/product-form";
import { AdminProducts } from "@/components/admin/admin-products";
import { CategoryManager } from "@/components/admin/category-manager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProducts } from "@/services/products";
import { getCategories, getAllFlatCategories } from "@/services/categories";
import { isAdminAuthenticated } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAdmin = await isAdminAuthenticated();

  if (!isAdmin) {
    redirect("/admin/login");
  }

  const products = await getProducts();
  const categoriesTree = await getCategories();
  const flatCategories = await getAllFlatCategories();

  const inventory = products.reduce((sum, product) => sum + product.stock, 0);
  const catalogValue = products.reduce(
    (sum, product) => sum + product.price * product.stock,
    0
  );

  const flatCategoryNames = Array.from(new Set(flatCategories.map((c) => c.name)));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-100 selection:text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-bold tracking-[0.22em] bg-gradient-to-r from-[#cc0000] to-[#d4af37] bg-clip-text text-transparent hover:opacity-90 sm:text-base"
            >
              <Store className="h-5 w-5 text-[#cc0000]" />
              MANDALLA PRIME
            </Link>
            <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
              Painel Admin
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold"
            >
              <Link href="/admin/bairros">
                <MapPin className="h-3.5 w-3.5 mr-1.5 text-amber-600" /> Bairros
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-xs text-slate-600 hover:text-slate-900"
            >
              <Link href="/">Ver Loja</Link>
            </Button>
            <form action={signOutAdmin}>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-medium"
              >
                <LogOut className="h-3.5 w-3.5 mr-1" /> Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* KPI Dashboard Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Produtos</span>
              <Package className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{products.length}</p>
            <p className="text-[11px] text-slate-500">Itens cadastrados</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Estoque Total</span>
              <Boxes className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{inventory}</p>
            <p className="text-[11px] text-slate-500">Unidades disponíveis</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Valor em Estoque</span>
              <DollarSign className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-xl font-bold text-amber-700">{formatCurrency(catalogValue)}</p>
            <p className="text-[11px] text-slate-500">Total em inventário</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Categorias</span>
              <Layers className="h-4 w-4 text-rose-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{flatCategories.length}</p>
            <p className="text-[11px] text-slate-500">Pai e Subcategorias</p>
          </div>
        </div>

        {/* Tabbed View Navigation */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-slate-200/60 border border-slate-300/60 p-1 rounded-xl inline-flex">
            <TabsTrigger
              value="products"
              className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-slate-600 px-4 py-2"
            >
              <Package className="h-3.5 w-3.5 mr-1.5" /> Produtos & Catálogo
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-slate-600 px-4 py-2"
            >
              <Layers className="h-3.5 w-3.5 mr-1.5" /> Categorias & Subcategorias
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Products */}
          <TabsContent value="products" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              {/* Product Creation Form Sidebar (Scrollable on notebook) */}
              <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
                <div className="mb-4 border-b border-slate-100 pb-3">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider">
                    <Plus className="h-4 w-4 text-amber-600" /> Novo Produto
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Adicione um novo item ao catálogo</p>
                </div>
                <ProductForm availableCategories={flatCategoryNames} />
              </aside>

              {/* Products List & Search */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-600" /> Catálogo da Loja
                    </h2>
                    <p className="text-xs text-slate-500">Gerencie preço, estoque e fotos dos produtos</p>
                  </div>
                </div>
                <AdminProducts
                  products={products}
                  availableCategories={flatCategoryNames}
                />
              </section>
            </div>
          </TabsContent>

          {/* TAB 2: Categories */}
          <TabsContent value="categories">
            <CategoryManager
              categoriesTree={categoriesTree}
              flatCategories={flatCategories}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
