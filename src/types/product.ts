export const categories = ["Cachimbos", "Charutos", "Fumos", "Cigarros", "Vestuário", "Baralhos", "Acessórios"] as const;

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  stock: number;
  image_url: string | null;
  created_at: string;
};

export type ProductInput = Omit<Product, "id" | "created_at">;
