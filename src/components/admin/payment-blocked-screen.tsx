"use client";

import { useState } from "react";
import {
  Lock,
  CreditCard,
  RefreshCw,
  MessageCircle,
  ExternalLink,
  ShieldAlert,
  KeyRound,
  LogOut,
  Store,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAdmin } from "@/app/actions/auth";
import type { BillingStatus } from "@/services/billing";

interface PaymentBlockedScreenProps {
  billing: BillingStatus;
}

export function PaymentBlockedScreen({ billing }: PaymentBlockedScreenProps) {
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [showBypassModal, setShowBypassModal] = useState(false);
  const [bypassKey, setBypassKey] = useState("");
  const [bypassLoading, setBypassLoading] = useState(false);
  const [bypassError, setBypassError] = useState<string | null>(null);

  // Iniciar checkout Mercado Pago
  const handleOpenCheckout = async () => {
    try {
      setIsLoadingCheckout(true);
      const res = await fetch("/api/admin/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthRef: billing.dueMonthRef }),
      });

      const data = await res.json();
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        alert(data.error || "Não foi possível abrir o checkout do Mercado Pago.");
      }
    } catch {
      alert("Erro ao conectar com o serviço de pagamento.");
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  // Verificar se o pagamento já foi aprovado
  const handleCheckPayment = async () => {
    try {
      setIsCheckingPayment(true);
      setCheckResult(null);

      const res = await fetch("/api/admin/billing/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthRef: billing.dueMonthRef }),
      });

      const data = await res.json();
      if (data.isPaid || !data.isBlocked) {
        setCheckResult("Pagamento confirmado! Desbloqueando painel...");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setCheckResult("Nenhum pagamento confirmado ainda. Se já pagou, aguarde 1 minuto e tente novamente.");
      }
    } catch {
      setCheckResult("Erro ao verificar status. Tente novamente.");
    } finally {
      setIsCheckingPayment(false);
    }
  };

  // Desbloqueio emergencial manual
  const handleBypass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBypassLoading(true);
      setBypassError(null);

      const res = await fetch("/api/admin/billing/bypass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: bypassKey, monthRef: billing.dueMonthRef }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        window.location.reload();
      } else {
        setBypassError(data.error || "Chave mestre inválida.");
      }
    } catch {
      setBypassError("Erro ao processar chave.");
    } finally {
      setBypassLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      {/* Header simples com logout */}
      <header className="border-b border-slate-800 bg-slate-900/60 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-rose-500" />
            <span className="font-bold tracking-widest text-sm text-slate-200 uppercase">
              Mandalla Prime
            </span>
          </div>

          <form action={signOutAdmin}>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sair
            </Button>
          </form>
        </div>
      </header>

      {/* Conteúdo Central */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-xl rounded-3xl border border-rose-900/40 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Efeitos decorativos */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-rose-600/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-amber-600/10 blur-3xl" />

          {/* Tag de Status */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-xs font-semibold text-rose-400">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
              Acesso Temporariamente Suspenso
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              Venceu dia {billing.dueDateFormatted}
            </span>
          </div>

          {/* Ícone e Título */}
          <div className="space-y-2 mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-2">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Mensalidade da Plataforma Pendente
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              O acesso ao painel de administração da sua loja foi temporariamente bloqueado devido ao vencimento da mensalidade de manutenção e hospedagem no dia{" "}
              <strong className="text-white">{billing.dueDateFormatted}</strong>.
            </p>
          </div>

          {/* Card com Detalhes da Cobrança */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5 mb-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Serviço:</span>
              <span className="font-semibold text-slate-200">Plataforma Mandala Prime</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Mês de Referência:</span>
              <span className="font-mono text-slate-200">{billing.dueMonthRef}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Vencimento oficial:</span>
              <span className="font-semibold text-amber-400">Todo dia 20</span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-base font-medium text-slate-300">Valor da Mensalidade:</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                R$ {billing.amount.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>

          {/* Ações de Pagamento */}
          <div className="space-y-3">
            <Button
              onClick={handleOpenCheckout}
              disabled={isLoadingCheckout}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CreditCard className="h-5 w-5" />
              {isLoadingCheckout ? "Abrindo Mercado Pago..." : "Pagar Agora (Cartão ou PIX)"}
              <ExternalLink className="h-4 w-4 ml-auto opacity-70" />
            </Button>

            <Button
              variant="outline"
              onClick={handleCheckPayment}
              disabled={isCheckingPayment}
              className="w-full h-10 rounded-xl border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isCheckingPayment ? "animate-spin" : ""}`} />
              {isCheckingPayment ? "Verificando no Mercado Pago..." : "Já realizei o pagamento (Verificar Liberação)"}
            </Button>

            {checkResult && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-center text-slate-300 flex items-center justify-center gap-1.5 animate-in fade-in">
                {checkResult.includes("confirmado") ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : null}
                <span>{checkResult}</span>
              </div>
            )}
          </div>

          {/* Rodapé do Card: Suporte & Chave Mestre */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <a
              href="https://wa.me/5586999540408?text=Olá!%20Preciso%20de%20ajuda%20com%20a%20mensalidade%20da%20loja%20Mandala%20Prime."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-300 hover:text-emerald-400 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
              Falar com o suporte no WhatsApp
            </a>

            <button
              onClick={() => setShowBypassModal(!showBypassModal)}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <KeyRound className="h-3 w-3" />
              Desbloqueio de desenvolvedor
            </button>
          </div>

          {/* Modal / Campo de Chave Mestre */}
          {showBypassModal && (
            <form onSubmit={handleBypass} className="mt-4 p-3.5 rounded-xl border border-slate-800 bg-slate-950/90 space-y-2">
              <label className="text-[11px] font-semibold text-slate-400 block">
                Chave Mestre de Emergência (Desenvolvedor):
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Insira a chave mestre..."
                  value={bypassKey}
                  onChange={(e) => setBypassKey(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={bypassLoading}
                  className="h-8 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white px-3"
                >
                  {bypassLoading ? "..." : "Liberar"}
                </Button>
              </div>
              {bypassError && <p className="text-[11px] text-rose-400">{bypassError}</p>}
            </form>
          )}
        </div>
      </main>

      {/* Footer simples */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-3 text-center text-[11px] text-slate-600">
        A loja virtual continua ativa para seus clientes. Apenas o painel de gerenciamento fica bloqueado durante a pendência.
      </footer>
    </div>
  );
}
