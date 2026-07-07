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

export async function createNeighborhood(formData: FormData) {
  await assertAdmin();

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

  revalidatePath("/admin");
}

export async function updateNeighborhood(formData: FormData) {
  await assertAdmin();
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

  revalidatePath("/admin");
}

export async function deleteNeighborhood(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") || "");

  await sql`
    DELETE FROM neighborhoods
    WHERE id = ${id}
  `;

  revalidatePath("/admin");
}

export async function toggleNeighborhoodActive(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") || "");
  const isActive = String(formData.get("is_active") || "false") === "true";

  await sql`
    UPDATE neighborhoods
    SET is_active = ${!isActive}
    WHERE id = ${id}
  `;

  revalidatePath("/admin");
}
