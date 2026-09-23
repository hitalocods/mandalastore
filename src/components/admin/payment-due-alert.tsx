"use client";

import { useState } from "react";
import {
  AlertCircle,
  ExternalLink,
  MessageCircle,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const INVOICE_URL = "https://invoice.infinitepay.io/atlassoftware/l5bc5lNOwH/";
const WHATSAPP_NUMBER_DISPLAY = "(86) 99954-0408";
const WHATSAPP_NUMBER_RAW = "5586999540408";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Olá! Segue o comprovante de pagamento da mensalidade/fatura da loja Mandala Prime (vencimento 22/09)."
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER_RAW}?text=${WHATSAPP_MESSAGE}`;

export function PaymentDueAlert() {
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-300 bg-gradient-to-r from-red-50 via-amber-50/80 to-red-50 px-4 py-2.5 text-xs text-red-900 shadow-xs transition-all">
        <div className="flex items-center gap-2 font-medium">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
          </span>
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>
            <strong>Atenção:</strong> Fatura da plataforma venceu hoje (<strong>22/09</strong>).
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="h-8 rounded-lg bg-red-600 px-3 text-xs font-bold text-white shadow-xs hover:bg-red-700"
          >
            <a href={INVOICE_URL} target="_blank" rel="noopener noreferrer">
              <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Pagar Fatura
            </a>
          </Button>

          <Button
            asChild
            size="sm"
            className="h-8 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
          >
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> Comprovante
            </a>
          </Button>

          <button
            onClick={() => setIsMinimized(false)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100 hover:text-red-900 transition-colors cursor-pointer"
            title="Expandir aviso completo"
          >
            <ChevronDown className="h-3.5 w-3.5" /> Detalhes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-red-300 bg-gradient-to-br from-red-50 via-rose-50/70 to-amber-50/80 p-5 sm:p-6 shadow-sm transition-all">
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-red-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />

      {/* Minimize toggle button */}
      <button
        onClick={() => setIsMinimized(true)}
        className="absolute right-3.5 top-3.5 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-red-100 hover:text-slate-800 transition-colors z-10 cursor-pointer"
        title="Minimizar aviso"
      >
        <ChevronUp className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Recolher</span>
      </button>

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Side: Information */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-xs animate-pulse">
              <ShieldAlert className="h-3.5 w-3.5" />
              Fatura Venceu Hoje
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
              <Clock className="h-3 w-3 text-amber-700" />
              22 de Setembro
            </span>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Aviso de Vencimento da Plataforma
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              A mensalidade de suporte, hospedagem e manutenção da sua loja virtual Mandala Prime
              venceu hoje (<strong>22/09</strong>). Realize o pagamento pelo link oficial da
              InfinitePay abaixo e envie o comprovante via WhatsApp para validação imediata da sua conta.
            </p>
          </div>

          {/* WhatsApp Support Info Banner */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 pt-1">
            <span className="font-semibold text-slate-800">Envio de comprovante:</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-white/90 border border-slate-200 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-700">
              <MessageCircle className="h-3 w-3 text-emerald-600" />
              {WHATSAPP_NUMBER_DISPLAY}
            </span>
            <span className="text-[11px] text-slate-500">
              (Liberação rápida após o envio)
            </span>
          </div>
        </div>

        {/* Right Side: Action CTA Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2.5 min-w-[280px]">
          {/* Main Action: Pay Invoice */}
          <Button
            asChild
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold shadow-md hover:shadow-lg transition-all rounded-xl h-11 text-xs sm:text-sm gap-2"
          >
            <a href={INVOICE_URL} target="_blank" rel="noopener noreferrer">
              <CreditCard className="h-4 w-4" />
              Pagar Fatura Online
              <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-80" />
            </a>
          </Button>

          {/* Secondary Action: Send Receipt WhatsApp */}
          <Button
            asChild
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs hover:shadow-md transition-all rounded-xl h-10 text-xs sm:text-sm gap-2"
          >
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
              Enviar Comprovante (WhatsApp)
              <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-80" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
