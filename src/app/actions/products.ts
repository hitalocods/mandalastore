"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/lib/cloudinary";
import { sql } from "@/lib/db";

export type ProductActionResult = {
  success: boolean;
  error?: string;
  isSessionExpired?: boolean;
};

async function checkAdmin(): Promise<ProductActionResult | null> {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return {
      success: false,
      error: "Sua sessão de administrador expirou. Por favor, entre novamente com seu e-mail e senha.",
      isSessionExpired: true,
    };
  }
  return null;
}

function getNumber(formData: FormData, key: string) {
  const raw = String(formData.get(key) || "0").replace(",", ".");
  return Number(raw);
}

function getCategory(formData: FormData): string {
  const category = String(formData.get("category") || "").trim();
  return category || "Acessórios";
}

function getSizes(formData: FormData): string | null {
  const sizes = String(formData.get("sizes") || "").trim();
  return sizes || null;
}

function getColors(formData: FormData): string | null {
  const colors = String(formData.get("colors") || "").trim();
  return colors || null;
}

async function uploadImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) {
    return null;
  }
  return await uploadImageToCloudinary(file);
}

async function uploadMultipleImages(files: File[]): Promise<string[]> {
  const validFiles = files.filter((f) => f && f.size > 0);
  if (validFiles.length === 0) return [];

  const uploadPromises = validFiles.map((file) => uploadImage(file));
  const results = await Promise.all(uploadPromises);
  return results.filter((url): url is string => Boolean(url));
}

