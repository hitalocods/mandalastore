import { Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteNeighborhood, toggleNeighborhoodActive } from "@/app/actions/neighborhoods";
import { NeighborhoodForm } from "@/components/admin/neighborhood-form";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/utils";
import type { Neighborhood } from "@/types/neighborhood";

export function AdminNeighborhoods({ neighborhoods }: { neighborhoods: Neighborhood[] }) {
  return (
    <div className="space-y-3">
      {neighborhoods.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum bairro cadastrado.</p>
      ) : (
        neighborhoods.map((neighborhood) => (
          <div
            key={neighborhood.id}
            className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{neighborhood.name}</p>
                {!neighborhood.is_active && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Inativo</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Taxa: {formatCurrency(neighborhood.delivery_fee)} • Ordem: {neighborhood.sort_order}
              </p>
            </div>
            <form action={toggleNeighborhoodActive}>
              <input type="hidden" name="id" value={neighborhood.id} />
              <input type="hidden" name="is_active" value={String(neighborhood.is_active)} />
              <Button type="submit" variant="ghost" size="icon" className="h-8 w-8">
                {neighborhood.is_active ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
              </Button>
            </form>
            <Sheet>
              <SheetTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="premium-scrollbar overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Editar bairro</SheetTitle>
                </SheetHeader>
                <div className="px-6 pb-6">
                  <NeighborhoodForm neighborhood={neighborhood} />
                </div>
              </SheetContent>
            </Sheet>
            <form action={deleteNeighborhood}>
              <input type="hidden" name="id" value={neighborhood.id} />
              <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </form>
          </div>
        ))
      )}
    </div>
  );
}
