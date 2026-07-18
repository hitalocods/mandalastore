"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Edit3, ImageOff, Search, Trash2, Tag, Box } from "lucide-react";
import { deleteProduct } from "@/app/actions/products";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/utils";
import { categories as defaultCategories, type Product } from "@/types/product";

export function AdminProducts({
  products,
  availableCategories = defaultCategories,
}: {
  products: Product[];
  availableCategories?: readonly string[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Todos");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = category === "Todos" || product.category === category;
      const matchesQuery = !search || product.name.toLowerCase().includes(search);

      return matchesCategory && matchesQuery;
    });
  }, [category, products, query]);

  return (
    <div className="space-y-4">
      {/* Search and Category Filter Bar */}
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:grid-cols-[1fr_240px]">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar produto por nome..."
            className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-500"
          />
        </div>
        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500"
          >
            <option value="Todos">Todas as Categorias</option>
            {availableCategories.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product List Cards */}
      <div className="grid gap-3">
        {filteredProducts.map((product, index) => {
          const isOutOfStock = product.stock <= 0;
          const isLowStock = product.stock > 0 && product.stock <= 3;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="grid gap-4 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:border-slate-300 sm:grid-cols-[80px_1fr_auto] items-center"
            >
              <div className="h-20 w-20 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <ImageOff className="h-6 w-6 text-slate-400" />
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900 text-sm">{product.name}</h3>
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200">
                    <Tag className="h-3 w-3 text-amber-600" /> {product.category}
                  </span>
                </div>
                {product.description && (
                  <p className="line-clamp-1 text-xs text-slate-500">{product.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs font-medium pt-1">
                  <span className="text-[#cc0000] font-bold text-sm">{formatCurrency(product.price)}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isOutOfStock
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : isLowStock
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    <Box className="h-3 w-3" />
                    {isOutOfStock ? "Esgotado" : `${product.stock} un. em estoque`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:justify-end">
                <Sheet open={editingProduct?.id === product.id} onOpenChange={(open) => !open && setEditingProduct(null)}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProduct(product)}
                      className="h-8 rounded-lg border-slate-200 bg-white text-slate-700 text-xs hover:bg-slate-50"
                    >
                      <Edit3 className="h-3.5 w-3.5 mr-1 text-amber-600" /> Editar
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[90vw] max-w-md bg-white text-slate-900 p-0 border-l border-slate-200">
                    <div className="flex h-full flex-col">
                      <SheetHeader className="border-b border-slate-100 p-5 bg-slate-50">
                        <SheetTitle className="text-slate-900 text-base font-bold flex items-center gap-2">
                          <Edit3 className="h-4 w-4 text-amber-600" /> Editar Produto
                        </SheetTitle>
                      </SheetHeader>
                      <div className="flex-1 overflow-y-auto p-5">
                        <ProductForm
                          product={product}
                          availableCategories={availableCategories}
                          onSuccess={() => setEditingProduct(null)}
                        />
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <form action={deleteProduct} onSubmit={(e) => !confirm("Excluir este produto?") && e.preventDefault()}>
                  <input type="hidden" name="id" value={product.id} />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          );
        })}

        {!filteredProducts.length && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
            Nenhum produto encontrado com os filtros atuais.
          </div>
        )}
      </div>
    </div>
  );
}
