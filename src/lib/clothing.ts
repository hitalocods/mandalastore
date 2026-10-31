import type { CategoryWithChildren } from "@/types/category";
import type { Product } from "@/types/product";

/**
 * Palavras-chave que identificam produtos ou categorias de vestuário / roupas.
 */
const CLOTHING_KEYWORDS = [
  "vestuario",
  "vestuário",
  "roupa",
  "roupas",
  "moda",
  "saia",
  "saias",
  "bata",
  "batas",
  "conjunto",
  "conjuntos",
  "vestido",
  "vestidos",
  "camisa",
  "camisas",
  "camisete",
  "calca",
  "calça",
  "calcas",
  "calças",
  "pano da costa",
  "panos da costa",
  "oja",
  "ojá",
  "ojas",
  "ojás",
  "turbante",
  "turbantes",
  "bombacha",
  "bombachas",
];

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function isClothingCategoryName(categoryName?: string | null): boolean {
  if (!categoryName) return false;
  const normalized = normalizeText(categoryName);

  if (
    normalized.includes("vestuario") ||
    normalized.includes("roupa") ||
    normalized.includes("moda")
  ) {
    return true;
  }

  const words = normalized.split(/[\s,/-]+/);
  return words.some((word) =>
    CLOTHING_KEYWORDS.some((kw) => {
      const normKw = normalizeText(kw);
      return word === normKw || word === `${normKw}s` || `${word}s` === normKw;
    })
  );
}

export function getClothingCategoryNames(categoriesTree: CategoryWithChildren[] = []): Set<string> {
  const clothingSet = new Set<string>();

  function traverse(node: CategoryWithChildren, isParentClothing: boolean) {
    const isSelfClothing = isParentClothing || isClothingCategoryName(node.name) || isClothingCategoryName(node.slug);

    if (isSelfClothing) {
      clothingSet.add(normalizeText(node.name));
      if (node.slug) {
        clothingSet.add(normalizeText(node.slug));
      }
    }

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        traverse(child, isSelfClothing);
      }
    }
  }

  for (const root of categoriesTree) {
    traverse(root, false);
  }

  return clothingSet;
}

export function isClothingProduct(
  product: Product,
  clothingCategorySet?: Set<string>
): boolean {
  const normCategory = normalizeText(product.category || "");

  if (clothingCategorySet && clothingCategorySet.has(normCategory)) {
    return true;
  }

  return isClothingCategoryName(product.category);
}

import type { StoreMode, CatalogTopicId } from "@/lib/catalog-topics";
export type { StoreMode, CatalogTopicId };

export function filterProductsByMode(
  products: Product[],
  categoriesTree: CategoryWithChildren[] = [],
  mode: StoreMode = "all"
): Product[] {
  if (mode === "all") return products;

  const clothingSet = getClothingCategoryNames(categoriesTree);

  if (mode === "roupas") {
    return products.filter((p) => isClothingProduct(p, clothingSet));
  }

  return products.filter((p) => !isClothingProduct(p, clothingSet));
}

export function filterCategoriesTreeByMode(
  categoriesTree: CategoryWithChildren[] = [],
  mode: StoreMode = "all"
): CategoryWithChildren[] {
  if (mode === "all") return categoriesTree;

  const clothingSet = getClothingCategoryNames(categoriesTree);

  function filterNode(node: CategoryWithChildren): CategoryWithChildren | null {
    const isClothing = clothingSet.has(normalizeText(node.name)) || isClothingCategoryName(node.name);

    if (mode === "roupas") {
      if (isClothing) return node;

      const filteredChildren = (node.children || [])
        .map(filterNode)
        .filter((c): c is CategoryWithChildren => c !== null);

      if (filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      return null;
    }

    // mode === "artigos"
    if (isClothing) return null;

    const filteredChildren = (node.children || [])
      .map(filterNode)
      .filter((c): c is CategoryWithChildren => c !== null);

    return { ...node, children: filteredChildren };
  }

  return categoriesTree
    .map(filterNode)
    .filter((c): c is CategoryWithChildren => c !== null);
}
