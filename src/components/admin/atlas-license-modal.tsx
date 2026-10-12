"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  X,
  CreditCard,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Server,
  Database,
  Lock,
  Headphones,
  CheckCircle2,
  Calendar,
  Layers,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BillingStatus } from "@/services/billing";

interface AtlasLicenseModalProps {
  billing: BillingStatus;
}

export function AtlasLicenseModal({ billing }: AtlasLicenseModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);

  // Fecha com ESC e previne rolagem da página quando o modal estiver aberto
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handlePay = async () => {
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

  return (
    <>
      {/* Botão de Disparo no Header */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer h-8 sm:h-9 px-2.5 sm:px-3"
        title="Ver informações da licença do sistema"
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        <span className="hidden sm:inline">Licença</span> Atlas
      </Button>

      {/* Modal Overlay Centralizado e Responsivo */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-hidden"
          onClick={() => setIsOpen(false)}
        >
          {/* Container do Modal com Altura Máxima e Rolagem Interna */}
          <div
            className="relative flex flex-col w-full max-w-2xl max-h-[92dvh] sm:max-h-[88dvh] rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Fixo no Topo do Modal */}
            <div className="shrink-0 relative bg-gradient-to-r from-slate-950 via-slate-900 to-zinc-900 px-4 py-3.5 sm:px-6 sm:py-4 text-white overflow-hidden border-b border-slate-800">
              {/* Efeitos luminosos suaves */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-500/15 blur-2xl" />
              <div className="pointer-events-none absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-amber-500/15 blur-2xl" />

              <div className="flex items-center justify-between relative z-10 gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                      <Sparkles className="h-2.5 w-2.5" /> Atlas Software
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-mono text-slate-300">
                      v2.4 Enterprise
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl font-black tracking-tight text-white truncate">
                    Certificado de Licença de Uso
                  </h2>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  title="Fechar modal (ESC)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo com Rolagem Interna Suave */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain">
              {/* Card de Identificação da Empresa / Loja */}
              <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-[#cc0000] to-[#d4af37] flex items-center justify-center text-white shadow-xs shrink-0">
                    <Store className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                      MANDALLA PRIME
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-mono">
                      Licença: <strong className="text-slate-800">ATL-MP-2026-BR-01</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Licença Ativa
                  </span>
                </div>
              </div>

              {/* Grid de Informações Financeiras & Plano (Responsivo 2 colunas mobile, 4 colunas desktop) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-0.5 shadow-2xs">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Plano Ativo
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1">
                    <Layers className="h-3 w-3 text-amber-600 shrink-0" /> Loja Pro
                  </p>
                  <p className="text-[10px] text-slate-400">Recursos ilimitados</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-0.5 shadow-2xs">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Valor Mensal
                  </span>
                  <p className="text-sm sm:text-base font-extrabold text-emerald-600">
                    R$ {billing.amount.toFixed(2).replace(".", ",")}
                  </p>
                  <p className="text-[10px] text-slate-400">Por mês</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-0.5 shadow-2xs">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Vencimento
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-rose-600 shrink-0" /> Todo dia 20
                  </p>
                  <p className="text-[10px] text-slate-400">Trava no dia 21</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-0.5 shadow-2xs">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Pagamento
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1 truncate">
                    <CreditCard className="h-3 w-3 text-blue-600 shrink-0" /> Mercado Pago
                  </p>
                  <p className="text-[10px] text-slate-400">PIX ou Cartão</p>
                </div>
              </div>

              {/* Serviços e Benefícios Inclusos na Licença */}
              <div className="space-y-2">
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  Serviços Inclusos na Mensalidade Atlas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2 sm:p-2.5 text-slate-700">
                    <Server className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px] sm:text-xs">Hospedagem em nuvem de alta performance</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2 sm:p-2.5 text-slate-700">
                    <Database className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px] sm:text-xs">Banco de dados Neon PostgreSQL dedicado</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2 sm:p-2.5 text-slate-700">
                    <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px] sm:text-xs">Segurança SSL e proteção contra ataques</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2 sm:p-2.5 text-slate-700">
                    <Headphones className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px] sm:text-xs">Suporte técnico continuado e atualizações</span>
                  </div>
                </div>
              </div>

              {/* Próxima Cobrança & Ação de Pagamento */}
              <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-emerald-50/40 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500">Próxima Fatura:</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    Vencimento em <strong>{billing.dueDateFormatted}</strong> (Ref. {billing.dueMonthRef})
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">
                    Status:{" "}
                    <strong className={billing.status === "paid" ? "text-emerald-700" : "text-amber-700"}>
                      {billing.status === "paid" ? "Fatura Quitada" : "Aguardando Vencimento / Aberta"}
                    </strong>
                  </p>
                </div>

                <Button
                  onClick={handlePay}
                  disabled={isLoadingCheckout}
                  size="sm"
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs gap-1.5 shadow-xs cursor-pointer h-9 px-3.5 shrink-0 self-stretch sm:self-auto justify-center"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  {isLoadingCheckout ? "Gerando..." : "Antecipar / Pagar Fatura"}
                  <ExternalLink className="h-3 w-3 opacity-80" />
                </Button>
              </div>
            </div>

            {/* Rodapé Fixo na Base do Modal */}
            <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-6 sm:py-3.5 flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-600">
              <a
                href="https://wa.me/5586999540408?text=Olá!%20Sou%20da%20loja%20Mandala%20Prime%20e%20gostaria%20de%20falar%20com%20o%20suporte%20Atlas."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold text-[11px] sm:text-xs"
              >
                <MessageCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                Suporte Atlas Software: (86) 99954-0408
              </a>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 h-7 sm:h-8 px-2 sm:px-3"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
