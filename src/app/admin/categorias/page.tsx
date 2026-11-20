import { Layers } from "lucide-react";
import { CategoryManager } from "@/components/admin/category-manager";
import { getCategories, getAllFlatCategories } from "@/services/categories";
import { getProducts } from "@/services/products";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categoriesTree, flatCategories, products] = await Promise.all([
    getCategories().catch(() => []),
    getAllFlatCategories().catch(() => []),
    getProducts().catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      {/* Header de Categorias */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Estrutura do Catálogo & Tela Inicial
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Layers className="h-7 w-7 text-purple-600" /> Categorias & Cards da Entrada
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Crie categorias, escolha em qual dos 4 cards da tela inicial cada uma aparece e organize a vitrine da loja.
        </p>
      </div>

      {/* Gerenciador */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <CategoryManager
          categoriesTree={categoriesTree || []}
          flatCategories={flatCategories || []}
          products={products || []}
        />
      </div>
    </div>
  );
}
