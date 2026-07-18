import { getProducts } from "@/services/products";
import { getActiveNeighborhoods } from "@/services/neighborhoods";
import { getCategories } from "@/services/categories";
import { Storefront } from "@/components/storefront";

export default async function Home() {
  const products = await getProducts();
  const neighborhoods = await getActiveNeighborhoods();
  const categoriesTree = await getCategories();

  return (
    <Storefront
      products={products}
      neighborhoods={neighborhoods}
      categoriesTree={categoriesTree}
    />
  );
}
