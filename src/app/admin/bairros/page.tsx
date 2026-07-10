import Link from "next/link";
import { redirect } from "next/navigation";
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
    <main className="min-h-dvh bg-[#fafafa]">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Bairros</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Gerenciamento de Bairros</h1>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin">Voltar ao Admin</Link>
          </Button>
        </header>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <NeighborhoodForm />
        </section>

        <section>
          <AdminNeighborhoods neighborhoods={neighborhoods} />
        </section>
      </div>
    </main>
  );
}
