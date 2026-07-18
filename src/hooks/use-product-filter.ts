"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types/product";
import type { CategoryWithChildren } from "@/types/category";

export function useProductFilter(products: Product[], categoriesTree: CategoryWithChildren[] = []) {
  const [activeCategory, setActiveCategory] = useState<string>("Todos");

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Todos") {
      return products;
    }

    // Check if selected category is a parent category with children
    const matchingParent = categoriesTree.find(
      (c) => c.name.toLowerCase() === activeCategory.toLowerCase()
    );

    if (matchingParent && matchingParent.children && matchingParent.children.length > 0) {
      const childNames = matchingParent.children.map((c) => c.name.toLowerCase());
      childNames.push(matchingParent.name.toLowerCase());

      return products.filter((product) =>
        childNames.includes(product.category.toLowerCase())
      );
    }

    return products.filter(
      (product) => product.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [activeCategory, products, categoriesTree]);

  return {
    activeCategory,
    filteredProducts,
    setActiveCategory,
  };
}
