"use client";

import { MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";

export function WhatsAppButton() {
  const handleClick = () => {
    const message = encodeURIComponent(SITE_CONFIG.whatsappMessage);
    const url = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${message}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      aria-label="Atendimento no WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-green-600/30 hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer"
    >
      <span className="sr-only">Falar no WhatsApp</span>
      <MessageCircle className="h-7 w-7 transition-transform group-hover:rotate-12" />
      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300" />
      </span>
    </button>
  );
}
