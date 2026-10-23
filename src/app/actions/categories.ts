"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ensureCategoriesTable } from "@/services/categories";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export type CategoryActionResult = {
  success: boolean;
  message: string;
  isSessionExpired?: boolean;
};

const SESSION_EXPIRED: CategoryActionResult = {
  success: false,
  message: "Sua sessão expirou. Entre novamente no painel.",
  isSessionExpired: true,
};

/** Retorna erro de sessão (em vez de lançar exceção, que quebrava a tela do painel). */
async function checkAdmin(): Promise<CategoryActionResult | null> {
  const isAdmin = await isAdminAuthenticated();
  return isAdmin ? null : SESSION_EXPIRED;
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/categorias");
}

async function uploadCategoryImage(file: File | null): Promise<{ url?: string; error?: string }> {
  if (!file || file.size === 0) return {};
  try {
    return { url: await uploadImageToCloudinary(file) };
  } catch (err) {
    console.error("Erro ao enviar foto da categoria:", err);
    return { error: "Não foi possível enviar a foto. Tente uma imagem menor ou outro formato." };
  }
}

export async function createCategory(formData: FormData): Promise<CategoryActionResult> {
  const authErr = await checkAdmin();
  if (authErr) return authErr;
  await ensureCategoriesTable();

  const name = String(formData.get("name") || "").trim();
  const parentIdRaw = String(formData.get("parent_id") || "").trim();
  const parentId = parentIdRaw && parentIdRaw !== "none" ? parentIdRaw : null;

  if (!name) {
    return { success: false, message: "Nome da categoria é obrigatório." };
  }

  const upload = await uploadCategoryImage(formData.get("image") as File | null);
  if (upload.error) return { success: false, message: upload.error };
  const imageUrl = upload.url ?? null;

  const slugBase = name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  const id = crypto.randomUUID();
  const slug = `${slugBase}-${id.substring(0, 5)}`;

  try {
    // Nova categoria entra no final da lista (antes entrava com ordem 0 e "pulava" pra frente)
    const maxRes = await sql`SELECT COALESCE(MAX(sort_order), -1)::int AS max FROM categories`;
    const sortOrder = Number(maxRes[0]?.max ?? -1) + 1;

    await sql`
      INSERT INTO categories (id, name, parent_id, slug, sort_order, image_url, show_in_gallery)
      VALUES (${id}, ${name}, ${parentId}, ${slug}, ${sortOrder}, ${imageUrl}, FALSE)
    `;

    revalidateAll();
    return { success: true, message: "Categoria criada com sucesso!" };
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return { success: false, message: "Erro ao criar categoria." };
  }
}

export async function updateCategory(formData: FormData): Promise<CategoryActionResult> {
  const authErr = await checkAdmin();
  if (authErr) return authErr;
  await ensureCategoriesTable();

  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const parentIdRaw = String(formData.get("parent_id") || "").trim();
  const parentId = parentIdRaw && parentIdRaw !== "none" && parentIdRaw !== id ? parentIdRaw : null;

  if (!id || !name) {
    return { success: false, message: "ID e Nome são obrigatórios." };
  }

  // undefined = não mexer na foto | null = remover foto | string = nova foto
  let newImageUrl: string | null | undefined = undefined;
  const upload = await uploadCategoryImage(formData.get("image") as File | null);
  if (upload.error) return { success: false, message: upload.error };
  if (upload.url) {
    newImageUrl = upload.url;
  } else if (formData.has("image_url")) {
    const rawUrl = String(formData.get("image_url") || "").trim();
    newImageUrl = rawUrl || null;
  }

  try {
    // OBS: sort_order NÃO é alterado aqui (antes era zerado a cada edição, bagunçando a ordem)
    if (newImageUrl !== undefined) {
      await sql`
        UPDATE categories
        SET name = ${name}, parent_id = ${parentId}, image_url = ${newImageUrl}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE categories
        SET name = ${name}, parent_id = ${parentId}
        WHERE id = ${id}
      `;
    }

    revalidateAll();
    return { success: true, message: "Categoria atualizada com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return { success: false, message: "Erro ao atualizar categoria." };
  }
}

export async function deleteCategory(formData: FormData): Promise<CategoryActionResult> {
  const authErr = await checkAdmin();
  if (authErr) return authErr;
  await ensureCategoriesTable();

  const id = String(formData.get("id") || "").trim();
  if (!id) {
    return { success: false, message: "ID da categoria inválido." };
  }

  try {
    await sql`DELETE FROM categories WHERE id = ${id}`;
    revalidateAll();
    return { success: true, message: "Categoria excluída com sucesso!" };
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return { success: false, message: "Erro ao excluir categoria." };
  }
}

/** Liga/desliga a exibição da categoria na faixa "ITENS" da página inicial. */
export async function toggleCategoryGallery(id: string, show: boolean): Promise<CategoryActionResult> {
  const authErr = await checkAdmin();
  if (authErr) return authErr;
  await ensureCategoriesTable();

  if (!id) return { success: false, message: "Categoria inválida." };

  try {
    await sql`UPDATE categories SET show_in_gallery = ${show} WHERE id = ${id}`;
    revalidateAll();
    return {
      success: true,
      message: show ? "Agora aparece em ITENS na loja." : "Removida de ITENS na loja.",
    };
  } catch (error) {
    console.error("Erro ao alterar destaque da categoria:", error);
    return { success: false, message: "Erro ao alterar destaque." };
  }
}

/**
 * Move a categoria uma posição para cima/baixo entre as "irmãs"
 * (mesma categoria pai). Reorganiza as posições de forma sequencial
 * para corrigir empates antigos (várias com ordem 0).
 */
export async function moveCategory(id: string, direction: "up" | "down"): Promise<CategoryActionResult> {
  const authErr = await checkAdmin();
  if (authErr) return authErr;
  await ensureCategoriesTable();

  try {
    const current = await sql`SELECT id, parent_id FROM categories WHERE id = ${id}`;
    if (current.length === 0) return { success: false, message: "Categoria não encontrada." };
    const parentId = current[0].parent_id as string | null;

    const siblings = (parentId
      ? await sql`SELECT id FROM categories WHERE parent_id = ${parentId} ORDER BY sort_order ASC, name ASC`
      : await sql`SELECT id FROM categories WHERE parent_id IS NULL ORDER BY sort_order ASC, name ASC`) as {
      id: string;
    }[];

    const ids = siblings.map((s) => s.id);
    const index = ids.indexOf(id);
    const target = direction === "up" ? index - 1 : index + 1;

    if (index === -1 || target < 0 || target >= ids.length) {
      return { success: true, message: "Já está na ponta da lista." };
    }

    [ids[index], ids[target]] = [ids[target], ids[index]];

    for (let i = 0; i < ids.length; i++) {
      await sql`UPDATE categories SET sort_order = ${i} WHERE id = ${ids[i]}`;
    }

    revalidateAll();
    return { success: true, message: "Ordem atualizada." };
  } catch (error) {
    console.error("Erro ao reordenar categoria:", error);
    return { success: false, message: "Erro ao reordenar." };
  }
}
