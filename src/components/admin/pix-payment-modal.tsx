"use client";

import { useState, useEffect } from "react";
import {
  QrCode,
  Copy,
  Check,
  RefreshCw,
  X,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthRef: string;
  amount: number;
  qrCodeBase64?: string | null;
  pixCopyPaste?: string | null;
  checkoutUrl?: string | null;
  onPaymentSuccess: () => void;
}

export function PixPaymentModal({
  isOpen,
  onClose,
  monthRef,
  amount,
  qrCodeBase64,
  pixCopyPaste,
  checkoutUrl,
  onPaymentSuccess,
}: PixPaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Copiar código Pix Copia e Cola
  const handleCopy = () => {
    if (pixCopyPaste) {
      navigator.clipboard.writeText(pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Checar status
  const handleCheck = async (silent = false) => {
    if (!silent) setIsChecking(true);
    try {
      const res = await fetch("/api/admin/billing/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthRef }),
      });
      const data = await res.json();

      if (data.isPaid || !data.isBlocked) {
        setStatusMessage("Pagamento confirmado! Acesso liberado.");
        setTimeout(() => {
          onPaymentSuccess();
          onClose();
        }, 1200);
      } else if (!silent) {
        setStatusMessage("Pagamento ainda não detectado. Se já pagou, aguarde alguns segundos.");
      }
    } catch {
      if (!silent) setStatusMessage("Erro ao consultar status. Tente novamente.");
    } finally {
      if (!silent) setIsChecking(false);
    }
  };

  // Polling automático a cada 4 segundos enquanto o modal estiver aberto
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      handleCheck(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, monthRef]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Topo com Ícone e Título */}
        <div className="space-y-1.5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <QrCode className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Pagamento via PIX Instantâneo
          </h3>
          <p className="text-xs text-slate-500">
            Abra o app do seu banco e escaneie o QR Code ou copie o código Pix abaixo.
          </p>
        </div>

        {/* Caixa do QR Code */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          {qrCodeBase64 ? (
            <div className="flex justify-center">
              <img
                src={qrCodeBase64}
                alt="QR Code PIX"
                className="h-56 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xs"
              />
            </div>
          ) : (
            <div className="h-56 w-56 mx-auto flex flex-col items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 p-4 text-center">
              <QrCode className="h-10 w-10 text-slate-300" />
              <p className="text-xs text-slate-500 font-medium">
                QR Code pronto no checkout do AbacatePay.
              </p>
              {checkoutUrl && (
                <Button
                  asChild
                  size="sm"
                  className="rounded-lg bg-emerald-600 text-white font-bold text-xs"
                >
                  <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                    Abrir QR Code na Tela <ExternalLink className="ml-1 h-3.5 w-3.5" />
                  </a>
                </Button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs px-2 text-slate-600">
            <span>Valor:</span>
            <strong className="text-lg font-black text-emerald-600">
              R$ {amount.toFixed(2).replace(".", ",")}
            </strong>
          </div>
        </div>

        {/* Código Pix Copia e Cola */}
        {pixCopyPaste && (
          <div className="space-y-2 text-left">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
              Código Pix Copia e Cola:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={pixCopyPaste}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 focus:outline-hidden"
              />
              <Button
                type="button"
                onClick={handleCopy}
                className={`rounded-xl h-9 px-3.5 text-xs font-bold shrink-0 transition-all ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" /> Copiar Pix
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Status / Feedback */}
        {statusMessage && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-700 flex items-center justify-center gap-1.5">
            {statusMessage.includes("confirmado") ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 text-slate-400 animate-spin shrink-0" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Ações */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <Button
            onClick={() => handleCheck(false)}
            disabled={isChecking}
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs cursor-pointer gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
            {isChecking ? "Verificando Pagamento..." : "Já Paguei no Banco (Liberar Acesso)"}
          </Button>

          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Identificação e liberação automática via AbacatePay PIX.
          </p>
        </div>
      </div>
    </div>
  );
}
