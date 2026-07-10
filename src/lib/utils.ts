import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { categories } from "@/types/product";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(safeValue);
}

export function normalizeCategory(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .toLowerCase();
}

const categoryAliases: Record<string, (typeof categories)[number]> = {
  acessorios: "Acessórios",
  acessorio: "Acessórios",
  baralho: "Baralhos",
  baralhos: "Baralhos",
  bebida: "Bebidas",
  bebidas: "Bebidas",
  caboclo: "Caboclos de Gesso",
  caboclos: "Caboclos de Gesso",
  "caboclos de gesso": "Caboclos de Gesso",
  cachimbo: "Cachimbos",
  cachimbos: "Cachimbos",
  charuto: "Charutos",
  charutos: "Charutos",
  chapeu: "Chapéus",
  chapeus: "Chapéus",
  cigarro: "Cigarros",
  cigarros: "Cigarros",
  ere: "Erês",
  eres: "Erês",
  "exu ceramica": "Exus de Cerâmica",
  "exus ceramica": "Exus de Cerâmica",
  "exus de ceramica": "Exus de Cerâmica",
  fumo: "Fumos",
  fumos: "Fumos",
  guia: "Guias",
  guias: "Guias",
  "iemanja": "Iemanjá",
  "imagens catolicas": "Imagens Católicas",
  "imagem catolica": "Imagens Católicas",
  "item de barro": "Itens de Barro",
  "itens de barro": "Itens de Barro",
  leque: "Leques",
  leques: "Leques",
  orixa: "Orixás",
  orixas: "Orixás",
  "pomba gira de gesso": "Pombagira de Gesso",
  "pomba gira gesso": "Pombagira de Gesso",
  "pombagira de gesso": "Pombagira de Gesso",
  "pombagira gesso": "Pombagira de Gesso",
  "preto velho": "Preto Velho (Gesso e Cerâmica)",
  "preto velho ceramica": "Preto Velho (Gesso e Cerâmica)",
  "preto velho gesso": "Preto Velho (Gesso e Cerâmica)",
  "preto velho gesso ceramica": "Preto Velho (Gesso e Cerâmica)",
  taca: "Taças",
  tacas: "Taças",
  vestuario: "Vestuário Masculino",
  "vestuario masculino": "Vestuário Masculino",
  "vestuario feminino": "Vestuário Feminino",
};

for (const category of categories) {
  categoryAliases[normalizeCategory(category)] = category;
}

export function toCanonicalCategory(value: string): (typeof categories)[number] | null {
  const normalized = normalizeCategory(value);
  return categoryAliases[normalized] || null;
}
