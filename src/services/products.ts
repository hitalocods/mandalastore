import { unstable_noStore as noStore } from "next/cache";
import type { Product } from "@/types/product";
import { sql } from "@/lib/db";

const fallbackProducts: Product[] = [
  {
    id: "demo-1",
    name: "Cachimbo Classic",
    description: "Cachimbo tradicional de madeira nobre.",
    price: 349,
    category: "Cachimbos",
    stock: 8,
    image_url:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    name: "Charuto Premium",
    description: "Charuto envelhecido 10 anos.",
    price: 189,
    category: "Charutos",
    stock: 15,
    image_url:
      "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=1200&q=85",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    name: "Fumo Especial",
    description: "Tabaco premium selecionado.",
    price: 89,
    category: "Fumos",
    stock: 20,
    image_url:
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=85",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-4",
    name: "Cigarro Artisan",
    description: "Cigarro artesanal de alta qualidade.",
    price: 129,
    category: "Cigarros",
    stock: 12,
    image_url:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-5",
    name: "Jaqueta Leather",
    description: "Jaqueta de couro premium.",
    price: 599,
    category: "Vestuário",
    stock: 5,
    image_url:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=85",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-6",
    name: "Baralho Luxo",
    description: "Baralho de coleção com acabamento dourado.",
    price: 79,
    category: "Baralhos",
    stock: 25,
    image_url:
      "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=1200&q=85",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-7",
    name: "Isqueiro Premium",
    description: "Isqueiro de alta qualidade.",
    price: 149,
    category: "Acessórios",
    stock: 10,
    image_url:
      "https://images.unsplash.com/photo-1615664245123-6a8e19d5d4e5?auto=format&fit=crop&w=1200&q=85",
    created_at: new Date().toISOString(),
  },
];

export async function getProducts(): Promise<Product[]> {
  noStore();

  try {
    const products = await sql`
      SELECT * FROM products
      ORDER BY created_at DESC
    `;

    return products.length > 0 ? (products as Product[]) : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
}
