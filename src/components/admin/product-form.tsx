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
  // Deduplicate category list to avoid duplicate keys
  const uniqueCategories = useMemo(() => {
    const list = Array.from(new Set(availableCategories));
    return list.length > 0 ? list : Array.from(defaultCategories);
  }, [availableCategories]);

  const [category, setCategory] = useState(product?.category || uniqueCategories[0] || "Acessórios");
  const [isPending, startTransition] = useTransition();
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const existingImageUrl = product?.image_url || null;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const shownImageUrl = previewUrl || existingImageUrl;
  const showingExistingImage = !previewUrl && Boolean(existingImageUrl);

  const clearSelectedImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setSelectedFileName(null);
    setImageError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      clearSelectedImage();
      return;
    }

    const validationError = isValidImage(file);
    if (validationError) {
      clearSelectedImage();
      setImageError(validationError);
      toast.error(validationError);
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextPreview = URL.createObjectURL(file);
    setPreviewUrl(nextPreview);
    setSelectedFileName(file.name);
    setImageError(null);
  };

  return (
    <form
      action={(formData) => {
        formData.set("category", category);
        startTransition(async () => {
          try {
            if (product) {
              await updateProduct(formData);
              toast.success("Produto atualizado com sucesso!");
            } else {
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
        <>
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="current_image_url" value={product.image_url || ""} />
        </>
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
        <Label htmlFor={product ? `image-${product.id}` : "image"} className="text-xs font-semibold text-slate-700">
          Imagem do Produto
        </Label>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="grid gap-3 sm:grid-cols-[100px_1fr]">
            <div className="flex h-24 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
              {shownImageUrl ? (
                <img
                  src={shownImageUrl}
                  alt={selectedFileName || product?.name || "Pré-visualização da imagem"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 px-2 text-center text-[10px] text-slate-400">
                  <ImageIcon className="h-5 w-5 text-slate-400" />
                  <span>Sem imagem</span>
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-col justify-between gap-2">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-slate-700 truncate max-w-[160px]">
                    {selectedFileName || (showingExistingImage ? "Imagem cadastrada" : "Nenhum arquivo")}
                  </span>
                  {selectedFileName && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                      Novo
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">JPG, PNG ou WEBP (Max: 5 MB).</p>
                {imageError && <p className="text-[10px] text-rose-600 font-medium">{imageError}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <label
                  className={cn(
                    "inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-100 shadow-2xs",
                    isPending && "pointer-events-none opacity-60",
                  )}
                >
                  <Upload className="h-3.5 w-3.5 text-amber-600" />
                  {shownImageUrl ? "Trocar imagem" : "Escolher arquivo"}
                  <Input
                    ref={fileInputRef}
                    id={product ? `image-${product.id}` : "image"}
                    name="image"
                    type="file"
                    required={!product}
                    accept=".jpg,.jpeg,.png,.webp"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                {selectedFileName && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 rounded-lg px-2 text-xs text-slate-500 hover:text-slate-800"
                    onClick={clearSelectedImage}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
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
