import { unstable_noStore as noStore } from "next/cache";
import type { Neighborhood } from "@/types/neighborhood";
import { sql } from "@/lib/db";

export async function getNeighborhoods(): Promise<Neighborhood[]> {
  noStore();

  try {
    const neighborhoods = await sql`
      SELECT * FROM neighborhoods
      ORDER BY sort_order ASC, name ASC
    `;

    return neighborhoods as Neighborhood[];
  } catch {
    return [];
  }
}

export async function getActiveNeighborhoods(): Promise<Neighborhood[]> {
  noStore();

  try {
    const neighborhoods = await sql`
      SELECT * FROM neighborhoods
      WHERE is_active = true
      ORDER BY sort_order ASC, name ASC
    `;

    return neighborhoods as Neighborhood[];
  } catch {
    return [];
  }
}

export async function getNeighborhoodById(id: string): Promise<Neighborhood | null> {
  noStore();

  try {
    const neighborhoods = await sql`
      SELECT * FROM neighborhoods
      WHERE id = ${id}
    `;

    return neighborhoods[0] as Neighborhood || null;
  } catch {
    return null;
  }
}
