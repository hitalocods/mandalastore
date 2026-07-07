"use server";

import { sql } from "@/lib/db";

export async function setupNeighborhoodsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS neighborhoods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_neighborhoods_sort_order ON neighborhoods(sort_order ASC)
    `;

    return { success: true, message: "Tabela de bairros criada com sucesso!" };
  } catch (error) {
    console.error("Erro ao criar tabela de bairros:", error);
    return { success: false, message: "Erro ao criar tabela de bairros" };
  }
}
