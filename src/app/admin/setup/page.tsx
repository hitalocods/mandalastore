import { redirect } from "next/navigation";
import { setupNeighborhoodsTable } from "@/app/actions/setup-database";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const isAdmin = await isAdminAuthenticated();

  if (!isAdmin) {
    redirect("/admin/login");
  }

  const result = await setupNeighborhoodsTable();

  return (
    <main className="min-h-dvh bg-[#fafafa] flex items-center justify-center">
      <div className="rounded-lg border bg-white p-8 shadow-sm max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Configuração do Banco</h1>
        {result.success ? (
          <div className="space-y-4">
            <p className="text-green-600">{result.message}</p>
            <a href="/admin" className="inline-block w-full text-center rounded-full bg-primary text-primary-foreground h-12 flex items-center justify-center">
              Voltar ao Admin
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-red-600">{result.message}</p>
            <p className="text-sm text-muted-foreground">Verifique as configurações do banco de dados.</p>
            <a href="/admin" className="inline-block w-full text-center rounded-full border h-12 flex items-center justify-center">
              Voltar ao Admin
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
