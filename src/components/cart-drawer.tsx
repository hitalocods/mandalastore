"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/store/cart-store";
import { CheckoutForm } from "@/components/checkout-form";
import type { CheckoutData } from "@/types/checkout";
import type { Neighborhood } from "@/types/neighborhood";
import { SITE_CONFIG } from "@/lib/site-config";

type CartDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  neighborhoods: Neighborhood[];
};

export function CartDrawer({ open, onOpenChange, neighborhoods }: CartDrawerProps) {
  const { items, subtotal, removeItem, setQuantity, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleStartCheckout = () => {
    setShowCheckout(true);
  };

  const handleBackToCart = () => {
    setShowCheckout(false);
  };

  const formatWhatsAppMessage = (data: CheckoutData, deliveryFee: number) => {
    const total = subtotal + deliveryFee;
    const isDelivery = data.deliveryType === "delivery";
    const paymentMethodText = {
      money: "Dinheiro",
      pix: "Pix",
      debit: "Cartão de Débito",
      credit: "Cartão de Crédito",
    }[data.paymentMethod];

    let paymentDetails = paymentMethodText;
    if (data.paymentMethod === "credit" && data.installments) {
      paymentDetails += ` (${data.installments}x)`;
    } else if (data.paymentMethod === "money") {
      if (data.needsChange && data.changeFor) {
        paymentDetails += ` (Troco para ${formatCurrency(Number(data.changeFor))})`;
      } else {
        paymentDetails += " (Não precisa de troco)";
      }
    }

    const lines: string[] = [];

    lines.push(`*NOVO PEDIDO — ${SITE_CONFIG.name.toUpperCase()}*`);
    lines.push("----------------------------------------");
    lines.push("");

    // Cliente
    lines.push("*CLIENTE*");
    lines.push(`• *Nome:* ${data.fullName}`);
    lines.push(`• *WhatsApp:* ${data.whatsapp}`);
    lines.push(`• *Recebimento:* ${isDelivery ? "Entrega" : "Retirada no Local"}`);
    lines.push("");

    // Endereço de entrega (se aplicável)
    if (isDelivery) {
      const neighborhood = neighborhoods.find((n: Neighborhood) => n.id === data.neighborhoodId);
      lines.push("*ENDEREÇO DE ENTREGA*");
      if (neighborhood?.name) lines.push(`• *Bairro:* ${neighborhood.name}`);
      lines.push(`• *Endereço:* ${data.address}, Nº ${data.number}`);
      if (data.complement && data.complement.trim()) {
        lines.push(`• *Complemento:* ${data.complement.trim()}`);
      }
      if (data.reference && data.reference.trim()) {
        lines.push(`• *Referência:* ${data.reference.trim()}`);
      }
      lines.push("• *Forma de Envio:* Moto Táxi da Loja");
      lines.push("");
    }

    // Itens
    lines.push("*ITENS DO PEDIDO*");
    items.forEach((item) => {
      const itemPrice = item.selectedPrice ?? item.product.price;
      const details: string[] = [];
      if (item.selectedSize) details.push(`Tam: ${item.selectedSize}`);
      if (item.selectedColor) details.push(`Cor: ${item.selectedColor}`);
      const detailsText = details.length > 0 ? ` (${details.join(", ")})` : "";
      const itemTotal = formatCurrency(itemPrice * item.quantity);
      lines.push(`• ${item.quantity}x ${item.product.name}${detailsText} — *${itemTotal}*`);
    });
    lines.push("");

    // Valores e Pagamento
    lines.push("*PAGAMENTO & VALORES*");
    lines.push(`• *Forma de Pagamento:* ${paymentDetails}`);
    lines.push(`• *Subtotal:* ${formatCurrency(subtotal)}`);
    if (deliveryFee > 0) {
      lines.push(`• *Taxa de Entrega:* ${formatCurrency(deliveryFee)}`);
    }
    lines.push(`• *TOTAL DO PEDIDO:* *${formatCurrency(total)}*`);
    lines.push("");
    lines.push("----------------------------------------");
    lines.push("_Pedido realizado pelo site oficial._");

    return encodeURIComponent(lines.join("\n"));
  };

  const finishOrder = async (data: CheckoutData, deliveryFee: number) => {
    const neighborhood = neighborhoods.find((n: Neighborhood) => n.id === data.neighborhoodId);

    // Salva o pedido no banco de dados para aparecer no painel de admin
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: data.fullName,
          customerWhatsapp: data.whatsapp,
          deliveryType: data.deliveryType,
          neighborhoodId: data.neighborhoodId || null,
          neighborhoodName: neighborhood?.name || null,
          address: data.address || null,
          addressNumber: data.number || null,
          complement: data.complement || null,
          reference: data.reference || null,
          deliveryFee,
          subtotal,
          total: subtotal + deliveryFee,
          paymentMethod: data.paymentMethod,
          paymentDetails: {
            installments: data.installments,
            needsChange: data.needsChange,
            changeFor: data.changeFor,
          },
          items: items.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.selectedPrice ?? item.product.price,
            quantity: item.quantity,
            size: item.selectedSize || null,
            color: item.selectedColor || null,
            imageUrl: item.product.image_url || null,
          })),
        }),
      });
    } catch (e) {
      console.error("Erro ao registrar pedido:", e);
    }

    const message = formatWhatsAppMessage(data, deliveryFee);
    const phone = SITE_CONFIG.whatsappNumber;
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${message}`, "_blank", "noopener,noreferrer");
    clearCart();
    setShowCheckout(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-black">
            {showCheckout ? (
              <button onClick={handleBackToCart} className="flex items-center gap-2 text-sm">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Carrinho
              </button>
            ) : (
              "Carrinho"
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="premium-scrollbar flex-1 overflow-y-auto px-4 sm:px-6">
          {showCheckout ? (
            <CheckoutForm neighborhoods={neighborhoods} subtotal={subtotal} onFinish={finishOrder} />
          ) : items.length === 0 ? (
            <div className="flex h-full min-h-80 flex-col items-center justify-center gap-3 text-center">
              <div className="rounded-full border p-4">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <p className="text-sm text-black">Seu carrinho esta vazio.</p>
            </div>
          ) : (
            <div className="space-y-4 pb-6 sm:space-y-5">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 sm:gap-4">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-20">
                    {item.product.image_url && (
                      <img src={item.product.image_url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-black">{item.product.name}</p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {item.selectedSize && (
                            <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-300/60">
                              Tamanho: {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="inline-block rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-900 border border-rose-200">
                              Cor: {item.selectedColor}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-black mt-0.5">{formatCurrency(item.selectedPrice ?? item.product.price)}</p>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex w-fit items-center rounded-full border">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {!showCheckout && (
          <div className="border-t p-4 sm:p-6">
            <div className="mb-3 rounded-lg border border-amber-300/70 bg-amber-50/70 p-2.5 text-center text-xs text-amber-950 font-medium">
              💳 Parcelamos em até <strong>3x</strong> nas compras a partir de <strong>R$ 100,00</strong>.
            </div>
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-black">Subtotal</span>
              <strong className="text-lg text-black">{formatCurrency(subtotal)}</strong>
            </div>
            <Button className="h-12 w-full rounded-full" disabled={!items.length} onClick={handleStartCheckout}>
              Finalizar Pedido
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
