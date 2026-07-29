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

    const activeCatLower = activeCategory.trim().toLowerCase();

    const findCategory = (nodes: CategoryWithChildren[]): CategoryWithChildren | undefined => {
      for (const node of nodes) {
        if (node.name.trim().toLowerCase() === activeCatLower) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const found = findCategory(node.children);
          if (found) return found;
        }
      }
      return undefined;
    };

    const matchingCategory = findCategory(categoriesTree);

    if (matchingCategory && matchingCategory.children && matchingCategory.children.length > 0) {
      const allowedNames = [
        matchingCategory.name.trim().toLowerCase(),
        ...matchingCategory.children.map((c) => c.name.trim().toLowerCase()),
      ];

      return products.filter((product) => {
        const prodCatLower = product.category.trim().toLowerCase();
        return (
          allowedNames.includes(prodCatLower) ||
          allowedNames.some(
            (name) => prodCatLower === name + "s" || name === prodCatLower + "s"
          )
        );
      });
    }

    return products.filter((product) => {
      const prodCatLower = product.category.trim().toLowerCase();
      return (
        prodCatLower === activeCatLower ||
        prodCatLower === activeCatLower + "s" ||
        activeCatLower === prodCatLower + "s"
      );
    });
  }, [activeCategory, products, categoriesTree]);

  return {
    activeCategory,
    filteredProducts,
    setActiveCategory,
  };
}
