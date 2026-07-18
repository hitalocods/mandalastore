"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ensureCategoriesTable } from "@/services/categories";

async function assertAdmin() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    redirect("/admin/login");
  }
}

export async function createCategory(formData: FormData) {
  await assertAdmin();
  await ensureCategoriesTable();

  const name = String(formData.get("name") || "").trim();
  const parentIdRaw = String(formData.get("parent_id") || "").trim();
  const parentId = parentIdRaw && parentIdRaw !== "none" ? parentIdRaw : null;
  const sortOrder = Number(formData.get("sort_order") || 0);

  if (!name) {
    return { success: false, message: "Nome da categoria é obrigatório." };
  }

  const slugBase = name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  const id = crypto.randomUUID();
  const slug = `${slugBase}-${id.substring(0, 5)}`;

  try {
    await sql`
      INSERT INTO categories (id, name, parent_id, slug, sort_order)
      VALUES (${id}, ${name}, ${parentId}, ${slug}, ${sortOrder})
    `;

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, message: "Categoria criada com sucesso!" };
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return { success: false, message: "Erro ao criar categoria." };
  }
}

export async function updateCategory(formData: FormData) {
  await assertAdmin();
  await ensureCategoriesTable();

  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const parentIdRaw = String(formData.get("parent_id") || "").trim();
  const parentId = parentIdRaw && parentIdRaw !== "none" && parentIdRaw !== id ? parentIdRaw : null;
  const sortOrder = Number(formData.get("sort_order") || 0);

  if (!id || !name) {
    return { success: false, message: "ID e Nome são obrigatórios." };
  }

  try {
    await sql`
      UPDATE categories
      SET
        name = ${name},
        parent_id = ${parentId},
        sort_order = ${sortOrder}
      WHERE id = ${id}
    `;

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, message: "Categoria atualizada com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return { success: false, message: "Erro ao atualizar categoria." };
  }
}

export async function deleteCategory(formData: FormData) {
  await assertAdmin();
  await ensureCategoriesTable();

  const id = String(formData.get("id") || "").trim();
  if (!id) {
    return { success: false, message: "ID da categoria inválido." };
  }

  try {
    await sql`
      DELETE FROM categories
      WHERE id = ${id}
    `;

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, message: "Categoria removida com sucesso!" };
  } catch (error) {
    console.error("Erro ao remover categoria:", error);
    return { success: false, message: "Erro ao remover categoria." };
  }
}
