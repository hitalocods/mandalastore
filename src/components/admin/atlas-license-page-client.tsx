"use client";

import { useState } from "react";
import {
  ShieldCheck,
  CreditCard,
  RefreshCw,
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
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BillingStatus } from "@/services/billing";

interface AtlasLicenseClientProps {
  billing: BillingStatus;
}

export function AtlasLicenseClient({ billing }: AtlasLicenseClientProps) {
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);

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
        setCheckResult("Pagamento confirmado com sucesso! Licença regularizada.");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setCheckResult("Nenhum novo pagamento confirmado ainda. Se já pagou, aguarde 1 minuto.");
      }
    } catch {
      setCheckResult("Erro ao consultar status no Mercado Pago.");
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const isPaid = billing.status === "paid";

  return (
    <div className="space-y-6">
      {/* Banner Principal com Identidade Atlas */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-zinc-900 p-6 sm:p-8 text-white shadow-xl overflow-hidden border border-slate-800">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300 uppercase tracking-widest">
                <Sparkles className="h-3 w-3" /> Atlas Software Enterprise
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-mono text-slate-300">
                v2.4
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Certificado de Licença de Uso
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Software como Serviço (SaaS) dedicado para comércio eletrônico da loja{" "}
              <strong className="text-white">Mandalla Prime</strong>, com infraestrutura em nuvem, banco de dados gerenciado e suporte técnico especializado.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold ${
                isPaid
                  ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                  : "bg-amber-500/20 border border-amber-500/40 text-amber-300"
              }`}
            >
              {isPaid ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Licença Regularizada
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-amber-400" /> Fatura em Aberto
                </>
              )}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              ID: <strong>ATL-MP-2026-BR-01</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Grid de 4 Cards Informativos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Plano Contratado
          </span>
          <p className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-amber-600" /> Loja Pro
          </p>
          <p className="text-[11px] text-slate-500">Recursos e catálogo ilimitados</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Valor Mensal
          </span>
          <p className="text-xl font-black text-emerald-600">
            R$ {billing.amount.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-[11px] text-slate-500">Cobrança todo mês</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Dia de Vencimento
          </span>
          <p className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-rose-600" /> Todo dia 20
          </p>
          <p className="text-[11px] text-slate-500">Trava automática no dia 21</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Forma de Pagamento
          </span>
          <p className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-blue-600" /> Mercado Pago
          </p>
          <p className="text-[11px] text-slate-500">Cartão de Crédito ou PIX</p>
        </div>
      </div>

      {/* Card da Fatura Atual & Pagamento */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Fatura de Manutenção do Mês
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Mensalidade Referência: {billing.dueMonthRef}
            </h2>
            <p className="text-xs text-slate-500">
              Vencimento previsto para <strong>{billing.dueDateFormatted}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handlePay}
              disabled={isLoadingCheckout}
              className="h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm px-5 shadow-sm gap-2 cursor-pointer"
            >
              <CreditCard className="h-4 w-4" />
              {isLoadingCheckout ? "Abrindo Mercado Pago..." : "Pagar Fatura (Cartão ou PIX)"}
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </Button>

            <Button
              variant="outline"
              onClick={handleCheckPayment}
              disabled={isCheckingPayment}
              className="h-11 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold px-4 gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isCheckingPayment ? "animate-spin" : ""}`} />
              Verificar
            </Button>
          </div>
        </div>

        {checkResult && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-slate-500 shrink-0" />
            <span>{checkResult}</span>
          </div>
        )}

        {/* Recursos Inclusos na Licença */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Coberturas e Serviços Ativos no Contrato
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <Server className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Hospedagem em Nuvem de Alta Disponibilidade</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Servidores otimizados com tempo de carregamento acelerado e garantia de uptime.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <Database className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Banco de Dados Dedicado (Neon PostgreSQL)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Armazenamento seguro e isolado de todos os produtos, preços e configurações.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <Lock className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Segurança SSL & Backup Contínuo</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Criptografia de ponta a ponta em todas as rotas e proteção contra invasões.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <Headphones className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Suporte Técnico Continuado</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Canal direto com os desenvolvedores da Atlas Software para suporte e melhorias.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contato Oficial do Desenvolvedor */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Canal de Suporte & Manutenção Atlas Software</p>
            <p className="text-xs text-slate-500">
              Dúvidas sobre a fatura, relatórios ou personalizações da plataforma.
            </p>
          </div>
        </div>

        <Button
          asChild
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 gap-1.5"
        >
          <a
            href="https://wa.me/5586999540408?text=Olá!%20Sou%20da%20loja%20Mandala%20Prime%20e%20gostaria%20de%20falar%20com%20o%20suporte%20Atlas."
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp (86) 99954-0408
          </a>
        </Button>
      </div>
    </div>
  );
}
