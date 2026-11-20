"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth";
import { sql } from "@/lib/db";

export type NeighborhoodActionResult = {
  success: boolean;
  error?: string;
  isSessionExpired?: boolean;
};

async function checkAdmin(): Promise<NeighborhoodActionResult | null> {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return {
      success: false,
      error: "Sua sessão expirou. Entre novamente no painel.",
      isSessionExpired: true,
    };
  }
  return null;
}

function getNumber(formData: FormData, key: string) {
  const raw = String(formData.get(key) || "0").replace(",", ".");
  return Number(raw);
}

async function ensureNeighborhoodsTable() {
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
}

function revalidateNeighborhoodRoutes() {
  try {
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/bairros");
  } catch {
    // Ignora falha de revalidação
  }
}

export async function createNeighborhood(formData: FormData): Promise<NeighborhoodActionResult> {
  const authErr = await checkAdmin();
  if (authErr) return authErr;

  try {
    await ensureNeighborhoodsTable();

    await sql`
      INSERT INTO neighborhoods (id, name, delivery_fee, is_active, sort_order)
      VALUES (
        ${crypto.randomUUID()},
        ${String(formData.get("name") || "").trim()},
        ${getNumber(formData, "delivery_fee")},
        ${String(formData.get("is_active") || "true") === "true"},
        ${Math.max(0, Math.round(getNumber(formData, "sort_order")))}
      )
    `;

    revalidateNeighborhoodRoutes();
    return { success: true };
  } catch (err: unknown) {
    console.error("Erro ao criar bairro:", err);
    return { success: false, error: "Não foi possível salvar o bairro. Verifique se o nome já existe." };
  }
}

export async function updateNeighborhood(formData: FormData): Promise<NeighborhoodActionResult> {
  const authErr = await checkAdmin();
  if (authErr) return authErr;

  try {
    await ensureNeighborhoodsTable();
    const id = String(formData.get("id") || "");

    await sql`
      UPDATE neighborhoods
      SET
        name = ${String(formData.get("name") || "").trim()},
        delivery_fee = ${getNumber(formData, "delivery_fee")},
        is_active = ${String(formData.get("is_active") || "true") === "true"},
        sort_order = ${Math.max(0, Math.round(getNumber(formData, "sort_order")))}
      WHERE id = ${id}
    `;

    revalidateNeighborhoodRoutes();
    return { success: true };
  } catch (err: unknown) {
    console.error("Erro ao atualizar bairro:", err);
    return { success: false, error: "Não foi possível atualizar o bairro." };
  }
}

export async function deleteNeighborhood(formData: FormData) {
  const authErr = await checkAdmin();
  if (authErr) return;

  try {
    await ensureNeighborhoodsTable();
    const id = String(formData.get("id") || "");

    await sql`
      DELETE FROM neighborhoods
      WHERE id = ${id}
    `;

    revalidateNeighborhoodRoutes();
  } catch (err) {
    console.error("Erro ao excluir bairro:", err);
  }
}

export async function toggleNeighborhoodActive(formData: FormData) {
  const authErr = await checkAdmin();
  if (authErr) return;

  try {
    await ensureNeighborhoodsTable();
    const id = String(formData.get("id") || "");
    const isActive = String(formData.get("is_active") || "false") === "true";

    await sql`
      UPDATE neighborhoods
      SET is_active = ${!isActive}
      WHERE id = ${id}
    `;

    revalidateNeighborhoodRoutes();
  } catch (err) {
    console.error("Erro ao alternar status do bairro:", err);
  }
}
