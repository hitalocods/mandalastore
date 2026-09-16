"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, MessageCircle, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Erro capturado na aplicação:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Brand Header */}
        <div className="inline-flex items-center justify-center gap-2">
          <Store className="h-6 w-6 text-[#cc0000]" />
          <span className="text-lg font-extrabold tracking-[0.22em] bg-gradient-to-r from-[#cc0000] to-[#d4af37] bg-clip-text text-transparent">
            MANDALLA PRIME
          </span>
        </div>

        {/* Error Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-inner">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Instabilidade Momentânea
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Ocorreu uma oscilação temporária de conexão com o servidor. Seus dados e pedidos estão seguros.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              onClick={() => reset()}
              className="w-full rounded-xl bg-gradient-to-r from-[#cc0000] to-[#d4af37] text-white font-bold text-xs sm:text-sm py-2.5 hover:brightness-110 shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </Button>

            <Button
              variant="outline"
              asChild
              className="w-full rounded-xl border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white text-xs sm:text-sm py-2.5 cursor-pointer"
            >
              <Link href="/" className="flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                Voltar para a Página Inicial
              </Link>
            </Button>

            <Button
              variant="ghost"
              asChild
              className="w-full text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-xs py-2 cursor-pointer"
            >
              <a
                href="https://wa.me/5531991475960?text=Ol%C3%A1%2C+ocorreu+uma+instabilidade+ao+acessar+o+site+da+Mandalla+Prime"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Falar Conosco no WhatsApp
              </a>
            </Button>
          </div>

          {error?.digest && (
            <p className="text-[10px] text-slate-500 font-mono pt-2 border-t border-white/5">
              Ref: {error.digest}
            </p>
          )}
        </div>

        <p className="text-[11px] text-slate-500">
          Mandalla Prime &copy; {new Date().getFullYear()} &bull; Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
