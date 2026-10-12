import { Layers } from "lucide-react";
import { CategoryManager } from "@/components/admin/category-manager";
import { getCategories, getAllFlatCategories } from "@/services/categories";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categoriesTree = (await getCategories().catch(() => [])) || [];
  const flatCategories = (await getAllFlatCategories().catch(() => [])) || [];

  return (
    <div className="space-y-6">
      {/* Header de Categorias */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Estrutura do Catálogo
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Layers className="h-7 w-7 text-purple-600" /> Gerenciamento de Categorias
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Crie, edite ou organize categorias pai e subcategorias para organizar a navegação dos seus clientes.
        </p>
      </div>

      {/* Gerenciador */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <CategoryManager
          categoriesTree={categoriesTree}
          flatCategories={flatCategories}
        />
      </div>
    </div>
  );
}
