"use client";

import { useState, useTransition } from "react";
import { FolderPlus, Trash2, Edit2, ChevronRight, Layers, Tag, Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/categories";
import type { Category, CategoryWithChildren } from "@/types/category";

type CategoryManagerProps = {
  categoriesTree: CategoryWithChildren[];
  flatCategories: Category[];
};

export function CategoryManager({ categoriesTree, flatCategories }: CategoryManagerProps) {
  const [isPending, startTransition] = useTransition();

  // Create form state
  const [newCatName, setNewCatName] = useState("");
  const [newParentId, setNewParentId] = useState<string>("none");

  // Edit modal / inline state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editParentId, setEditParentId] = useState<string>("none");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const formData = new FormData();
    formData.append("name", newCatName);
    formData.append("parent_id", newParentId);

    startTransition(async () => {
      const res = await createCategory(formData);
      if (res.success) {
        setNewCatName("");
        setNewParentId("none");
      }
    });
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditParentId(cat.parent_id || "none");
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;

    const formData = new FormData();
    formData.append("id", id);
    formData.append("name", editName);
    formData.append("parent_id", editParentId);

    startTransition(async () => {
      const res = await updateCategory(formData);
      if (res.success) {
        setEditingId(null);
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
      await deleteCategory(formData);
    });
  };

  return (
    <div className="space-y-6">
      {/* Create New Category Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider">
          <FolderPlus className="h-4 w-4 text-amber-600" /> Nova Categoria / Subcategoria
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Cadastre uma nova categoria principal ou vincule a uma categoria existente para criar uma subcategoria.
        </p>

        <form onSubmit={handleCreate} className="mt-4 grid gap-3 sm:grid-cols-12 items-end">
          <div className="sm:col-span-5">
            <label className="text-[11px] font-semibold text-slate-700">Nome da Categoria</label>
            <Input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Ex: Roupas, Charutos..."
              className="mt-1 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-500"
              required
            />
          </div>

          <div className="sm:col-span-5">
            <label className="text-[11px] font-semibold text-slate-700">Tipo / Categoria Pai</label>
            <select
              value={newParentId}
              onChange={(e) => setNewParentId(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500"
            >
              <option value="none">Principal (Sem categoria pai)</option>
              {categoriesTree.map((root) => (
                <option key={root.id} value={root.id}>
                  Subcategoria de: {root.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={isPending || !newCatName.trim()}
              className="w-full bg-gradient-to-r from-[#cc0000] to-[#d4af37] text-white font-bold text-xs py-2 shadow-xs hover:brightness-105"
            >
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </div>
        </form>
      </div>

      {/* List of Categories Tree */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider">
              <Layers className="h-4 w-4 text-rose-600" /> Estrutura de Categorias ({flatCategories.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Categorias e suas respectivas subcategorias cadastradas</p>
          </div>
        </div>

        {categoriesTree.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">Nenhuma categoria cadastrada ainda.</div>
        ) : (
          <div className="space-y-3">
            {categoriesTree.map((root) => {
              const isEditingRoot = editingId === root.id;

              return (
                <div key={root.id} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    {isEditingRoot ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8 bg-white border-amber-500 text-xs text-slate-900"
                        />
                        <Button
                          size="icon"
                          onClick={() => handleSaveEdit(root.id)}
                          className="h-8 w-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          className="h-8 w-8 text-slate-500 hover:text-slate-900"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="grid h-7 w-7 place-items-center rounded-md bg-amber-100 text-amber-800">
                          <Tag className="h-3.5 w-3.5 text-amber-700" />
                        </span>
                        <span className="text-xs font-bold text-slate-900">{root.name}</span>
                        <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] text-slate-700 font-semibold">
                          Principal
                        </span>
                        {root.children && root.children.length > 0 && (
                          <span className="rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] text-amber-800 font-semibold">
                            {root.children.length} subcategorias
                          </span>
                        )}
                      </div>
                    )}

                    {!isEditingRoot && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleStartEdit(root)}
                          className="h-7 w-7 text-slate-500 hover:bg-white hover:text-slate-900"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(root.id, root.name)}
                          className="h-7 w-7 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Render Children / Subcategories */}
                  {root.children && root.children.length > 0 && (
                    <div className="ml-5 space-y-1.5 border-l-2 border-slate-200 pl-3 pt-1">
                      {root.children.map((sub) => {
                        const isEditingSub = editingId === sub.id;

                        return (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between rounded-md bg-white px-3 py-1.5 text-xs text-slate-700 border border-slate-200/80 shadow-2xs"
                          >
                            {isEditingSub ? (
                              <div className="flex items-center gap-2 flex-1">
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="h-7 bg-white border-amber-500 text-xs text-slate-900"
                                />
                                <Button
                                  size="icon"
                                  onClick={() => handleSaveEdit(sub.id)}
                                  className="h-7 w-7 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setEditingId(null)}
                                  className="h-7 w-7 text-slate-500"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <ChevronRight className="h-3 w-3 text-slate-400" />
                                <span className="font-semibold text-slate-800">{sub.name}</span>
                                <span className="text-[10px] text-slate-400">(Subcategoria)</span>
                              </div>
                            )}

                            {!isEditingSub && (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleStartEdit(sub)}
                                  className="h-6 w-6 text-slate-400 hover:text-slate-800"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDelete(sub.id, sub.name)}
                                  className="h-6 w-6 text-rose-600 hover:text-rose-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
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
