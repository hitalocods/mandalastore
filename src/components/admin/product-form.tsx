"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ImageIcon, Pencil, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/app/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { categories, type Product } from "@/types/product";

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

export function ProductForm({ product }: { product?: Product }) {
  const [category, setCategory] = useState(product?.category || categories[0]);
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
              toast.success("Produto atualizado");
            } else {
              await createProduct(formData);
              toast.success("Produto criado");
            }
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Falha ao salvar produto");
          }
        });
      }}
      className="grid gap-4 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:pr-1"
    >
      {product && (
        <>
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="current_image_url" value={product.image_url || ""} />
        </>
      )}
      <div className="grid gap-2">
        <Label htmlFor={product ? `name-${product.id}` : "name"}>Nome</Label>
        <Input id={product ? `name-${product.id}` : "name"} name="name" defaultValue={product?.name} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={product ? `description-${product.id}` : "description"}>Descrição</Label>
        <Textarea
          id={product ? `description-${product.id}` : "description"}
          name="description"
          defaultValue={product?.description || ""}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor={product ? `price-${product.id}` : "price"}>Preço</Label>
          <Input
            id={product ? `price-${product.id}` : "price"}
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product?.price}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={product ? `stock-${product.id}` : "stock"}>Estoque</Label>
          <Input
            id={product ? `stock-${product.id}` : "stock"}
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.stock ?? 0}
            required
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Categoria</Label>
        <Select value={category} onValueChange={(value) => setCategory(value as typeof category)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((item) => (
              <SelectItem value={item} key={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={product ? `image-${product.id}` : "image"}>Imagem</Label>
        <div className="rounded-lg border bg-muted/20 p-3 sm:p-4">
          <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
            <div className="flex h-36 items-center justify-center overflow-hidden rounded-md border bg-background">
              {shownImageUrl ? (
                <img
                  src={shownImageUrl}
                  alt={selectedFileName || product?.name || "Pré-visualização da imagem"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 px-4 text-center text-xs text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                  <span>Nenhuma imagem selecionada</span>
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-col justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{selectedFileName || (showingExistingImage ? "Imagem atual cadastrada" : "Nenhum arquivo escolhido")}</span>
                  {selectedFileName && (
                    <span className="rounded-full bg-secondary px-2 py-1 text-[11px] text-secondary-foreground">
                      Nova imagem selecionada
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Aceita JPG, PNG e WEBP. Tamanho máximo: 5 MB.</p>
                {imageError && <p className="text-xs text-destructive">{imageError}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <label
                  className={cn(
                    "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium transition hover:bg-accent",
                    isPending && "pointer-events-none opacity-60",
                  )}
                >
                  <Upload className="h-4 w-4" />
                  {shownImageUrl ? "Trocar imagem" : "Selecionar imagem"}
                  <Input
                    ref={fileInputRef}
                    id={product ? `image-${product.id}` : "image"}
                    name="image"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                {selectedFileName && (
                  <Button type="button" variant="outline" className="h-10 rounded-md px-4" onClick={clearSelectedImage}>
                    <X className="h-4 w-4" />
                    Trocar imagem
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-1 lg:sticky lg:bottom-0 lg:bg-white lg:pb-1">
        <Button disabled={isPending} className="rounded-full">
          {product ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {product ? "Salvar alterações" : "Adicionar produto"}
        </Button>
      </div>
    </form>
  );
}
