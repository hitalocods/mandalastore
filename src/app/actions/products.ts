"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/lib/cloudinary";
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

async function uploadImage(file: File | null) {
  if (!file || file.size === 0) {
    return null;
  }

  const extension = file.name.split(".").pop() || "jpg";
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const renamedFile = new File([file], fileName, { type: file.type });

  return await uploadImageToCloudinary(renamedFile);
}

async function uploadMultipleImages(files: File[]): Promise<string[]> {
  const validFiles = files.filter((f) => f && f.size > 0);
  if (validFiles.length === 0) return [];

  const uploadPromises = validFiles.map((file) => uploadImage(file));
  const results = await Promise.all(uploadPromises);
  return results.filter((url): url is string => Boolean(url));
}

export async function createProduct(formData: FormData) {
  await assertAdmin();
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes TEXT;`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS colors TEXT;`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT;`;

  // Collect all files from "images" and "image" fields
  const imageFiles = [
    ...(formData.getAll("images") as File[]),
    (formData.get("image") as File | null),
  ].filter((f): f is File => Boolean(f && f.size > 0));

  const uploadedUrls = await uploadMultipleImages(imageFiles);
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

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateProduct(formData: FormData) {
  await assertAdmin();
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes TEXT;`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS colors TEXT;`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT;`;

  const id = String(formData.get("id") || "");

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

  const newlyUploadedUrls = await uploadMultipleImages(newFiles);

  const finalImagesList = [...keptImages, ...newlyUploadedUrls];
  const mainImageUrl = finalImagesList[0] || null;
  const allImagesStr = finalImagesList.length > 0 ? finalImagesList.join(",") : null;

  // Cleanup removed images from Cloudinary
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
          await deleteImageFromCloudinary(oldUrl);
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

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteProduct(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") || "");

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
        await deleteImageFromCloudinary(url);
      }
    }
  } catch (err) {
    console.error("Erro ao buscar imagens para exclusão:", err);
  }

  await sql`
    DELETE FROM products
    WHERE id = ${id}
  `;

  revalidatePath("/");
  revalidatePath("/admin");
}
