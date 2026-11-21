"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  Edit2,
  FolderPlus,
  ImageIcon,
  Layers,
  LayoutGrid,
  Loader2,
  Plus,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createCategory,
  deleteCategory,
  moveCategory,
  toggleCategoryGallery,
  updateCategory,
  updateCategoryTopic,
  type CategoryActionResult,
} from "@/app/actions/categories";
import {
  CATALOG_TOPICS,
  CATALOG_TOPIC_LIST,
  buildTopicSubtitles,
  computeTopicCounts,
  getCategoryNodeTopic,
  inferTopicByText,
  type CatalogTopicId,
} from "@/lib/catalog-topics";
import { compressImage } from "@/lib/image-compression";
import type { Category, CategoryWithChildren } from "@/types/category";
import type { Product } from "@/types/product";

type CategoryManagerProps = {
  categoriesTree: CategoryWithChildren[];
  flatCategories: Category[];
  products?: Product[];
};

const MAX_IMAGE_SIZE = 30 * 1024 * 1024;

const TOPIC_BADGE_STYLES: Record<CatalogTopicId, string> = {
  imagens: "border-amber-300 bg-amber-50 text-amber-900 hover:border-amber-400",
  vestuario: "border-rose-300 bg-rose-50 text-rose-900 hover:border-rose-400",
  acessorios: "border-purple-300 bg-purple-50 text-purple-900 hover:border-purple-400",
  produtos: "border-emerald-300 bg-emerald-50 text-emerald-900 hover:border-emerald-400",
};

function handleResult(res: CategoryActionResult, silentSuccess = false) {
  if (res.isSessionExpired) {
    toast.error(res.message);
    setTimeout(() => (window.location.href = "/admin/login"), 1200);
    return false;
  }
  if (!res.success) {
    toast.error(res.message);
    return false;
  }
  if (!silentSuccess) toast.success(res.message);
  return true;
}

async function prepareImage(file: File): Promise<File | null> {
  const isImage = file.type.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif|jfif|bmp)$/i.test(file.name);
  if (!isImage) {
    toast.error("Selecione um arquivo de foto válido.");
    return null;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    toast.error("A foto precisa ter no máximo 30 MB.");
    return null;
  }
  try {
    return await compressImage(file);
  } catch {
    return file;
  }
}

