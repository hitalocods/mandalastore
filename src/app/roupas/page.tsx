import { getProducts } from "@/services/products";
import { getActiveNeighborhoods } from "@/services/neighborhoods";
import { getCategories } from "@/services/categories";
import { Storefront } from "@/components/storefront";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mandalla Moda & Roupas | Coleção Exclusiva",
  description: "Roupas femininas e masculinas, conjuntos, batas, saias e vestuário Mandalla Prime.",
};

export default async function RoupasPage() {
  const products = (await getProducts().catch(() => [])) || [];
  const neighborhoods = (await getActiveNeighborhoods().catch(() => [])) || [];
  const categoriesTree = (await getCategories().catch(() => [])) || [];

  return (
    <Storefront
      products={products}
      neighborhoods={neighborhoods}
      categoriesTree={categoriesTree}
      initialMode="roupas"
      forceMode="roupas"
      requireEntranceChoice={false}
    />
  );
}
