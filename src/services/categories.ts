import { unstable_noStore as noStore } from "next/cache";
import { sql } from "@/lib/db";
import { categories as defaultCategories } from "@/types/product";
import type { Category, CategoryWithChildren } from "@/types/category";

let isCategoriesTableEnsured = false;

export async function ensureCategoriesTable() {
  if (isCategoriesTableEnsured) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
        slug TEXT UNIQUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;
    `;

    // Coluna da vitrine "ITENS". Na primeira vez, só as categorias principais
    // ficam ligadas (mantém a loja igual a antes até a dona mexer).
    const galleryCol = await sql`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'categories' AND column_name = 'show_in_gallery'
    `;
    if (galleryCol.length === 0) {
      await sql`
        ALTER TABLE categories ADD COLUMN IF NOT EXISTS show_in_gallery BOOLEAN NOT NULL DEFAULT FALSE;
      `;
    }

    await sql`
      CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order ASC)
    `;

    // Verify if table has categories. If 0, seed default categories.
    const countResult = await sql`SELECT COUNT(*)::int as count FROM categories`;
    const count = countResult[0]?.count || 0;

    if (count === 0) {
      let index = 0;
      for (const catName of defaultCategories) {
        const id = crypto.randomUUID();
        const slug = catName
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");

        await sql`
          INSERT INTO categories (id, name, parent_id, slug, sort_order)
          VALUES (${id}, ${catName}, NULL, ${slug}, ${index})
          ON CONFLICT (slug) DO NOTHING
        `;
        index++;
      }
    }
    isCategoriesTableEnsured = true;
  } catch (error) {
    console.error("Erro ao verificar/criar tabela de categorias:", error);
  }
}

export async function getCategories(): Promise<CategoryWithChildren[]> {
  noStore();

  try {
    await ensureCategoriesTable();

    const rows = (await sql`
      SELECT id, name, parent_id, slug, sort_order, image_url, show_in_gallery, created_at
      FROM categories
      ORDER BY sort_order ASC, name ASC
    `) as Category[];

    // Build hierarchical tree
    const categoryMap = new Map<string, CategoryWithChildren>();
    const rootCategories: CategoryWithChildren[] = [];

    rows.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    rows.forEach((cat) => {
      const node = categoryMap.get(cat.id);
      if (!node) return;

      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        categoryMap.get(cat.parent_id)!.children.push(node);
      } else {
        rootCategories.push(node);
      }
    });

    return rootCategories;
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }
}

export async function getAllFlatCategories(): Promise<Category[]> {
  noStore();

  try {
    await ensureCategoriesTable();

    const rows = (await sql`
      SELECT id, name, parent_id, slug, sort_order, image_url, show_in_gallery, created_at
      FROM categories
      ORDER BY name ASC
    `) as Category[];

    return rows;
  } catch (error) {
    console.error("Erro ao buscar lista de categorias:", error);
    return [];
  }
}
