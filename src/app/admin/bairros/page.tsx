import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { NeighborhoodForm } from "@/components/admin/neighborhood-form";
import { AdminNeighborhoods } from "@/components/admin/admin-neighborhoods";
import { Button } from "@/components/ui/button";
import { isAdminAuthenticated } from "@/lib/auth";
import { getNeighborhoods } from "@/services/neighborhoods";

export const dynamic = "force-dynamic";

export default async function AdminNeighborhoodsPage() {
  const isAdmin = await isAdminAuthenticated();

  if (!isAdmin) {
    redirect("/admin/login");
  }

  const neighborhoods = await getNeighborhoods();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500 selection:text-zinc-950">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md shadow-xl">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
              Taxas & Entregas
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-amber-400" /> Gerenciamento de Bairros
            </h1>
          </div>
          <Button
            asChild
            variant="outline"
            className="rounded-lg border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-800 hover:text-white text-xs font-semibold"
          >
            <Link href="/admin">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Voltar ao Painel Admin
            </Link>
          </Button>
        </header>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md shadow-xl">
          <NeighborhoodForm />
        </section>

        <section>
          <AdminNeighborhoods neighborhoods={neighborhoods} />
        </section>
      </div>
    </div>
  );
}
