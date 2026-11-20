"use client";

import { useState } from "react";
import { CreditCard, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ABACATEPAY_CARD_CHECKOUT_URL, type BillingStatus } from "@/lib/billing-config";

interface PaymentWarningBannerProps {
  billing: BillingStatus;
}

export function PaymentWarningBanner({ billing }: PaymentWarningBannerProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const checkoutUrl = billing.checkoutUrl || ABACATEPAY_CARD_CHECKOUT_URL;
  const isOverdue = Boolean(billing.isOverdue || billing.daysOverdue > 0);

  if (isMinimized) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-900 shadow-xs mb-6">
        <div className="flex items-center gap-2 font-medium">
          <Clock className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            {isOverdue ? (
              <>
                Mensalidade de manutenção em aberto desde <strong>{billing.dueDateFormatted}</strong> (R$ 60,00). Painel 100% liberado.
              </>
            ) : (
              <>
                Mensalidade da plataforma vence dia <strong>{billing.dueDateFormatted}</strong> (R$ 60,00).
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="h-7 rounded-lg bg-amber-600 px-3 text-[11px] font-bold text-white hover:bg-amber-700 cursor-pointer"
          >
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
              <CreditCard className="mr-1 h-3 w-3" /> Pagar no Cartão
            </a>
          </Button>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-[11px] font-semibold text-amber-800 hover:underline cursor-pointer"
          >
            Detalhes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 p-4 sm:p-5 shadow-xs mb-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
              <Clock className="h-3 w-3" /> {isOverdue ? "Mensalidade em Aberto" : "Lembrete de Vencimento"}
            </span>
            <span className="text-xs font-semibold text-amber-900">
              {isOverdue ? `Venceu em ${billing.dueDateFormatted}` : `Vence em ${billing.dueDateFormatted}`}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Mensalidade de Suporte & Manutenção da Loja (R$ 60,00)
          </h3>
          <p className="text-xs text-slate-600">
            {isOverdue ? (
              <>
                A fatura mensal está pendente, mas seu painel administrativo e a loja continuam <strong>100% liberados e funcionando</strong> sem interrupções. Efetue o pagamento no cartão quando puder.
              </>
            ) : (
              <>
                A fatura deste mês vence dia <strong>20</strong>. Pague com cartão via AbacatePay para manter sua conta em dia.
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            asChild
            className="h-9 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs px-4 cursor-pointer gap-1.5"
          >
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
              <CreditCard className="h-3.5 w-3.5" />
              Pagar Fatura no Cartão
              <ExternalLink className="h-3 w-3 opacity-80" />
            </a>
          </Button>

          <button
            onClick={() => setIsMinimized(true)}
            className="rounded-lg px-2.5 py-1 text-xs text-slate-500 hover:bg-amber-100 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Recolher
          </button>
        </div>
      </div>
    </div>
  );
}
