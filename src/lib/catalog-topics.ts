import type { CategoryWithChildren } from "@/types/category";
import type { Product } from "@/types/product";

export type CatalogTopicId = "imagens" | "vestuario" | "produtos";

export type StoreMode = "all" | "imagens" | "vestuario" | "produtos" | "roupas" | "artigos";

export interface CatalogTopicConfig {
  id: CatalogTopicId;
  title: string;
  subtitle: string;
  categories: string[];
}

export const CATALOG_TOPICS: Record<CatalogTopicId, CatalogTopicConfig> = {
  imagens: {
    id: "imagens",
    title: "Imagens Religiosas",
    subtitle: "Católicas, Umbanda, batismo e livros",
    categories: ["Imagens Católicas", "Imagens Umbanda", "Material De Batismo", "Livros"],
  },
  vestuario: {
    id: "vestuario",
    title: "Vestuário Sagrado de Axé",
    subtitle: "Roupas, guias, chapéus e acessórios",
    categories: ["Vestuários", "Chapéu", "Bengala", "Guias", "Bijuterias e Semi-Jóia"],
  },
  produtos: {
    id: "produtos",
    title: "Produtos Religiosos",
    subtitle: "Velas, ervas, incensos, rituais e mais",
    categories: [
      "Velas",
      "Ervas / Defumadores",
      "Incensos e Defumadores",
      "Essências e Óleos",
      "Banhos",
      "Perfumaria",
      "Rituais",
      "Baralho / Tarot",
      "Itens de Barro",
      "Itens de Louça",
      "Taças e Copos Personalizadas",
      "Tabacaria",
      "Bebidas",
    ],
  },
};

export function normalizeText(text: string): string {
  return (text || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Constrói um mapa de busca rápida da raiz para cada categoria/subcategoria da árvore.
 */
function buildCategoryToRootMap(categoriesTree: CategoryWithChildren[] = []): Map<string, string> {
  const map = new Map<string, string>();

  function traverse(node: CategoryWithChildren, rootName: string) {
    map.set(normalizeText(node.name), rootName);
    if (node.slug) {
      map.set(normalizeText(node.slug), rootName);
    }
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        traverse(child, rootName);
      }
    }
  }

  for (const root of categoriesTree) {
    traverse(root, root.name);
  }

  return map;
}

/**
 * Identifica a qual tópico pertence um produto ou categoria.
 */
export function getProductTopic(
  productOrCategory: Product | string,
  categoriesTree: CategoryWithChildren[] = []
): CatalogTopicId | null {
  const categoryName =
    typeof productOrCategory === "string" ? productOrCategory : productOrCategory.category || "";
  const productName =
    typeof productOrCategory === "string" ? "" : productOrCategory.name || "";

  const normCat = normalizeText(categoryName);
  const normProd = normalizeText(productName);

  const rootMap = buildCategoryToRootMap(categoriesTree);
  const rootName = rootMap.get(normCat) || categoryName;
  const normRoot = normalizeText(rootName);

  for (const [key, topic] of Object.entries(CATALOG_TOPICS) as [CatalogTopicId, CatalogTopicConfig][]) {
    for (const cat of topic.categories) {
      const normTarget = normalizeText(cat);
      if (normRoot === normTarget || normCat === normTarget) {
        return key;
      }
    }
  }

  // Fallback para variações e casos especiais
  if (
    normCat.includes("banho") ||
    normCat.includes("litro") ||
    normCat.includes("200 ml") ||
    normCat.includes("500 ml") ||
    normProd.includes("banho")
  ) {
    return "produtos";
  }

  if (
    normCat.includes("vestuario") ||
    normCat.includes("roupa") ||
    normCat.includes("saia") ||
    normCat.includes("bata") ||
    normCat.includes("feminino") ||
    normCat.includes("masculino")
  ) {
    return "vestuario";
  }

  if (
    normCat.includes("imagem") ||
    normCat.includes("livro") ||
    normCat.includes("batismo") ||
    normProd.includes("imagem")
  ) {
    return "imagens";
  }

  return null;
}

/**
 * Conta os produtos de cada tópico a partir da lista real de produtos do banco.
 */
export function computeTopicCounts(
  products: Product[],
  categoriesTree: CategoryWithChildren[] = []
): Record<CatalogTopicId, number> {
  const counts: Record<CatalogTopicId, number> = {
    imagens: 0,
    vestuario: 0,
    produtos: 0,
  };

  for (const product of products) {
    const topic = getProductTopic(product, categoriesTree);
    if (topic && counts[topic] !== undefined) {
      counts[topic]++;
    }
  }

  return counts;
}

/**
 * Filtra produtos de acordo com o modo selecionado ("all", "imagens", "vestuario", "produtos", etc).
 */
export function filterProductsByTopicMode(
  products: Product[],
  categoriesTree: CategoryWithChildren[] = [],
  mode: StoreMode = "all"
): Product[] {
  if (mode === "all") return products;

  // Suporte a compatibilidade com rotas legadas
  const targetTopic: CatalogTopicId | null =
    mode === "roupas" ? "vestuario" : mode === "artigos" ? null : mode;

  if (mode === "artigos") {
    // Modo legado artigos: tudo que não é vestuário
    return products.filter((p) => getProductTopic(p, categoriesTree) !== "vestuario");
  }

  if (targetTopic) {
    return products.filter((p) => getProductTopic(p, categoriesTree) === targetTopic);
  }

  return products;
}

/**
 * Filtra a árvore de categorias para exibir apenas os ramos pertencentes ao tópico ativo.
 */
export function filterCategoriesTreeByTopicMode(
  categoriesTree: CategoryWithChildren[] = [],
  mode: StoreMode = "all"
): CategoryWithChildren[] {
  if (mode === "all") return categoriesTree;

  const targetTopic: CatalogTopicId | null =
    mode === "roupas" ? "vestuario" : mode === "artigos" ? null : mode;

  if (mode === "artigos") {
    return categoriesTree.filter((root) => {
      const topic = getProductTopic(root.name, categoriesTree);
      return topic !== "vestuario";
    });
  }

  if (!targetTopic) return categoriesTree;

  const allowedCategories = new Set(
    CATALOG_TOPICS[targetTopic].categories.map((c) => normalizeText(c))
  );

  return categoriesTree.filter((root) => {
    return (
      allowedCategories.has(normalizeText(root.name)) ||
      getProductTopic(root.name, categoriesTree) === targetTopic
    );
  });
}
