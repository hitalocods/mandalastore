import { getProducts } from "@/services/products";
import { getActiveNeighborhoods } from "@/services/neighborhoods";
import { Storefront } from "@/components/storefront";

export default async function Home() {
  const products = await getProducts();
  const neighborhoods = await getActiveNeighborhoods();

  return <Storefront products={products} neighborhoods={neighborhoods} />;
}
