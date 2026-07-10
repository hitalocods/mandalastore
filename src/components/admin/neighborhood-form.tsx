"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { createNeighborhood, updateNeighborhood } from "@/app/actions/neighborhoods";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Neighborhood } from "@/types/neighborhood";

export function NeighborhoodForm({ neighborhood }: { neighborhood?: Neighborhood }) {
  const [isActive, setIsActive] = useState(neighborhood?.is_active ?? true);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        formData.set("is_active", String(isActive));
        startTransition(async () => {
          try {
            if (neighborhood) {
              await updateNeighborhood(formData);
              toast.success("Bairro atualizado");
            } else {
              await createNeighborhood(formData);
              toast.success("Bairro criado");
            }
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Falha ao salvar bairro");
          }
        });
      }}
      className="grid gap-4"
    >
      {neighborhood && <input type="hidden" name="id" value={neighborhood.id} />}
      <div className="grid gap-2">
        <Label htmlFor={neighborhood ? `name-${neighborhood.id}` : "name"}>Nome do Bairro</Label>
        <Input
          id={neighborhood ? `name-${neighborhood.id}` : "name"}
          name="name"
          defaultValue={neighborhood?.name}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor={neighborhood ? `delivery_fee-${neighborhood.id}` : "delivery_fee"}>Taxa de Entrega</Label>
          <Input
            id={neighborhood ? `delivery_fee-${neighborhood.id}` : "delivery_fee"}
            name="delivery_fee"
            type="number"
            min="0"
            step="0.01"
            defaultValue={neighborhood?.delivery_fee ?? 0}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={neighborhood ? `sort_order-${neighborhood.id}` : "sort_order"}>Ordem</Label>
          <Input
            id={neighborhood ? `sort_order-${neighborhood.id}` : "sort_order"}
            name="sort_order"
            type="number"
            min="0"
            step="1"
            defaultValue={neighborhood?.sort_order ?? 0}
            required
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id={neighborhood ? `is_active-${neighborhood.id}` : "is_active"}
          checked={isActive}
          onCheckedChange={setIsActive}
        />
        <Label htmlFor={neighborhood ? `is_active-${neighborhood.id}` : "is_active"} className="cursor-pointer">
          Bairro ativo
        </Label>
      </div>
      <div className="pt-1">
        <Button disabled={isPending} className="rounded-full">
          {neighborhood ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {neighborhood ? "Salvar alterações" : "Adicionar bairro"}
        </Button>
      </div>
    </form>
  );
}
