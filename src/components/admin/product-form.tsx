"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ImageIcon, Pencil, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/app/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { categories as defaultCategories, type Product } from "@/types/product";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function isValidImage(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Use apenas arquivos JPG, PNG ou WEBP.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "A imagem precisa ter no máximo 5 MB.";
  }

  return null;
}

export function ProductForm({
  product,
  availableCategories = defaultCategories,
  onSuccess,
}: {
  product?: Product;
  availableCategories?: readonly string[];
  onSuccess?: () => void;
}) {
  // Deduplicate category list to avoid duplicate keys and guarantee product.category is in options
  const uniqueCategories = useMemo(() => {
    const list = Array.from(new Set(availableCategories));
    if (product?.category && !list.includes(product.category)) {
      list.push(product.category);
    }
    return list.length > 0 ? list : Array.from(defaultCategories);
  }, [availableCategories, product?.category]);

  const [category, setCategory] = useState(product?.category || uniqueCategories[0] || "Acessórios");
  const [sizes, setSizes] = useState<string>(product?.sizes || "");
  const [colors, setColors] = useState<string>(product?.colors || "");

  useEffect(() => {
    if (product) {
      setCategory(product.category);
      setSizes(product.sizes || "");
      setColors(product.colors || "");
    }
  }, [product]);

  const [isPending, startTransition] = useTransition();

  const presetSizes = ["PP", "P", "M", "G", "GG", "XG", "EXG", "36", "38", "40", "42", "44", "Único"];
  const presetColors = [
    "Branca",
    "Preta",
    "Vermelha",
    "Amarela",
    "Azul",
    "Azul Claro",
    "Verde",
    "Rosa",
    "Roxa",
    "Lilás",
    "Marrom",
    "Laranja",
    "Dourada",
    "Prateada",
    "7 Cores",
    "Preto e Vermelho",
  ];

  const togglePresetSize = (sizeTag: string) => {
    const currentList = sizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (currentList.includes(sizeTag)) {
      setSizes(currentList.filter((s) => s !== sizeTag).join(", "));
    } else {
      setSizes([...currentList, sizeTag].join(", "));
    }
  };

  const isSizeSelected = (sizeTag: string) => {
    const currentList = sizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return currentList.includes(sizeTag);
  };

  const togglePresetColor = (colorTag: string) => {
    const currentList = colors
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (currentList.includes(colorTag)) {
      setColors(currentList.filter((s) => s !== colorTag).join(", "));
    } else {
      setColors([...currentList, colorTag].join(", "));
    }
  };

  const isColorSelected = (colorTag: string) => {
    const currentList = colors
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return currentList.includes(colorTag);
  };
  const initialExistingImages = useMemo(() => {
    if (product?.images) {
      return product.images.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return product?.image_url ? [product.image_url] : [];
  }, [product?.images, product?.image_url]);

  const [existingImages, setExistingImages] = useState<string[]>(initialExistingImages);
  const [newFiles, setNewFiles] = useState<{ id: string; file: File; previewUrl: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setExistingImages(initialExistingImages);
    setNewFiles([]);
  }, [initialExistingImages]);

  useEffect(() => {
    return () => {
      newFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [newFiles]);

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    if (selected.length === 0) return;

    const validated: { id: string; file: File; previewUrl: string }[] = [];
    for (const file of selected) {
      const err = isValidImage(file);
      if (err) {
        toast.error(`"${file.name}": ${err}`);
        continue;
      }
      validated.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (validated.length > 0) {
      setNewFiles((prev) => [...prev, ...validated]);
      setImageError(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeExistingImage = (urlToRemove: string) => {
    setExistingImages((prev) => prev.filter((u) => u !== urlToRemove));
  };

  const removeNewFile = (idToRemove: string) => {
    setNewFiles((prev) => {
      const item = prev.find((i) => i.id === idToRemove);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== idToRemove);
    });
  };

  const totalImagesCount = existingImages.length + newFiles.length;

  return (
    <form
      action={(formData) => {
        formData.set("category", category);
        formData.set("sizes", sizes);
        formData.set("colors", colors);
        formData.set("existing_images", existingImages.join(","));

        // Append all new files to formData
        newFiles.forEach((item) => {
          formData.append("images", item.file);
        });

        startTransition(async () => {
          try {
            if (product) {
              await updateProduct(formData);
              toast.success("Produto atualizado com sucesso!");
            } else {
              if (totalImagesCount === 0) {
                toast.error("Por favor, adicione pelo menos uma foto para o produto.");
                return;
              }
              await createProduct(formData);
              toast.success("Produto cadastrado com sucesso!");
            }
            if (onSuccess) onSuccess();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Falha ao salvar produto");
          }
        });
      }}
      className="space-y-4"
    >
      {product && (
        <input type="hidden" name="id" value={product.id} />
      )}
      <div className="grid gap-1.5">
        <Label htmlFor={product ? `name-${product.id}` : "name"} className="text-xs font-semibold text-slate-700">
          Nome do Produto
        </Label>
        <Input
          id={product ? `name-${product.id}` : "name"}
          name="name"
          defaultValue={product?.name}
          className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-500"
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={product ? `description-${product.id}` : "description"} className="text-xs font-semibold text-slate-700">
          Descrição
        </Label>
        <Textarea
          id={product ? `description-${product.id}` : "description"}
          name="description"
          defaultValue={product?.description || ""}
          className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 min-h-[70px]"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor={product ? `price-${product.id}` : "price"} className="text-xs font-semibold text-slate-700">
            Preço (R$)
          </Label>
          <Input
            id={product ? `price-${product.id}` : "price"}
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product?.price}
            className="bg-white border-slate-200 text-slate-900 focus:border-amber-500"
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={product ? `stock-${product.id}` : "stock"} className="text-xs font-semibold text-slate-700">
            Estoque
          </Label>
          <Input
            id={product ? `stock-${product.id}` : "stock"}
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.stock ?? 0}
            className="bg-white border-slate-200 text-slate-900 focus:border-amber-500"
            required
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs font-semibold text-slate-700">Categoria ou Subcategoria</Label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
        >
          {uniqueCategories.map((item, idx) => (
            <option value={item} key={`${item}-${idx}`}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs font-semibold text-slate-700">Tamanhos Disponíveis (Opcional / Roupas)</Label>
        <div className="flex flex-wrap gap-1.5 pb-1">
          {presetSizes.map((sz) => {
            const selected = isSizeSelected(sz);
            return (
              <button
                key={sz}
                type="button"
                onClick={() => togglePresetSize(sz)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-semibold border transition cursor-pointer select-none",
                  selected
                    ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                )}
              >
                {sz}
              </button>
            );
          })}
        </div>
        <Input
          id={product ? `sizes-${product.id}` : "sizes"}
          name="sizes"
          value={sizes}
          onChange={(e) => setSizes(e.target.value)}
          placeholder="Ex: P, M, G, GG ou 38, 40, 42"
          className="bg-white border-slate-200 text-slate-900 text-xs focus:border-amber-500"
        />
        <p className="text-[10px] text-slate-400">Clique nos atalhos acima ou digite os tamanhos separados por vírgula.</p>
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs font-semibold text-slate-700">Cores Disponíveis (Opcional / Velas, Artigos)</Label>
        <div className="flex flex-wrap gap-1.5 pb-1 max-h-32 overflow-y-auto">
          {presetColors.map((cl) => {
            const selected = isColorSelected(cl);
            return (
              <button
                key={cl}
                type="button"
                onClick={() => togglePresetColor(cl)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-semibold border transition cursor-pointer select-none",
                  selected
                    ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                )}
              >
                {cl}
              </button>
            );
          })}
        </div>
        <Input
          id={product ? `colors-${product.id}` : "colors"}
          name="colors"
          value={colors}
          onChange={(e) => setColors(e.target.value)}
          placeholder="Ex: Branca, Vermelha, Preta, 7 Cores"
          className="bg-white border-slate-200 text-slate-900 text-xs focus:border-amber-500"
        />
        <p className="text-[10px] text-slate-400">Clique nos atalhos acima ou digite as cores separadas por vírgula.</p>
      </div>

      {/* Multiple Images Upload & Gallery */}
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-slate-700">
            Fotos do Produto ({totalImagesCount} {totalImagesCount === 1 ? "foto" : "fotos"})
          </Label>
          <span className="text-[10px] text-slate-400 font-medium">A 1ª foto é a capa principal</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
          {/* Thumbnails grid */}
          {totalImagesCount > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {/* Existing Images */}
              {existingImages.map((url, idx) => (
                <div
                  key={url}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xs"
                >
                  <img src={url} alt={`Foto ${idx + 1}`} className="h-full w-full object-contain p-1" />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 rounded-sm bg-[#cc0000] px-1.5 py-0.5 text-[8px] font-bold text-white uppercase shadow-xs">
                      Capa
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeExistingImage(url)}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs transition hover:bg-rose-700 cursor-pointer"
                    title="Remover foto"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* Newly selected files */}
              {newFiles.map((item, idx) => {
                const globalIndex = existingImages.length + idx;
                return (
                  <div
                    key={item.id}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-amber-300 bg-amber-50/40 shadow-2xs"
                  >
                    <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-contain p-1" />
                    {globalIndex === 0 ? (
                      <span className="absolute top-1 left-1 rounded-sm bg-[#cc0000] px-1.5 py-0.5 text-[8px] font-bold text-white uppercase shadow-xs">
                        Capa
                      </span>
                    ) : (
                      <span className="absolute top-1 left-1 rounded-sm bg-amber-500 px-1.5 py-0.5 text-[8px] font-bold text-white uppercase shadow-xs">
                        Nova
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeNewFile(item.id)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs transition hover:bg-rose-700 cursor-pointer"
                      title="Remover foto"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-slate-400 gap-1.5">
              <ImageIcon className="h-8 w-8 text-slate-300" />
              <span>Nenhuma foto adicionada ainda</span>
            </div>
          )}

          {/* Add Photos Button */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
            <p className="text-[10px] text-slate-400">JPG, PNG ou WEBP (Máx: 5 MB cada).</p>
            <label
              className={cn(
                "inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 shadow-2xs",
                isPending && "pointer-events-none opacity-60",
              )}
            >
              <Upload className="h-3.5 w-3.5 text-amber-600" />
              <span>+ Adicionar Fotos</span>
              <Input
                ref={fileInputRef}
                id={product ? `images-${product.id}` : "images"}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp"
                className="sr-only"
                onChange={handleFilesChange}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button
          disabled={isPending}
          className="w-full rounded-lg bg-gradient-to-r from-[#cc0000] to-[#d4af37] text-white font-bold text-xs py-2.5 shadow-xs hover:brightness-105"
        >
          {product ? <Pencil className="h-3.5 w-3.5 mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
          {product ? "Salvar Alterações" : "Cadastrar Produto"}
        </Button>
      </div>
    </form>
  );
}
