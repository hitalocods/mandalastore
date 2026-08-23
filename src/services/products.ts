import { unstable_noStore as noStore } from "next/cache";
import type { Product } from "@/types/product";
import { sql } from "@/lib/db";

export async function getProducts(): Promise<Product[]> {
  noStore();

  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes TEXT;`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS colors TEXT;`;

    const products = await sql`
      SELECT * FROM products
      ORDER BY created_at DESC
    `;

    const normalizedProducts = (products as Product[]).map((product) => ({
      ...product,
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      category: product.category || "Acessórios",
      sizes: product.sizes || null,
      colors: product.colors || null,
    }));

    return normalizedProducts;
  } catch {
    return [];
  }
}
