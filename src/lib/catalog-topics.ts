import type { CategoryWithChildren } from "@/types/category";
import type { Product } from "@/types/product";

export type CatalogTopicId = "imagens" | "vestuario" | "acessorios" | "produtos";

export type StoreMode = "all" | "imagens" | "vestuario" | "acessorios" | "produtos" | "roupas" | "artigos";

export interface CatalogTopicConfig {
  id: CatalogTopicId;
  title: string;
  subtitle: string;
  imageUrl: string;
  unitLabel: string;
  categories: string[];
}

export const CATALOG_TOPICS: Record<CatalogTopicId, CatalogTopicConfig> = {
  imagens: {
    id: "imagens",
    title: "Imagens Religiosas",
    subtitle: "Católicas, Umbanda, batismo e livros",
    imageUrl: "/topics/imagens.jpg",
    unitLabel: "itens",
    categories: [
      "Imagens Católicas",
      "Imagens Umbanda",
      "Material De Batismo",
      "Livros",
      "Exus de Cerâmica",
      "Erês",
      "Pombagira de Gesso",
      "Caboclos de Gesso",
      "Orixás",
      "Iemanjá",
      "Preto Velho (Gesso e Cerâmica)",
    ],
  },
  vestuario: {
    id: "vestuario",
    title: "Vestuário Sagrado de Axé",
    subtitle: "Roupas, guias, chapéus e acessórios",
    imageUrl: "/topics/vestuario.jpg",
    unitLabel: "peças",
    categories: ["Vestuários", "Vestuário Masculino", "Vestuário Feminino", "Bengala", "Guias"],
  },
  acessorios: {
    id: "acessorios",
    title: "Acessórios",
    subtitle: "Colares, brincos, chapéus, coroas e mais",
    imageUrl: "/topics/acessorios.jpg",
    unitLabel: "itens",
    categories: ["Chapéu", "Chapéus", "Bijuterias e Semi-Jóia", "Acessórios", "Leques"],
  },
  produtos: {
    id: "produtos",
    title: "Produtos Religiosos",
    subtitle: "Velas, ervas, incensos, rituais e mais",
    imageUrl: "/topics/produtos.jpg",
    unitLabel: "itens",
    categories: [
      "Velas",
      "Ervas / Defumadores",
      "Incensos e Defumadores",
      "Essências e Óleos",
      "Banhos",
      "Perfumaria",
      "Rituais",
      "Baralho / Tarot",
      "Baralhos",
      "Itens de Barro",
      "Itens de Louça",
      "Taças e Copos Personalizadas",
      "Taças",
      "Tabacaria",
      "Cachimbos",
      "Charutos",
      "Fumos",
      "Cigarros",
      "Bebidas",
    ],
  },
};

export const CATALOG_TOPIC_LIST: CatalogTopicConfig[] = [
  CATALOG_TOPICS.imagens,
  CATALOG_TOPICS.vestuario,
  CATALOG_TOPICS.acessorios,
  CATALOG_TOPICS.produtos,
];

export function isValidTopicId(val?: string | null): val is CatalogTopicId {
  return val === "imagens" || val === "vestuario" || val === "acessorios" || val === "produtos";
}

