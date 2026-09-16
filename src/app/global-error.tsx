"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro global capturado:", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <AlertCircle className="w-6 h-6" />
          </div>

          <h1 className="text-lg font-bold text-white">
            Instabilidade Temporária
          </h1>
          <p className="text-xs text-slate-400">
            Ocorreu uma instabilidade na inicialização do sistema. Por favor, clique abaixo para recarregar.
          </p>

          <Button
            onClick={() => reset()}
            className="w-full rounded-xl bg-gradient-to-r from-[#cc0000] to-[#d4af37] text-white font-bold text-xs py-2.5 hover:brightness-110 shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar Loja
          </Button>

          {error?.digest && (
            <p className="text-[10px] text-slate-500 font-mono">
              Ref: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
