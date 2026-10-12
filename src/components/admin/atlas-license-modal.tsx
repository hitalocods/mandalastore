"use client";

import { useState } from "react";
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
        className="rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
        title="Ver informações da licença do sistema"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        <span className="hidden sm:inline">Licença</span> Atlas
      </Button>

      {/* Modal Overlay & Card */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-2xl rounded-3xl border border-slate-200/80 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header com identidade Atlas Software */}
            <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-zinc-900 p-6 text-white overflow-hidden">
              {/* Efeitos luminosos */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl" />
              <div className="pointer-events-none absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-amber-500/15 blur-3xl" />

              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                      <Sparkles className="h-3 w-3" /> Atlas Software
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-mono text-slate-300">
                      v2.4 Enterprise
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    Certificado de Licença de Uso
                  </h2>
                  <p className="text-xs text-slate-400">
                    SaaS de Comércio Eletrônico desenvolvido e mantido por Atlas Software
                  </p>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Card de Identificação da Empresa / Loja */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#cc0000] to-[#d4af37] flex items-center justify-center text-white shadow-xs">
                    <Store className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">MANDALLA PRIME</h3>
                    <p className="text-xs text-slate-500 font-mono">
                      ID da Licença: <strong className="text-slate-800">ATL-MP-2026-BR-01</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Licença Ativa
                  </span>
                </div>
              </div>

              {/* Grid de Informações Financeiras & Plano */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Plano Ativo
                  </span>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-amber-600 shrink-0" /> Loja Pro
                  </p>
                  <p className="text-[10px] text-slate-500">Recursos ilimitados</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Valor Mensal
                  </span>
                  <p className="text-base font-extrabold text-emerald-600">
                    R$ {billing.amount.toFixed(2).replace(".", ",")}
                  </p>
                  <p className="text-[10px] text-slate-500">Por mês</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Vencimento
                  </span>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-rose-600 shrink-0" /> Todo dia 20
                  </p>
                  <p className="text-[10px] text-slate-500">Trava no dia 21</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Pagamento
                  </span>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5 text-blue-600 shrink-0" /> Mercado Pago
                  </p>
                  <p className="text-[10px] text-slate-500">PIX ou Cartão</p>
                </div>
              </div>

              {/* Serviços e Benefícios Inclusos na Licença */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Serviços Inclusos na Mensalidade Atlas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-slate-700">
                    <Server className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Hospedagem em nuvem de alta disponibilidade</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-slate-700">
                    <Database className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Banco de dados Neon PostgreSQL dedicado</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-slate-700">
                    <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Segurança SSL e proteção contra ataques</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-slate-700">
                    <Headphones className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Suporte técnico continuado e atualizações</span>
                  </div>
                </div>
              </div>

              {/* Próxima Cobrança & Ação de Pagamento */}
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-emerald-50/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500">Próxima Fatura:</span>
                  <p className="text-sm font-bold text-slate-900">
                    Vencimento em <strong>{billing.dueDateFormatted}</strong> (Ref. {billing.dueMonthRef})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Status atual:{" "}
                    <strong className={billing.status === "paid" ? "text-emerald-700" : "text-amber-700"}>
                      {billing.status === "paid" ? "Fatura Quitada" : "Aguardando Vencimento / Aberta"}
                    </strong>
                  </p>
                </div>

                <Button
                  onClick={handlePay}
                  disabled={isLoadingCheckout}
                  size="sm"
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs gap-1.5 shadow-xs cursor-pointer h-9 px-4 shrink-0"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  {isLoadingCheckout ? "Gerando..." : "Antecipar / Pagar Fatura"}
                  <ExternalLink className="h-3 w-3 opacity-80" />
                </Button>
              </div>
            </div>

            {/* Rodapé com Suporte Atlas */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <a
                href="https://wa.me/5586999540408?text=Olá!%20Sou%20da%20loja%20Mandala%20Prime%20e%20gostaria%20de%20falar%20com%20o%20suporte%20Atlas."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                Suporte Atlas Software: (86) 99954-0408
              </a>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 h-8"
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
