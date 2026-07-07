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
    const deliveryTypeText = data.deliveryType === "pickup" ? "Retirada" : "Entrega";
    const paymentMethodText = {
      money: "Dinheiro",
      pix: "Pix",
      debit: "Cartão de Débito",
      credit: "Cartão de Crédito",
    }[data.paymentMethod];

    let message = `🛒 NOVO PEDIDO\n\n--------------------------------\n\nTipo:\n${deliveryTypeText}\n\n--------------------------------\n\nCliente\n\nNome:\n${data.fullName}\n\nWhatsApp:\n${data.whatsapp}\n\n--------------------------------\n\nItens\n\n`;

    items.forEach((item) => {
      message += `${item.quantity}x ${item.product.name}\n`;
    });

    message += `\n--------------------------------\n\nSubtotal\n\n${formatCurrency(subtotal)}\n\n`;

    if (deliveryFee > 0) {
      message += `Taxa de entrega\n\n${formatCurrency(deliveryFee)}\n\n`;
    }

    message += `Total\n\n${formatCurrency(total)}\n\n--------------------------------\n\nPagamento\n\n${paymentMethodText}\n\n`;

    if (data.paymentMethod === "credit" && data.installments) {
      message += `${data.installments}x\n\n`;
    }

    if (data.paymentMethod === "money" && data.needsChange && data.changeFor) {
      message += `Troco para R$${formatCurrency(data.changeFor)}\n\n`;
    }

    if (data.deliveryType === "delivery") {
      const neighborhood = neighborhoods.find((n: Neighborhood) => n.id === data.neighborhoodId);
      message += `--------------------------------\n\nSe entrega:\n\nBairro:\n${neighborhood?.name || ""}\n\nEndereço:\n${data.address}\n\nNúmero:\n${data.number}\n\nComplemento:\n${data.complement || ""}\n\nReferência:\n${data.reference || ""}\n\nEntrega:\n${data.deliveryOption === "mototaxi" ? "Moto Táxi" : "Entrega da Loja"}\n\n`;
    }

    message += `--------------------------------\n\nPedido realizado pelo site.`;

    return encodeURIComponent(message);
  };

  const finishOrder = (data: CheckoutData, deliveryFee: number) => {
    const message = formatWhatsAppMessage(data, deliveryFee);
    const phone = "5586988269144";
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener,noreferrer");
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
                <div key={item.product.id} className="flex gap-3 sm:gap-4">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-20">
                    {item.product.image_url && (
                      <img src={item.product.image_url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-black">{item.product.name}</p>
                        <p className="text-xs text-black">{formatCurrency(item.product.price)}</p>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeItem(item.product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex w-fit items-center rounded-full border">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setQuantity(item.product.id, item.quantity + 1)}
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
