import { MapPin } from "lucide-react";
import { NeighborhoodForm } from "@/components/admin/neighborhood-form";
import { AdminNeighborhoods } from "@/components/admin/admin-neighborhoods";
import { getNeighborhoods } from "@/services/neighborhoods";

export const dynamic = "force-dynamic";

export default async function AdminNeighborhoodsPage() {
  const neighborhoods = await getNeighborhoods();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Entregas & Frete
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <MapPin className="h-7 w-7 text-amber-600" /> Bairros & Taxas de Entrega
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Cadastre os bairros atendidos e configure o valor da taxa de entrega cobrada no checkout.
        </p>
      </div>

      {/* Formulário de Cadastro */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Adicionar / Editar Bairro
        </h2>
        <NeighborhoodForm />
      </div>

      {/* Lista de Bairros */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Bairros Cadastrados ({neighborhoods.length})
        </h2>
        <AdminNeighborhoods neighborhoods={neighborhoods} />
      </div>
    </div>
  );
}
