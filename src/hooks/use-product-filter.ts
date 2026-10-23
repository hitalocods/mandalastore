"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types/product";
import type { CategoryWithChildren } from "@/types/category";
import { mixProducts } from "@/lib/product-mix";

export function useProductFilter(products: Product[], categoriesTree: CategoryWithChildren[] = []) {
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Cria um mix sortido com produtos de categorias intercaladas
  const mixedProducts = useMemo(() => {
    return mixProducts(products);
  }, [products]);

  const filteredProducts = useMemo(() => {
    // Quando em "Todos" e sem busca, exibe o mix sortido; caso contrário, usa a lista base
    let list = activeCategory === "Todos" ? mixedProducts : products;

    if (activeCategory !== "Todos") {
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

        list = list.filter((product) => {
          const prodCatLower = product.category.trim().toLowerCase();
          return (
            allowedNames.includes(prodCatLower) ||
            allowedNames.some(
              (name) => prodCatLower === name + "s" || name === prodCatLower + "s"
            )
          );
        });
      } else {
        list = list.filter((product) => {
          const prodCatLower = product.category.trim().toLowerCase();
          return (
            prodCatLower === activeCatLower ||
            prodCatLower === activeCatLower + "s" ||
            activeCatLower === prodCatLower + "s"
          );
        });
      }
    }

    // Filtro por termo de busca
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        const catMatch = p.category.toLowerCase().includes(q);
        return nameMatch || descMatch || catMatch;
      });
    }

    return list;
  }, [activeCategory, mixedProducts, products, categoriesTree, searchQuery]);

  return {
    activeCategory,
    filteredProducts,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
  };
}
