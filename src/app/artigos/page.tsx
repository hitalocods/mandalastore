import { getProducts } from "@/services/products";
import { getActiveNeighborhoods } from "@/services/neighborhoods";
import { getCategories } from "@/services/categories";
import { Storefront } from "@/components/storefront";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mandalla Artigos & Tradição | Artigos Religiosos e Variedades",
  description: "Imagens, guias, taças, charutos, cachimbos e artigos consagrados Mandalla Prime.",
};

export default async function ArtigosPage() {
  const products = (await getProducts().catch(() => [])) || [];
  const neighborhoods = (await getActiveNeighborhoods().catch(() => [])) || [];
  const categoriesTree = (await getCategories().catch(() => [])) || [];

  return (
    <Storefront
      products={products}
      neighborhoods={neighborhoods}
      categoriesTree={categoriesTree}
      initialMode="artigos"
      forceMode="artigos"
      requireEntranceChoice={false}
    />
  );
}
