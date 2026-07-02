import { unstable_noStore as noStore } from "next/cache";
import type { Product } from "@/types/product";
import { sql } from "@/lib/db";

export async function getProducts(): Promise<Product[]> {
  noStore();

  try {
    const products = await sql`
      SELECT * FROM products
      ORDER BY created_at DESC
    `;

    return products as Product[];
  } catch {
    return [];
  }
}