export async function createProduct(formData: FormData): Promise<ProductActionResult> {
  const authErr = await checkAdmin();
  if (authErr) return authErr;

  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes TEXT;`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS colors TEXT;`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT;`;

    // Collect all files from "images" and "image" fields
    const imageFiles = [
      ...(formData.getAll("images") as File[]),
      (formData.get("image") as File | null),
    ].filter((f): f is File => Boolean(f && f.size > 0));

    let uploadedUrls: string[] = [];
    if (imageFiles.length > 0) {
      try {
        uploadedUrls = await uploadMultipleImages(imageFiles);
      } catch (uploadError: unknown) {
        const msg = (uploadError as Error)?.message || "Falha ao enviar fotos para o Cloudinary.";
        return {
          success: false,
          error: `Erro no upload da foto: ${msg}`,
        };
      }
    }

    const mainImageUrl = uploadedUrls[0] || null;
    const allImagesStr = uploadedUrls.length > 0 ? uploadedUrls.join(",") : null;

    const sizes = getSizes(formData);
    const colors = getColors(formData);

    await sql`
      INSERT INTO products (id, name, description, price, category, stock, image_url, sizes, colors, images)
      VALUES (
        ${crypto.randomUUID()},
        ${String(formData.get("name") || "")},
        ${String(formData.get("description") || "")},
        ${getNumber(formData, "price")},
        ${getCategory(formData)},
        ${Math.max(0, Math.round(getNumber(formData, "stock")))},
        ${mainImageUrl},
        ${sizes},
        ${colors},
        ${allImagesStr}
      )
    `;

    try {
      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath("/admin/produtos");
    } catch {
      // Ignora falha de revalidação de rota
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Erro em createProduct:", error);
    const msg = (error as Error)?.message || "Não foi possível cadastrar o produto.";
    return { success: false, error: `Erro no servidor: ${msg}` };
  }
}

export async function updateProduct(formData: FormData): Promise<ProductActionResult> {
  const authErr = await checkAdmin();
  if (authErr) return authErr;

  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes TEXT;`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS colors TEXT;`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT;`;

    const id = String(formData.get("id") || "");
    if (!id) {
      return { success: false, error: "Identificador do produto não foi informado." };
    }

    // Kept existing images (sent as comma separated or single string)
    const existingImagesRaw = String(formData.get("existing_images") || "");
    const currentImageLegacy = String(formData.get("current_image_url") || "");

    let keptImages: string[] = [];
    if (existingImagesRaw) {
      keptImages = existingImagesRaw.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (currentImageLegacy) {
      keptImages = [currentImageLegacy];
    }

    // Upload new image files
    const newFiles = [
      ...(formData.getAll("images") as File[]),
      (formData.get("image") as File | null),
    ].filter((f): f is File => Boolean(f && f.size > 0));

    let newlyUploadedUrls: string[] = [];
    if (newFiles.length > 0) {
      try {
        newlyUploadedUrls = await uploadMultipleImages(newFiles);
      } catch (uploadError: unknown) {
        const msg = (uploadError as Error)?.message || "Falha ao enviar fotos para o Cloudinary.";
        return {
          success: false,
          error: `Erro no upload da foto: ${msg}`,
        };
      }
    }

    const finalImagesList = [...keptImages, ...newlyUploadedUrls];
    const mainImageUrl = finalImagesList[0] || null;
    const allImagesStr = finalImagesList.length > 0 ? finalImagesList.join(",") : null;

    // Cleanup removed images from Cloudinary em background seguro
    try {
      const oldProduct = await sql`SELECT image_url, images FROM products WHERE id = ${id}`;
      if (oldProduct.length > 0) {
        const oldImages: string[] = [];
        if (oldProduct[0].image_url) oldImages.push(oldProduct[0].image_url as string);
        if (oldProduct[0].images) {
          (oldProduct[0].images as string).split(",").forEach((url) => {
            const trimmed = url.trim();
            if (trimmed && !oldImages.includes(trimmed)) oldImages.push(trimmed);
          });
        }

        for (const oldUrl of oldImages) {
          if (!finalImagesList.includes(oldUrl)) {
            await deleteImageFromCloudinary(oldUrl).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.error("Erro ao verificar imagens antigas para exclusão:", err);
    }

    const sizes = getSizes(formData);
    const colors = getColors(formData);

    await sql`
      UPDATE products
      SET
        name = ${String(formData.get("name") || "")},
        description = ${String(formData.get("description") || "")},
        price = ${getNumber(formData, "price")},
        category = ${getCategory(formData)},
        stock = ${Math.max(0, Math.round(getNumber(formData, "stock")))},
        image_url = ${mainImageUrl},
        sizes = ${sizes},
        colors = ${colors},
        images = ${allImagesStr}
      WHERE id = ${id}
    `;

    try {
      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath("/admin/produtos");
    } catch {
      // Ignora erro de revalidação de rota
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Erro em updateProduct:", error);
    const msg = (error as Error)?.message || "Não foi possível atualizar o produto.";
    return { success: false, error: `Erro no servidor: ${msg}` };
  }
}

export async function deleteProduct(formData: FormData): Promise<ProductActionResult> {
  const authErr = await checkAdmin();
  if (authErr) return authErr;

  const id = String(formData.get("id") || "");
  if (!id) {
    return { success: false, error: "ID do produto ausente." };
  }

  try {
    const result = await sql`
      SELECT image_url, images FROM products WHERE id = ${id}
    `;

    if (result.length > 0) {
      const urlsToDelete: string[] = [];
      if (result[0].image_url) urlsToDelete.push(result[0].image_url as string);
      if (result[0].images) {
        (result[0].images as string).split(",").forEach((url) => {
          const trimmed = url.trim();
          if (trimmed && !urlsToDelete.includes(trimmed)) urlsToDelete.push(trimmed);
        });
      }

      for (const url of urlsToDelete) {
        await deleteImageFromCloudinary(url).catch(() => {});
      }
    }

    await sql`
      DELETE FROM products
      WHERE id = ${id}
    `;

    try {
      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath("/admin/produtos");
    } catch {
      // Ignora erro de revalidação
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("Erro ao deletar produto:", err);
    return { success: false, error: "Não foi possível remover o produto." };
  }
}
