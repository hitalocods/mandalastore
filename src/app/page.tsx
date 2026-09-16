import { getProducts } from "@/services/products";
import { getActiveNeighborhoods } from "@/services/neighborhoods";
import { getCategories } from "@/services/categories";
import { Storefront } from "@/components/storefront";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = (await getProducts().catch(() => [])) || [];
  const neighborhoods = (await getActiveNeighborhoods().catch(() => [])) || [];
  const categoriesTree = (await getCategories().catch(() => [])) || [];

  return (
    <Storefront
      products={products}
      neighborhoods={neighborhoods}
      categoriesTree={categoriesTree}
    />
  );
}
