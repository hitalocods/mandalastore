"use client";

import { useState } from "react";
import {
  AlertTriangle,
  HardDrive,
  ArrowUpRight,
  TrendingUp,
  X,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function StorageLimitAlert() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const usedGb = 10.7;
  const totalGb = 10.0;
  const percent = Math.min(100, Math.round((usedGb / totalGb) * 100));

  if (isDismissed) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/90 px-4 py-2 text-xs text-red-800 shadow-xs">
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />
          <span>
            <strong>Atenção:</strong> Limite de armazenamento estourado ({usedGb} GB / {totalGb} GB).
          </span>
        </div>
        <button
          onClick={() => setShowUpgradeModal(true)}
          className="font-bold underline text-red-900 hover:text-red-700 ml-3 cursor-pointer"
        >
          Ver opções de Upgrade
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border-2 border-red-300 bg-gradient-to-br from-red-50 via-rose-50 to-amber-50/70 p-5 sm:p-6 shadow-sm transition-all">
        {/* Glow & background decor */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-red-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-amber-400/15 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Main Info */}
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-xs animate-pulse">
                <AlertTriangle className="h-3.5 w-3.5" />
                Limite Excedido (107%)
              </span>
              <span className="text-xs font-semibold text-red-800/80">
                Plano de Armazenamento & Mídia
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Armazenamento cheio: Você usou{" "}
              <span className="text-red-600 underline decoration-red-400 decoration-2 underline-offset-2">
                {usedGb} GB
              </span>{" "}
              de {totalGb} GB
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              O limite de armazenamento de fotos e tráfego de dados da sua loja foi ultrapassado. Para evitar a suspensão do envio de novas fotos de produtos e garantir a estabilidade da vitrine, é necessário realizar um upgrade do seu plano.
            </p>
          </div>

          {/* Progress & Action CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-4 min-w-[280px]">
            {/* Storage Progress Bar */}
            <div className="w-full bg-white/80 backdrop-blur-xs rounded-xl border border-red-200/80 p-3.5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 text-red-700 font-bold">
                  <HardDrive className="h-3.5 w-3.5" />
                  Espaço Utilizado
                </span>
                <span className="text-red-600 font-extrabold">{usedGb} GB / {totalGb} GB</span>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 transition-all"
                  style={{ width: "100%" }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Cota do Plano: {totalGb} GB</span>
                <span className="font-bold text-red-600">+0.7 GB excedente</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 w-full">
              <Button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold shadow-md hover:shadow-lg transition-all rounded-xl h-10 text-xs sm:text-sm gap-1.5"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                Fazer Upgrade do Plano
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-6">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Upgrade de Armazenamento & Mídia
                </h4>
                <p className="text-xs text-slate-500">
                  Amplie o espaço para fotos em alta resolução e tráfego ilimitado
                </p>
              </div>
            </div>

            {/* Current Status */}
            <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Uso Atual:</span>
                <span className="text-red-700 font-bold">{usedGb} GB de {totalGb} GB (107%)</span>
              </div>
              <p className="text-xs text-red-800">
                Seu plano atual atingiu a capacidade máxima de mídia. Escolha uma das opções abaixo para expandir:
              </p>
            </div>

            {/* Plan options */}
            <div className="space-y-3">
              <div className="relative rounded-xl border-2 border-amber-400 bg-gradient-to-br from-amber-50/50 to-white p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="rounded-full bg-amber-200 text-amber-900 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                      Recomendado
                    </span>
                    <h5 className="font-bold text-slate-900 mt-1 text-sm">Plano Pro Max (50 GB)</h5>
                    <p className="text-xs text-slate-500">Espaço para até 15.000 fotos + tráfego rápido</p>
                  </div>
                  <span className="text-base font-extrabold text-slate-900">50 GB</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Plano Ilimitado Enterprise</h5>
                    <p className="text-xs text-slate-500">Armazenamento em nuvem dedicada sem limites de tráfego</p>
                  </div>
                  <span className="text-base font-extrabold text-slate-900">Ilimitado</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                asChild
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm h-11"
              >
                <a
                  href="https://wa.me/5586981881881?text=Olá,%20preciso%20fazer%20um%20upgrade%20do%20plano%20de%20armazenamento%20da%20minha%20loja%20Mandala%20Prime%20(limite%20de%2010GB%20atingido)."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TrendingUp className="h-4 w-4 mr-1.5" />
                  Solicitar Upgrade pelo WhatsApp
                </a>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUpgradeModal(false)}
                className="rounded-xl text-xs text-slate-600 border-slate-200"
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
