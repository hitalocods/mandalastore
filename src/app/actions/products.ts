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

export async function createProduct(formData: FormData) {
  await assertAdmin();
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes TEXT;`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS colors TEXT;`;
  const imageUrl = await uploadImage(formData.get("image") as File | null);
  const sizes = getSizes(formData);
  const colors = getColors(formData);

  await sql`
    INSERT INTO products (id, name, description, price, category, stock, image_url, sizes, colors)
    VALUES (
      ${crypto.randomUUID()},
      ${String(formData.get("name") || "")},
      ${String(formData.get("description") || "")},
      ${getNumber(formData, "price")},
      ${getCategory(formData)},
      ${Math.max(0, Math.round(getNumber(formData, "stock")))},
      ${imageUrl},
      ${sizes},
      ${colors}
    )
  `;

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateProduct(formData: FormData) {
  await assertAdmin();
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes TEXT;`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS colors TEXT;`;
  const id = String(formData.get("id") || "");
  const currentImage = String(formData.get("current_image_url") || "");
  const imageFile = formData.get("image") as File | null;

  let imageUrl = currentImage || null;

  if (imageFile && imageFile.size > 0) {
    const uploadedUrl = await uploadImage(imageFile);
    if (uploadedUrl) {
      imageUrl = uploadedUrl;
      if (currentImage) {
        await deleteImageFromCloudinary(currentImage);
      }
    }
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
      image_url = ${imageUrl},
      sizes = ${sizes},
      colors = ${colors}
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
      SELECT image_url FROM products WHERE id = ${id}
    `;

    if (result.length > 0 && result[0].image_url) {
      await deleteImageFromCloudinary(result[0].image_url as string);
    }
  } catch (err) {
    console.error("Erro ao buscar imagem para exclusão:", err);
  }

  await sql`
    DELETE FROM products
    WHERE id = ${id}
  `;

  revalidatePath("/");
  revalidatePath("/admin");
}
