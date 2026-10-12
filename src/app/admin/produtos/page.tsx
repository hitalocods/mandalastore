import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminProducts } from "@/components/admin/admin-products";
import { getProducts } from "@/services/products";
import { getAllFlatCategories } from "@/services/categories";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = (await getProducts().catch(() => [])) || [];
  const flatCategories = (await getAllFlatCategories().catch(() => [])) || [];

  const categoryNames = Array.from(
    new Set(Array.isArray(flatCategories) ? flatCategories.map((c) => c.name) : [])
  );

  return (
    <div className="space-y-6">
      {/* Header do Catálogo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Gerenciamento de Estoque
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="h-7 w-7 text-amber-600" /> Catálogo de Produtos
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Total de <strong>{products.length}</strong> produtos cadastrados. Busque, filtre por categoria ou edite preços e variações.
          </p>
        </div>

        <Button
          asChild
          className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 px-4 shadow-sm gap-1.5 shrink-0"
        >
          <Link href="/admin/produtos/novo">
            <Plus className="h-4 w-4" /> Cadastrar Novo Produto
          </Link>
        </Button>
      </div>

      {/* Lista em Largura Total */}
      <AdminProducts
        products={products}
        availableCategories={categoryNames.length > 0 ? categoryNames : undefined}
      />
    </div>
  );
}
