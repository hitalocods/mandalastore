"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";
import type { StoreMode } from "@/lib/catalog-topics";

type InitialEntranceCardProps = {
  onSelectMode: (mode: StoreMode) => void;
  topicCounts?: {
    imagens?: number;
    vestuario?: number;
    acessorios?: number;
    produtos?: number;
  };
  clothingCount?: number;
  artigosCount?: number;
};

/* Miniatura fotográfica do tópico com moldura dourada */
function TopicThumb({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--gold)]/50 shadow-md shadow-black/30 group-hover:border-[var(--gold-light)]/90 group-hover:scale-105 transition-all duration-300">
      <Image src={src} alt={alt} fill sizes="64px" className="object-cover" />
    </div>
  );
}
/* Filigrana barroca dourada refinada para os cantos do card */
function CornerFiligree({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-14 h-14 sm:w-16 sm:h-16 text-[var(--gold)] pointer-events-none select-none opacity-30 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M6 6H42C42 6 32 10 24 18C16 26 12 36 12 48V78"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 6V42C6 42 10 32 18 24C26 16 36 12 48 12H78"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="20" cy="20" r="2.5" fill="currentColor" />
      <circle cx="6" cy="6" r="3" fill="currentColor" />
      <path
        d="M20 20C27 27 33 31 44 31M20 20C27 27 31 33 31 44"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M12 52C12 36 24 24 40 24C48 24 54 28 58 32"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
      <path
        d="M52 12C36 12 24 24 24 40C24 48 28 54 32 58"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
      <path
        d="M32 32L38 38M38 32L32 38"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function InitialEntranceCard({
  onSelectMode,
  topicCounts,
  clothingCount,
  artigosCount,
}: InitialEntranceCardProps) {
  // Contadores com fallback
  const imagensCount = topicCounts?.imagens ?? 26;
  const vestuarioCount = topicCounts?.vestuario ?? clothingCount ?? 36;
  const acessoriosCount = topicCounts?.acessorios ?? 0;
  const produtosCount = topicCounts?.produtos ?? artigosCount ?? 363;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 bg-[radial-gradient(ellipse_at_center,var(--red-bright)_0%,var(--red)_55%,var(--red-deep)_100%)] relative overflow-hidden text-[#fff3dc] selection:bg-[var(--gold)] selection:text-black">
      {/* Vinheta escura avermelhada nas bordas da tela */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(60,1,1,0.75)_100%)] z-0"
      />

      {/* Iluminação central sutil da coroa */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] max-w-[120vw] bg-[radial-gradient(circle,rgba(255,50,40,0.18)_0%,transparent_65%)] blur-3xl z-0"
      />

      {/* Card Central no Vermelho da Logo com Borda Dourada Fina de 1px (24px de cantos) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[550px] mx-auto relative z-10 p-[1px] rounded-[24px] bg-gradient-to-b from-[var(--gold-light)]/70 via-[var(--gold)]/40 to-[var(--gold)]/20 shadow-[0_20px_50px_rgba(65,0,0,0.65),0_0_40px_rgba(225,11,6,0.28)]"
      >
        <div className="relative rounded-[23px] bg-gradient-to-b from-[#af0804]/94 via-[#910101]/95 to-[#730101]/96 backdrop-blur-2xl p-4 sm:p-7 overflow-hidden border border-white/[0.08]">
          {/* Filigranas douradas nos 4 cantos do card */}
          <CornerFiligree className="absolute -top-1 -left-1" />
          <CornerFiligree className="absolute -top-1 -right-1 -scale-x-100" />
          <CornerFiligree className="absolute -bottom-1 -left-1 -scale-y-100" />
          <CornerFiligree className="absolute -bottom-1 -right-1 -scale-100" />

          {/* Banner Oficial Mandalla Prime (retangular, integrado com mesmo raio e moldura dourada fina) */}
          <div className="relative w-full overflow-hidden rounded-2xl border border-[var(--gold)]/40 shadow-lg shadow-[#400000]/40 bg-[var(--red)] mb-5 group">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src="/banner.jpeg"
                alt="Mandalla Prime - Religioso • Místico • Esotérico"
                fill
                priority
                sizes="(max-width: 640px) 94vw, 550px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
              />
              {/* Moldura interna fina dourada */}
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[var(--gold-light)]/25 rounded-2xl" />
            </div>
          </div>

          {/* Cabeçalho e Título Serifado */}
          <div className="text-center px-1 sm:px-2 relative z-10">
            <p className="font-cinzel text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#fff3dc]/80 font-medium mb-1.5">
              Boas-vindas à Mandalla Prime
            </p>

            <h1 className="font-cinzel text-xl sm:text-2xl md:text-[26px] font-bold text-[#fff3dc] tracking-wide uppercase leading-tight">
              O que você deseja{" "}
              <span className="block sm:inline font-extrabold bg-gradient-to-r from-[var(--gold-light)] via-[var(--gold)] to-[#8a6a12] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(201,162,39,0.4)]">
                VER HOJE?
              </span>
            </h1>

            <p className="mt-2 text-xs sm:text-[13px] text-[#fff3dc]/85 max-w-sm mx-auto font-light leading-relaxed">
              Escolha qual catálogo você quer explorar para entrar na loja:
            </p>
          </div>

          {/* Os 3 Cards de Opção de Catálogo (vermelho translúcido mais escuro, borda dourada de 1px) */}
          <div className="mt-5 space-y-2.5 sm:space-y-3 relative z-10">
            {/* Card 1: Imagens Religiosas */}
            <motion.button
              whileHover={{ scale: 1.012, y: -1.5 }}
              whileTap={{ scale: 0.988 }}
              onClick={() => onSelectMode("imagens")}
              className="group w-full relative flex items-center justify-between gap-3 sm:gap-4 overflow-hidden rounded-2xl border border-[var(--gold)]/35 hover:border-[var(--gold-light)]/75 bg-[#520000]/60 hover:bg-[#630000]/75 backdrop-blur-md p-3.5 sm:p-4 text-left shadow-md shadow-[#450000]/30 hover:shadow-[0_0_22px_rgba(201,162,39,0.25)] transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                {/* Ícone em linha dourada: Imagem / Santo */}
                <TopicThumb src="/topics/imagens.jpg" alt="Imagens Religiosas" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-cinzel text-sm sm:text-base font-bold text-[#fff3dc] group-hover:text-[var(--gold-light)] transition-colors">
                      Imagens Religiosas
                    </span>
                    {/* Contador em pílula discreta */}
                    <span className="rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/15 px-2 py-0.5 text-[10px] font-medium text-[#fff3dc] tracking-wide uppercase">
                      {imagensCount} itens
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-[#fff3dc]/80 line-clamp-1 sm:line-clamp-none font-light">
                    Católicas, Umbanda, batismo e livros
                  </p>
                </div>
              </div>

              {/* Seta deslizante no hover */}
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] text-[var(--gold)] group-hover:text-[var(--gold-light)] group-hover:border-[var(--gold-light)]/75 group-hover:bg-[var(--gold)]/20 transition-all duration-300">
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </motion.button>

            {/* Card 2: Vestuário Sagrado de Axé */}
            <motion.button
              whileHover={{ scale: 1.012, y: -1.5 }}
              whileTap={{ scale: 0.988 }}
              onClick={() => onSelectMode("vestuario")}
              className="group w-full relative flex items-center justify-between gap-3 sm:gap-4 overflow-hidden rounded-2xl border border-[var(--gold)]/35 hover:border-[var(--gold-light)]/75 bg-[#520000]/60 hover:bg-[#630000]/75 backdrop-blur-md p-3.5 sm:p-4 text-left shadow-md shadow-[#450000]/30 hover:shadow-[0_0_22px_rgba(201,162,39,0.25)] transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                {/* Ícone em linha dourada: Vestuário / Camiseta */}
                <TopicThumb src="/topics/vestuario.jpg" alt="Vestuário Sagrado de Axé" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-cinzel text-sm sm:text-base font-bold text-[#fff3dc] group-hover:text-[var(--gold-light)] transition-colors">
                      Vestuário Sagrado de Axé
                    </span>
                    {/* Contador em pílula discreta */}
                    <span className="rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/15 px-2 py-0.5 text-[10px] font-medium text-[#fff3dc] tracking-wide uppercase">
                      {vestuarioCount} peças
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-[#fff3dc]/80 line-clamp-1 sm:line-clamp-none font-light">
                    Roupas, guias, chapéus e acessórios
                  </p>
                </div>
              </div>

              {/* Seta deslizante no hover */}
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] text-[var(--gold)] group-hover:text-[var(--gold-light)] group-hover:border-[var(--gold-light)]/75 group-hover:bg-[var(--gold)]/20 transition-all duration-300">
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </motion.button>

            {/* Card: Acessórios */}
            <motion.button
              whileHover={{ scale: 1.012, y: -1.5 }}
              whileTap={{ scale: 0.988 }}
              onClick={() => onSelectMode("acessorios")}
              className="group w-full relative flex items-center justify-between gap-3 sm:gap-4 overflow-hidden rounded-2xl border border-[var(--gold)]/35 hover:border-[var(--gold-light)]/75 bg-[#520000]/60 hover:bg-[#630000]/75 backdrop-blur-md p-3.5 sm:p-4 text-left shadow-md shadow-[#450000]/30 hover:shadow-[0_0_22px_rgba(201,162,39,0.25)] transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                <TopicThumb src="/topics/acessorios.jpg" alt="Acessórios" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-cinzel text-sm sm:text-base font-bold text-[#fff3dc] group-hover:text-[var(--gold-light)] transition-colors">
                      Acessórios
                    </span>
                    <span className="rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/15 px-2 py-0.5 text-[10px] font-medium text-[#fff3dc] tracking-wide uppercase">
                      {acessoriosCount} itens
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-[#fff3dc]/80 line-clamp-1 sm:line-clamp-none font-light">
                    Colares, brincos, chapéus, coroas e mais
                  </p>
                </div>
              </div>

              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] text-[var(--gold)] group-hover:text-[var(--gold-light)] group-hover:border-[var(--gold-light)]/75 group-hover:bg-[var(--gold)]/20 transition-all duration-300">
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </motion.button>

            {/* Card 3: Produtos Religiosos */}
            <motion.button
              whileHover={{ scale: 1.012, y: -1.5 }}
              whileTap={{ scale: 0.988 }}
              onClick={() => onSelectMode("produtos")}
              className="group w-full relative flex items-center justify-between gap-3 sm:gap-4 overflow-hidden rounded-2xl border border-[var(--gold)]/35 hover:border-[var(--gold-light)]/75 bg-[#520000]/60 hover:bg-[#630000]/75 backdrop-blur-md p-3.5 sm:p-4 text-left shadow-md shadow-[#450000]/30 hover:shadow-[0_0_22px_rgba(201,162,39,0.25)] transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                {/* Ícone em linha dourada: Vela / Chama */}
                <TopicThumb src="/topics/produtos.jpg" alt="Produtos Religiosos" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-cinzel text-sm sm:text-base font-bold text-[#fff3dc] group-hover:text-[var(--gold-light)] transition-colors">
                      Produtos Religiosos
                    </span>
                    {/* Contador em pílula discreta */}
                    <span className="rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/15 px-2 py-0.5 text-[10px] font-medium text-[#fff3dc] tracking-wide uppercase">
                      {produtosCount} itens
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-[#fff3dc]/80 line-clamp-1 sm:line-clamp-none font-light">
                    Velas, ervas, incensos, rituais e mais
                  </p>
                </div>
              </div>

              {/* Seta deslizante no hover */}
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] text-[var(--gold)] group-hover:text-[var(--gold-light)] group-hover:border-[var(--gold-light)]/75 group-hover:bg-[var(--gold)]/20 transition-all duration-300">
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </motion.button>
          </div>

          {/* Botão Secundário: Ver todo o catálogo completo (com contorno dourado) */}
          <div className="mt-4 pt-4 border-t border-[var(--gold)]/25 relative z-10">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectMode("all")}
              className="group w-full py-2.5 sm:py-3 px-4 rounded-xl border border-[var(--gold)]/45 hover:border-[var(--gold-light)]/85 bg-[var(--gold)]/[0.06] hover:bg-[var(--gold)]/[0.14] text-xs sm:text-[13px] font-medium tracking-wide text-[#fff3dc] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(201,162,39,0.2)]"
            >
              <Compass className="h-4 w-4 text-[var(--gold)] group-hover:text-[var(--gold-light)] transition-transform duration-500 group-hover:rotate-45" />
              <span className="font-cinzel tracking-wider">Ver todo o catálogo completo</span>
              <ArrowRight className="h-3.5 w-3.5 text-[var(--gold)]/80 group-hover:text-[var(--gold-light)] group-hover:translate-x-1 transition-all" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
