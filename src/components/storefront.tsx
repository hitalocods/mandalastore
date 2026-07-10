"use client";



import { AnimatePresence, motion } from "framer-motion";

import Image from "next/image";

import { useState } from "react";

import { CartDrawer } from "@/components/cart-drawer";

import { ProductCard } from "@/components/product-card";

import { SiteHeader } from "@/components/site-header";

import { useProductFilter } from "@/hooks/use-product-filter";

import { CartProvider } from "@/store/cart-store";

import { categories } from "@/types/product";

import type { Product } from "@/types/product";
import type { Neighborhood } from "@/types/neighborhood";



export function Storefront({ products, neighborhoods }: { products: Product[]; neighborhoods: Neighborhood[] }) {

  const [cartOpen, setCartOpen] = useState(false);

  const { activeCategory, filteredProducts, setActiveCategory } = useProductFilter(products);



  return (

    <CartProvider>

      <SiteHeader onCartOpen={() => setCartOpen(true)} />

      <main>

        <section className="mx-auto grid max-w-7xl gap-6 px-3 pb-9 pt-7 sm:px-6 sm:pb-12 sm:pt-14 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:pb-20 lg:pt-20">

          <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-black sm:mb-4 sm:text-xs">

              Acessórios premium

            </p>

            <h1 className="max-w-2xl bg-linear-to-r from-[#cc0000] to-[#d4af37] bg-clip-text text-4xl font-semibold tracking-[-0.035em] text-transparent sm:text-6xl lg:text-7xl">

              Mandalla Prime

            </h1>

            <p className="mt-4 max-w-md text-sm leading-6 text-black sm:mt-5 sm:text-base sm:leading-7">

              Capas, acessórios, roupas e muito mais.

            </p>

          </motion.div>

          <motion.div

            initial={false}

            animate={{ opacity: 1, scale: 1 }}

            transition={{ duration: 0.55, delay: 0.08 }}

            className="flex items-center justify-center"

          >

            <Image

              src="/logo-mandala.png"

              alt="Mandalla Prime"

              width={200}

              height={200}

              className="h-auto w-auto max-h-56 object-contain sm:max-h-72"

              priority

            />

          </motion.div>

        </section>



        <section id="categories" className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">

          <div className="premium-scrollbar -mx-3 flex snap-x gap-2 overflow-x-auto px-3 pb-3 sm:mx-0 sm:px-0">

            {(["Todos", ...categories] as const).map((category) => (

              <button

                key={category}

                onClick={() => setActiveCategory(category)}

                className={`min-h-10 shrink-0 snap-start rounded-full border px-4 py-2 text-sm transition sm:px-5 ${

                  activeCategory === category

                    ? "bg-primary text-primary-foreground"

                    : "bg-white text-black hover:border-foreground"

                }`}

              >

                {category}

              </button>

            ))}

          </div>

        </section>



        <section id="products" className="mx-auto max-w-7xl px-3 pb-20 pt-6 sm:px-6 sm:pt-8 lg:px-8">

          <div className="mb-5 flex items-end justify-between gap-4 sm:mb-8">

            <div>

              <p className="text-[11px] uppercase tracking-[0.2em] text-black sm:text-xs">

                {filteredProducts.length} itens

              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-tight text-black sm:mt-2 sm:text-2xl">Produtos</h2>

            </div>

          </div>

          <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">

            <AnimatePresence mode="popLayout">

              {filteredProducts.map((product) => (

                <ProductCard key={product.id} product={product} />

              ))}

            </AnimatePresence>

          </motion.div>

        </section>

      </main>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} neighborhoods={neighborhoods} />

    </CartProvider>

  );

}

