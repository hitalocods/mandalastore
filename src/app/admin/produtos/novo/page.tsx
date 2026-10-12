import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/admin/product-form";
import { getAllFlatCategories } from "@/services/categories";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const flatCategories = (await getAllFlatCategories().catch(() => [])) || [];
  const categoryNames = Array.from(
    new Set(Array.isArray(flatCategories) ? flatCategories.map((c) => c.name) : [])
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Barra de Navegação Superior */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs text-slate-600 hover:text-slate-900 -ml-2 mb-2 gap-1.5"
          >
            <Link href="/admin/produtos">
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao Catálogo
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <PlusCircle className="h-7 w-7 text-emerald-600" /> Cadastrar Novo Produto
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Preencha os dados abaixo para publicar um novo item na loja Mandala Prime.
          </p>
        </div>
      </div>

      {/* Card do Formulário */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <ProductForm
          availableCategories={categoryNames.length > 0 ? categoryNames : undefined}
        />
      </div>
    </div>
  );
}