export function normalizeText(text: string): string {
  return (text || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Infere o tópico padrão pelo nome da categoria ou produto (usado quando o tópico
 * ainda não foi definido manualmente no painel).
 */
export function inferTopicByText(categoryName: string, productName = ""): CatalogTopicId {
  const normCat = normalizeText(categoryName);
  const normProd = normalizeText(productName);

  for (const [key, topic] of Object.entries(CATALOG_TOPICS) as [CatalogTopicId, CatalogTopicConfig][]) {
    for (const cat of topic.categories) {
      const normTarget = normalizeText(cat);
      if (normCat === normTarget || normCat === `${normTarget}s` || `${normCat}s` === normTarget) {
        return key;
      }
    }
  }

  const accessoryWords = [
    "colar", "colares", "brinco", "brincos", "chapeu", "chapeus", "pulseira", "pulseiras",
    "rosa", "rosas", "luva", "luvas", "batom", "anel", "aneis", "coroa", "coroas",
    "aplique", "apliques", "acessorio", "acessorios", "bijuteria", "bijuterias", "leque", "leques",
  ];
  const words = `${normCat} ${normProd}`.split(/[^a-z0-9]+/);
  if (words.some((w) => accessoryWords.includes(w))) {
    return "acessorios";
  }

  if (
    normCat.includes("vestuario") ||
    normCat.includes("roupa") ||
    normCat.includes("saia") ||
    normCat.includes("bata") ||
    normCat.includes("feminino") ||
    normCat.includes("masculino") ||
    normCat.includes("guia") ||
    normCat.includes("bengala")
  ) {
    return "vestuario";
  }

  if (
    normCat.includes("imagem") ||
    normCat.includes("imagens") ||
    normCat.includes("livro") ||
    normCat.includes("batismo") ||
    normCat.includes("orixa") ||
    normCat.includes("iemanja") ||
    normCat.includes("caboclo") ||
    normCat.includes("pombagira") ||
    normCat.includes("preto velho") ||
    normCat.includes("exu") ||
    normProd.includes("imagem")
  ) {
    return "imagens";
  }

  return "produtos";
}

/**
 * Constrói mapas de busca rápida da árvore de categorias:
 * - topicMap: tópico explícito (ou herdado da categoria pai) configurado no painel
 * - rootMap: nome da categoria raiz
 */
function buildCategoryMaps(categoriesTree: CategoryWithChildren[] = []): {
  topicMap: Map<string, CatalogTopicId>;
  rootMap: Map<string, string>;
} {
  const topicMap = new Map<string, CatalogTopicId>();
  const rootMap = new Map<string, string>();

  function registerKeys(name: string, slug: string | null | undefined, rootName: string, topic: CatalogTopicId | null) {
    const normName = normalizeText(name);
    rootMap.set(normName, rootName);
    if (topic) {
      topicMap.set(normName, topic);
      topicMap.set(`${normName}s`, topic);
      if (normName.endsWith("s")) {
        topicMap.set(normName.slice(0, -1), topic);
      }
    }
    if (slug) {
      const normSlug = normalizeText(slug);
      rootMap.set(normSlug, rootName);
      if (topic) topicMap.set(normSlug, topic);
    }
  }

  function traverse(node: CategoryWithChildren, rootName: string, inheritedTopic: CatalogTopicId | null) {
    const effectiveTopic: CatalogTopicId | null = isValidTopicId(node.topic)
      ? node.topic
      : inheritedTopic;

    registerKeys(node.name, node.slug, rootName, effectiveTopic);

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        traverse(child, rootName, effectiveTopic);
      }
    }
  }

  for (const root of categoriesTree) {
    const rootTopic: CatalogTopicId = isValidTopicId(root.topic)
      ? root.topic
      : inferTopicByText(root.name);
    traverse(root, root.name, rootTopic);
  }

  return { topicMap, rootMap };
}

/**
 * Retorna o tópico efetivo de um nó de categoria (considerando o que está salvo no banco
 * ou inferindo pelo nome caso ainda não tenha sido configurado).
 */
export function getCategoryNodeTopic(
  node: { name: string; topic?: CatalogTopicId | null },
  parentTopic?: CatalogTopicId | null
): CatalogTopicId {
  if (isValidTopicId(node.topic)) return node.topic;
  if (isValidTopicId(parentTopic)) return parentTopic;
  return inferTopicByText(node.name);
}

/**
 * Identifica a qual tópico pertence um produto ou categoria.
 * Prioriza a configuração salva no painel de admin (categoriesTree).
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
  const { topicMap, rootMap } = buildCategoryMaps(categoriesTree);

  // 1. Tópico configurado explicitamente na categoria (ou herdado da categoria pai) no painel
  const mappedTopic = topicMap.get(normCat);
  if (mappedTopic) {
    return mappedTopic;
  }

  // 2. Fallback por nome da raiz ou do produto/categoria
  const rootName = rootMap.get(normCat) || categoryName;
  return inferTopicByText(rootName, productName);
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
    acessorios: 0,
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
 * Filtra produtos de acordo com o modo selecionado ("all", "imagens", "vestuario", "acessorios", "produtos", etc).
 */
export function filterProductsByTopicMode(
  products: Product[],
  categoriesTree: CategoryWithChildren[] = [],
  mode: StoreMode = "all"
): Product[] {
  if (mode === "all") return products;

  const targetTopic: CatalogTopicId | null =
    mode === "roupas" ? "vestuario" : mode === "artigos" ? null : mode;

  if (mode === "artigos") {
    return products.filter((p) => getProductTopic(p, categoriesTree) !== "vestuario");
  }

  if (targetTopic) {
    return products.filter((p) => getProductTopic(p, categoriesTree) === targetTopic);
  }

  return products;
}

/**
 * Filtra a árvore de categorias para exibir apenas os ramos pertencentes ao tópico ativo.
 * Se uma subcategoria tiver tópico próprio diferente da mãe, ela também é exibida corretamente.
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
      const topic = getCategoryNodeTopic(root);
      return topic !== "vestuario";
    });
  }

  if (!targetTopic) return categoriesTree;

  const result: CategoryWithChildren[] = [];

  for (const root of categoriesTree) {
    const rootTopic = getCategoryNodeTopic(root);
    const children = root.children || [];

    if (rootTopic === targetTopic) {
      // Mantém a categoria pai e as subcategorias que pertencem ao mesmo tópico (ou herdam dela)
      const matchingChildren = children.filter(
        (sub) => getCategoryNodeTopic(sub, rootTopic) === targetTopic
      );
      result.push({ ...root, children: matchingChildren });
    } else {
      // Se a mãe é de outro tópico mas alguma subcategoria foi marcada neste tópico
      const promotedChildren = children.filter(
        (sub) => getCategoryNodeTopic(sub, rootTopic) === targetTopic
      );
      for (const sub of promotedChildren) {
        result.push({ ...sub, children: sub.children || [] });
      }
    }
  }

  return result;
}
