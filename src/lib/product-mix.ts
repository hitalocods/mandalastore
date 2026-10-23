import type { Product } from "@/types/product";

/**
 * Agrupa os produtos por categoria e intercala-os de forma inteligente (round-robin),
 * garantindo uma vitrine rica e sortida ("mix de itens") na rolagem da página inicial,
 * em vez de exibir vários produtos iguais recém-cadastrados em sequência.
 */
export function mixProducts(products: Product[]): Product[] {
  if (!products || products.length <= 1) return products;

  // Agrupa por categoria
  const groups: Record<string, Product[]> = {};
  for (const product of products) {
    const cat = (product.category || "Geral").trim();
    if (!groups[cat]) {
      groups[cat] = [];
    }
    groups[cat].push(product);
  }

  const categoryKeys = Object.keys(groups);
  const mixed: Product[] = [];

  let maxCount = 0;
  for (const cat of categoryKeys) {
    if (groups[cat].length > maxCount) {
      maxCount = groups[cat].length;
    }
  }

  // Intercala um produto de cada categoria a cada volta
  for (let i = 0; i < maxCount; i++) {
    for (const cat of categoryKeys) {
      if (i < groups[cat].length) {
        mixed.push(groups[cat][i]);
      }
    }
  }

  return mixed;
}
