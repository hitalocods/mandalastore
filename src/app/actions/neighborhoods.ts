"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { sql } from "@/lib/db";

async function assertAdmin() {
  const isAdmin = await isAdminAuthenticated();

  if (!isAdmin) {
    redirect("/admin/login");
  }
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
  revalidatePath("/admin");
  revalidatePath("/admin/bairros");
}

export async function createNeighborhood(formData: FormData) {
  await assertAdmin();
  await ensureNeighborhoodsTable();

  await sql`
    INSERT INTO neighborhoods (id, name, delivery_fee, is_active, sort_order)
    VALUES (
      ${crypto.randomUUID()},
      ${String(formData.get("name") || "")},
      ${getNumber(formData, "delivery_fee")},
      ${String(formData.get("is_active") || "true") === "true"},
      ${Math.max(0, Math.round(getNumber(formData, "sort_order")))}
    )
  `;

  revalidateNeighborhoodRoutes();
}

export async function updateNeighborhood(formData: FormData) {
  await assertAdmin();
  await ensureNeighborhoodsTable();
  const id = String(formData.get("id") || "");

  await sql`
    UPDATE neighborhoods
    SET
      name = ${String(formData.get("name") || "")},
      delivery_fee = ${getNumber(formData, "delivery_fee")},
      is_active = ${String(formData.get("is_active") || "true") === "true"},
      sort_order = ${Math.max(0, Math.round(getNumber(formData, "sort_order")))}
    WHERE id = ${id}
  `;

  revalidateNeighborhoodRoutes();
}

export async function deleteNeighborhood(formData: FormData) {
  await assertAdmin();
  await ensureNeighborhoodsTable();
  const id = String(formData.get("id") || "");

  await sql`
    DELETE FROM neighborhoods
    WHERE id = ${id}
  `;

  revalidateNeighborhoodRoutes();
}

export async function toggleNeighborhoodActive(formData: FormData) {
  await assertAdmin();
  await ensureNeighborhoodsTable();
  const id = String(formData.get("id") || "");
  const isActive = String(formData.get("is_active") || "false") === "true";

  await sql`
    UPDATE neighborhoods
    SET is_active = ${!isActive}
    WHERE id = ${id}
  `;

  revalidateNeighborhoodRoutes();
}
