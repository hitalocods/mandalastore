import { unstable_noStore as noStore } from "next/cache";
import type { Product } from "@/types/product";
import { sql } from "@/lib/db";
import { toCanonicalCategory } from "@/lib/utils";

export async function getProducts(): Promise<Product[]> {
  noStore();

  try {
    const products = await sql`
      SELECT * FROM products
      ORDER BY created_at DESC
    `;

    const normalizedProducts = (products as Product[]).map((product) => ({
      ...product,
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      category: toCanonicalCategory(product.category) || product.category,
    }));

    return normalizedProducts;
  } catch {
    return [];
  }
}