export function CategoryManager({
  categoriesTree,
  flatCategories,
  products = [],
}: CategoryManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filterTopic, setFilterTopic] = useState<CatalogTopicId | "all">("all");

  // Criação
  const [newCatName, setNewCatName] = useState("");
  const [newParentId, setNewParentId] = useState<string>("none");
  const [newTopic, setNewTopic] = useState<CatalogTopicId | "auto">("auto");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const newFileInputRef = useRef<HTMLInputElement | null>(null);

  // Edição
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editParentId, setEditParentId] = useState<string>("none");
  const [editTopic, setEditTopic] = useState<CatalogTopicId>("produtos");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editCurrentImageUrl, setEditCurrentImageUrl] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const galleryCount = flatCategories.filter((c) => c.show_in_gallery === true).length;

  // Contagem de produtos em cada um dos 4 cards da entrada
  const topicCounts = useMemo(
    () => computeTopicCounts(products, categoriesTree),
    [products, categoriesTree]
  );

  const topicSubtitles = useMemo(
    () => buildTopicSubtitles(categoriesTree),
    [categoriesTree]
  );

  // Categorias principais agrupadas por tópico da tela inicial
  const categoriesByTopic = useMemo(() => {
    const map: Record<CatalogTopicId, CategoryWithChildren[]> = {
      imagens: [],
      vestuario: [],
      acessorios: [],
      produtos: [],
    };
    for (const root of categoriesTree) {
      const t = getCategoryNodeTopic(root);
      map[t].push(root);
    }
    return map;
  }, [categoriesTree]);

  const visibleCategoriesTree = useMemo(() => {
    if (filterTopic === "all") return categoriesTree;
    return categoriesTree.filter((root) => {
      const rootTopic = getCategoryNodeTopic(root);
      if (rootTopic === filterTopic) return true;
      return (root.children || []).some(
        (sub) => getCategoryNodeTopic(sub, rootTopic) === filterTopic
      );
    });
  }, [categoriesTree, filterTopic]);

  const handleNewImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const prepared = await prepareImage(file);
    if (!prepared) {
      if (newFileInputRef.current) newFileInputRef.current.value = "";
      return;
    }
    if (newImagePreview) URL.revokeObjectURL(newImagePreview);
    setNewImageFile(prepared);
    setNewImagePreview(URL.createObjectURL(prepared));
  };

  const clearNewImage = () => {
    setNewImageFile(null);
    if (newImagePreview) URL.revokeObjectURL(newImagePreview);
    setNewImagePreview(null);
    if (newFileInputRef.current) newFileInputRef.current.value = "";
  };

  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const prepared = await prepareImage(file);
    if (!prepared) {
      if (editFileInputRef.current) editFileInputRef.current.value = "";
      return;
    }
    if (editImagePreview) URL.revokeObjectURL(editImagePreview);
    setEditImageFile(prepared);
    setEditImagePreview(URL.createObjectURL(prepared));
  };

  const clearEditImage = () => {
    setEditImageFile(null);
    if (editImagePreview) URL.revokeObjectURL(editImagePreview);
    setEditImagePreview(null);
    setEditCurrentImageUrl(null);
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const cancelEdit = () => {
    if (editImagePreview) URL.revokeObjectURL(editImagePreview);
    setEditingId(null);
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditCurrentImageUrl(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const formData = new FormData();
    formData.append("name", newCatName);
    formData.append("parent_id", newParentId);

    const chosenTopic: CatalogTopicId =
      newTopic === "auto" ? inferTopicByText(newCatName) : newTopic;
    if (newParentId === "none" || newTopic !== "auto") {
      formData.append("topic", chosenTopic);
    }

    if (newImageFile) formData.append("image", newImageFile);

    startTransition(async () => {
      try {
        const res = await createCategory(formData);
        if (handleResult(res)) {
          setNewCatName("");
          setNewParentId("none");
          setNewTopic("auto");
          clearNewImage();
        }
      } catch {
        toast.error("Falha de conexão ao criar categoria. Tente novamente.");
      }
    });
  };

  const handleStartEdit = (cat: Category, parentTopic?: CatalogTopicId | null) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditParentId(cat.parent_id || "none");
    setEditTopic(getCategoryNodeTopic(cat, parentTopic));
    setEditCurrentImageUrl(cat.image_url || null);
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;

    const formData = new FormData();
    formData.append("id", id);
    formData.append("name", editName);
    formData.append("parent_id", editParentId);
    formData.append("topic", editTopic);
    if (editImageFile) {
      formData.append("image", editImageFile);
    } else {
      formData.append("image_url", editCurrentImageUrl || "");
    }

    startTransition(async () => {
      try {
        const res = await updateCategory(formData);
        if (handleResult(res)) cancelEdit();
      } catch {
        toast.error("Falha de conexão ao salvar. Tente novamente.");
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${name}"? Subcategorias associadas também serão removidas.`)) {
      return;
    }
    const formData = new FormData();
    formData.append("id", id);

    startTransition(async () => {
      try {
        handleResult(await deleteCategory(formData));
      } catch {
        toast.error("Falha de conexão ao excluir. Tente novamente.");
      }
    });
  };

  const handleToggleGallery = (cat: Category) => {
    const next = !cat.show_in_gallery;
    setBusyId(cat.id);
    startTransition(async () => {
      try {
        handleResult(await toggleCategoryGallery(cat.id, next));
      } catch {
        toast.error("Falha de conexão. Tente novamente.");
      } finally {
        setBusyId(null);
      }
    });
  };

  const handleChangeTopic = (cat: Category, nextTopic: CatalogTopicId) => {
    setBusyId(cat.id);
    startTransition(async () => {
      try {
        handleResult(await updateCategoryTopic(cat.id, nextTopic));
      } catch {
        toast.error("Falha de conexão ao mudar o card. Tente novamente.");
      } finally {
        setBusyId(null);
      }
    });
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    setBusyId(id);
    startTransition(async () => {
      try {
        handleResult(await moveCategory(id, direction), true);
      } catch {
        toast.error("Falha de conexão. Tente novamente.");
      } finally {
        setBusyId(null);
      }
    });
  };

  /** Bloco de edição inline (nome + card da entrada + foto + salvar/cancelar) */
  const renderEditRow = (id: string, compact = false) => (
    <div className="flex flex-wrap items-center gap-2 flex-1">
      <Input
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        placeholder="Nome da categoria"
        className={`${compact ? "h-7" : "h-8"} max-w-xs bg-white border-amber-500 text-xs text-slate-900`}
      />
      <select
        value={editTopic}
        onChange={(e) => setEditTopic(e.target.value as CatalogTopicId)}
        className={`${compact ? "h-7" : "h-8"} rounded-md border border-amber-400 bg-amber-50/70 px-2 text-xs font-semibold text-slate-900 focus:outline-hidden`}
        title="Card da Tela Inicial"
      >
        {CATALOG_TOPIC_LIST.map((t) => (
          <option key={t.id} value={t.id}>
            Card: {t.title}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-2">
        <label className="flex h-8 items-center gap-1 rounded-md border border-dashed border-slate-300 bg-white px-2.5 text-xs text-slate-600 hover:border-amber-500 cursor-pointer">
          <Upload className="h-3 w-3" />
          <span>{editImageFile ? "Nova foto ✓" : "Trocar foto"}</span>
          <input
            ref={editFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleEditImageChange}
            className="hidden"
          />
        </label>
        {(editImagePreview || editCurrentImageUrl) && (
          <div className="relative h-8 w-8 rounded-md overflow-hidden border border-slate-300">
            <img
              src={editImagePreview || editCurrentImageUrl || ""}
              alt="Capa"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={clearEditImage}
              title="Remover foto"
              className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
      <Button
        size="icon"
        onClick={() => handleSaveEdit(id)}
        disabled={isPending}
        className="h-8 w-8 bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={cancelEdit}
        className="h-8 w-8 text-slate-500 hover:text-slate-900"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );

  /** Seletor rápido de qual Card da Tela Inicial esta categoria pertence + botões de ação */
  const renderActions = (
    cat: Category,
    index: number,
    total: number,
    effectiveTopic: CatalogTopicId,
    parentTopic?: CatalogTopicId | null,
    small = false
  ) => {
    const inGallery = cat.show_in_gallery === true;
    const isBusy = busyId === cat.id;
    const size = small ? "h-6 w-6" : "h-7 w-7";
    const icon = small ? "h-3 w-3" : "h-3.5 w-3.5";

    return (
      <div className="flex flex-wrap items-center gap-1 shrink-0">
        {/* Seletor rápido do Card da Tela Inicial */}
        <select
          value={effectiveTopic}
          disabled={isBusy}
          onChange={(e) => handleChangeTopic(cat, e.target.value as CatalogTopicId)}
          title="Escolher em qual dos 4 cards da tela inicial essa categoria entra"
          className={`rounded-full border px-2.5 ${small ? "h-6 text-[10px]" : "h-7 text-[11px]"} font-bold transition cursor-pointer disabled:opacity-50 focus:outline-hidden ${TOPIC_BADGE_STYLES[effectiveTopic]}`}
        >
          {CATALOG_TOPIC_LIST.map((t) => (
            <option key={t.id} value={t.id} className="bg-white text-slate-900 font-semibold">
              Card: {t.title}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => handleToggleGallery(cat)}
          disabled={isBusy}
          title={inGallery ? "Aparece em ITENS na loja (clique para tirar)" : "Não aparece em ITENS (clique para mostrar)"}
          className={`flex items-center gap-1 rounded-full border px-2 ${small ? "h-6" : "h-7"} text-[10px] font-bold transition cursor-pointer disabled:opacity-50 ${
            inGallery
              ? "border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100"
              : "border-slate-200 bg-white text-slate-400 hover:text-slate-600"
          }`}
        >
          {isBusy ? (
            <Loader2 className={`${icon} animate-spin`} />
          ) : (
            <Star className={`${icon} ${inGallery ? "fill-amber-400 text-amber-500" : ""}`} />
          )}
          <span className="hidden sm:inline">{inGallery ? "Na vitrine" : "Fora"}</span>
        </button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleMove(cat.id, "up")}
          disabled={index === 0 || isBusy}
          title="Mover para cima"
          className={`${size} text-slate-500 hover:text-slate-900 cursor-pointer`}
        >
          <ArrowUp className={icon} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleMove(cat.id, "down")}
          disabled={index === total - 1 || isBusy}
          title="Mover para baixo"
          className={`${size} text-slate-500 hover:text-slate-900 cursor-pointer`}
        >
          <ArrowDown className={icon} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleStartEdit(cat, parentTopic)}
          title="Editar nome, foto e card"
          className={`${size} text-slate-500 hover:bg-white hover:text-slate-900 cursor-pointer`}
        >
          <Edit2 className={icon} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleDelete(cat.id, cat.name)}
          title="Excluir"
          className={`${size} text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer`}
        >
          <Trash2 className={icon} />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* SEÇÃO 1: Os 4 Cards da Tela Inicial (Configuração Visual) */}
      <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-[#6e0101] via-[#540000] to-[#3a0000] p-4 sm:p-5 text-[#fff3dc] shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-400/20 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-400/15 border border-amber-400/40 text-amber-300">
              <LayoutGrid className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                4 Cards da Tela Inicial (Entrada da Loja)
              </h3>
              <p className="text-[11px] sm:text-xs text-amber-100/80">
                Veja abaixo o que está dentro de cada card. Para mudar uma categoria de card, basta trocar na caixinha <strong>&quot;Card: ...&quot;</strong> ao lado dela na lista abaixo.
              </p>
            </div>
          </div>

          {filterTopic !== "all" && (
            <button
              type="button"
              onClick={() => setFilterTopic("all")}
              className="self-start sm:self-auto rounded-full border border-amber-300/50 bg-amber-400/20 px-3 py-1 text-[11px] font-bold text-amber-100 hover:bg-amber-400/30 transition cursor-pointer"
            >
              Mostrar todos os 4 cards ({categoriesTree.length})
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {CATALOG_TOPIC_LIST.map((topic) => {
            const count = topicCounts[topic.id] ?? 0;
            const assignedCats = categoriesByTopic[topic.id] || [];
            const isSelected = filterTopic === topic.id;

            return (
              <div
                key={topic.id}
                onClick={() => setFilterTopic(isSelected ? "all" : topic.id)}
                className={`group rounded-2xl border p-3.5 transition-all cursor-pointer ${
                  isSelected
                    ? "border-amber-300 bg-[#7a0202]/90 ring-2 ring-amber-300/50 shadow-lg"
                    : "border-amber-400/35 bg-[#460000]/70 hover:border-amber-300/70 hover:bg-[#580000]/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={topic.imageUrl}
                    alt={topic.title}
                    className="h-14 w-14 shrink-0 rounded-xl object-cover border border-amber-400/50 shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white uppercase tracking-wide">
                        {topic.title}
                      </span>
                      <span className="rounded-full border border-amber-400/40 bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-200 uppercase">
                        {count} {topic.unitLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-100/75 truncate mt-0.5">
                      {topicSubtitles[topic.id] || topic.subtitle}
                    </p>
                    <p className="text-[10px] text-amber-300/90 font-semibold mt-1">
                      {assignedCats.length}{" "}
                      {assignedCats.length === 1 ? "categoria principal vinculada" : "categorias principais vinculadas"}
                      {isSelected ? " • Filtrando abaixo ✓" : " • Clique para filtrar"}
                    </p>
                  </div>
                </div>

                {assignedCats.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-amber-400/15 flex flex-wrap gap-1">
                    {assignedCats.map((c) => (
                      <span
                        key={c.id}
                        className="rounded-md bg-black/30 border border-amber-400/25 px-2 py-0.5 text-[10px] font-medium text-amber-100"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Explicação da vitrine ITENS */}
      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-100">
            <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
          </span>
          <div className="text-xs text-slate-700 space-y-1">
            <p className="text-sm font-bold text-slate-900">
              Vitrine &quot;ITENS&quot; da loja — {galleryCount} {galleryCount === 1 ? "categoria aparecendo" : "categorias aparecendo"}
            </p>
            <p>
              Clique na <strong>estrela</strong> para escolher quais categorias aparecem com foto no topo da loja.
              Use a caixinha <strong>&quot;Card: ...&quot;</strong> para escolher em qual dos 4 cards da tela inicial a categoria fica.
            </p>
          </div>
        </div>
      </div>

      {/* Criar nova categoria */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider">
          <FolderPlus className="h-4 w-4 text-amber-600" /> Nova Categoria / Subcategoria
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Cadastre uma categoria principal ou subcategoria e escolha em qual dos 4 cards da entrada ela vai aparecer.
        </p>

        <form onSubmit={handleCreate} className="mt-4 grid gap-3 sm:grid-cols-12 items-end">
          <div className="sm:col-span-3">
            <label className="text-[11px] font-semibold text-slate-700">Nome da Categoria</label>
            <Input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Ex: Coroas, Brincos, Velas..."
              className="mt-1 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-500"
              required
            />
          </div>

          <div className="sm:col-span-3">
            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-600" /> Card da Tela Inicial
            </label>
            <select
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value as CatalogTopicId | "auto")}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-amber-500"
            >
              <option value="auto">
                Automático ({newCatName.trim() ? CATALOG_TOPICS[inferTopicByText(newCatName)].title : "pelo nome"})
              </option>
              {CATALOG_TOPIC_LIST.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-slate-700">Tipo / Categoria Pai</label>
            <select
              value={newParentId}
              onChange={(e) => setNewParentId(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500"
            >
              <option value="none">Principal (Sem pai)</option>
              {categoriesTree.map((root) => (
                <option key={root.id} value={root.id}>
                  Sub de: {root.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
              <ImageIcon className="h-3 w-3 text-amber-600" /> Foto (opcional)
            </label>
            <div className="mt-1 flex items-center gap-2">
              <label className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-2.5 text-xs font-medium text-slate-600 hover:border-amber-500 hover:text-amber-700 cursor-pointer transition">
                <Upload className="h-3.5 w-3.5" />
                <span className="truncate">{newImageFile ? "Foto ✓" : "Foto"}</span>
                <input
                  ref={newFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleNewImageChange}
                  className="hidden"
                />
              </label>
              {newImagePreview && (
                <div className="relative h-9 w-9 shrink-0 rounded-lg overflow-hidden border border-amber-500 shadow-2xs">
                  <img src={newImagePreview} alt="Prévia" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={clearNewImage}
                    className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={isPending || !newCatName.trim()}
              className="w-full bg-gradient-to-r from-[#cc0000] to-[#d4af37] text-white font-bold text-xs h-9 shadow-xs hover:brightness-105"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              Adicionar
            </Button>
          </div>
        </form>
      </div>

      {/* Lista / árvore de categorias */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider">
              <Layers className="h-4 w-4 text-rose-600" /> Estrutura de Categorias ({flatCategories.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Escolha o <strong>Card</strong> de cada categoria, marque a <strong>estrela</strong> para a vitrine ou reordene nas setas.
            </p>
          </div>

          {/* Filtro rápido por Card */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterTopic("all")}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                filterTopic === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todas ({categoriesTree.length})
            </button>
            {CATALOG_TOPIC_LIST.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilterTopic(filterTopic === t.id ? "all" : t.id)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                  filterTopic === t.id
                    ? "bg-[#cc0000] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t.title} ({categoriesByTopic[t.id].length})
              </button>
            ))}
          </div>
        </div>

        {visibleCategoriesTree.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Nenhuma categoria encontrada neste card.
          </div>
        ) : (
          <div className="space-y-3">
            {visibleCategoriesTree.map((root, rootIndex) => {
              const isEditingRoot = editingId === root.id;
              const inGallery = root.show_in_gallery === true;
              const rootTopic = getCategoryNodeTopic(root);

              return (
                <div
                  key={root.id}
                  className={`rounded-lg border p-3 space-y-2 transition ${
                    inGallery ? "border-amber-200 bg-amber-50/30" : "border-slate-200 bg-slate-50/70"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {isEditingRoot ? (
                      renderEditRow(root.id)
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0">
                          {root.image_url ? (
                            <img
                              src={root.image_url}
                              alt={root.name}
                              className="h-9 w-9 shrink-0 rounded-md object-cover border border-slate-300 bg-white"
                            />
                          ) : (
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-amber-100" title="Sem foto">
                              <Tag className="h-4 w-4 text-amber-700" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <span className="block truncate text-xs font-bold text-slate-900">{root.name}</span>
                            <span className="text-[10px] text-slate-500">
                              Principal • Card: <strong>{CATALOG_TOPICS[rootTopic].title}</strong>
                              {root.children.length > 0 && ` • ${root.children.length} subcategorias`}
                              {!root.image_url && " • sem foto"}
                            </span>
                          </div>
                        </div>
                        {renderActions(root, rootIndex, visibleCategoriesTree.length, rootTopic, null)}
                      </>
                    )}
                  </div>

                  {root.children.length > 0 && (
                    <div className="ml-4 space-y-1.5 border-l-2 border-slate-200 pl-3 pt-1">
                      {root.children.map((sub, subIndex) => {
                        const isEditingSub = editingId === sub.id;
                        const subTopic = getCategoryNodeTopic(sub, rootTopic);
                        return (
                          <div
                            key={sub.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white px-2.5 py-1.5 text-xs text-slate-700 border border-slate-200/80 shadow-2xs"
                          >
                            {isEditingSub ? (
                              renderEditRow(sub.id, true)
                            ) : (
                              <>
                                <div className="flex items-center gap-2 min-w-0">
                                  <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
                                  {sub.image_url && (
                                    <img
                                      src={sub.image_url}
                                      alt={sub.name}
                                      className="h-6 w-6 shrink-0 rounded-md object-cover border border-slate-300"
                                    />
                                  )}
                                  <span className="truncate font-semibold text-slate-800">{sub.name}</span>
                                </div>
                                {renderActions(sub, subIndex, root.children.length, subTopic, rootTopic, true)}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
