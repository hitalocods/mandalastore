export const categories = [
  "Cachimbos",
  "Charutos",
  "Fumos",
  "Cigarros",
  "Vestuário Masculino",
  "Vestuário Feminino",
  "Baralhos",
  "Acessórios",
  "Bebidas",
  "Itens de Barro",
  "Guias",
  "Taças",
  "Chapéus",
  "Leques",
  "Exus de Cerâmica",
  "Erês",
  "Pombagira de Gesso",
  "Caboclos de Gesso",
  "Orixás",
  "Iemanjá",
  "Imagens Católicas",
  "Preto Velho (Gesso e Cerâmica)",
] as const;

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  stock: number;
  image_url: string | null;
  is_premium?: boolean;
  is_available?: boolean;
  created_at: string;
};

export type ProductInput = Omit<Product, "id" | "created_at">;
