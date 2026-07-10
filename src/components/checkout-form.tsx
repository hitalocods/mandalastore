"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import type { DeliveryType, PaymentMethod, CheckoutData } from "@/types/checkout";
import type { Neighborhood } from "@/types/neighborhood";

type CheckoutFormProps = {
  neighborhoods: Neighborhood[];
  subtotal: number;
  onFinish: (data: CheckoutData, deliveryFee: number) => void;
};

export function CheckoutForm({ neighborhoods, subtotal, onFinish }: CheckoutFormProps) {
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("pickup");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [installments, setInstallments] = useState(1);
  const [needsChange, setNeedsChange] = useState(false);
  const [changeFor, setChangeFor] = useState("");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [reference, setReference] = useState("");

  const hasNeighborhoods = neighborhoods.length > 0;
  const selectedNeighborhood = neighborhoods.find((n) => n.id === neighborhoodId);
  const subtotalValue = Number(subtotal) || 0;
  const deliveryFee = deliveryType === "delivery" && selectedNeighborhood ? Number(selectedNeighborhood.delivery_fee) || 0 : 0;
  const total = subtotalValue + deliveryFee;
  const isSubmitDisabled = deliveryType === "delivery" && !selectedNeighborhood;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (deliveryType === "delivery" && !selectedNeighborhood) {
      return;
    }

    const data: CheckoutData = {
      deliveryType,
      fullName,
      whatsapp,
      paymentMethod,
    };

    if (paymentMethod === "credit") {
      data.installments = installments;
    }

    if (paymentMethod === "money" && needsChange) {
      data.needsChange = true;
      data.changeFor = parseFloat(changeFor);
    }

    if (deliveryType === "delivery") {
      data.deliveryOption = "mototaxi";
      data.neighborhoodId = neighborhoodId;
      data.address = address;
      data.number = number;
      data.complement = complement;
      data.reference = reference;
    }

    onFinish(data, deliveryFee);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base font-semibold">Tipo de Entrega</Label>
        <RadioGroup value={deliveryType} onValueChange={(value: string) => setDeliveryType(value as DeliveryType)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pickup" id="pickup" />
            <Label htmlFor="pickup" className="cursor-pointer">
              Retirada
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="delivery" id="delivery" disabled={!hasNeighborhoods} />
            <Label htmlFor="delivery" className={`cursor-pointer ${!hasNeighborhoods ? "text-muted-foreground" : ""}`}>
              Entrega {!hasNeighborhoods ? "(indisponível)" : ""}
            </Label>
          </div>
        </RadioGroup>
        {!hasNeighborhoods && (
          <p className="text-xs text-muted-foreground">No momento, não há bairros ativos para entrega.</p>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="fullName">Nome Completo</Label>
        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </div>

      <div className="space-y-3">
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required />
      </div>

      {deliveryType === "delivery" && (
        <>
          <div className="space-y-3">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Select value={neighborhoodId} onValueChange={setNeighborhoodId}>
              <SelectTrigger id="neighborhood">
                <SelectValue placeholder="Selecione o bairro" />
              </SelectTrigger>
              <SelectContent>
                {neighborhoods.map((neighborhood) => (
                  <SelectItem key={neighborhood.id} value={neighborhood.id}>
                    {neighborhood.name} - {formatCurrency(neighborhood.delivery_fee)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="address">Endereço Completo</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>

          <div className="space-y-3">
            <Label htmlFor="number">Número</Label>
            <Input id="number" value={number} onChange={(e) => setNumber(e.target.value)} required />
          </div>

          <div className="space-y-3">
            <Label htmlFor="complement">Complemento (opcional)</Label>
            <Input id="complement" value={complement} onChange={(e) => setComplement(e.target.value)} />
          </div>

          <div className="space-y-3">
            <Label htmlFor="reference">Ponto de Referência (opcional)</Label>
            <Input id="reference" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <p className="font-medium">Tipo de entrega</p>
            <p className="text-muted-foreground">Moto Táxi da Loja</p>
          </div>
        </>
      )}

      <div className="space-y-3">
        <Label className="text-base font-semibold">Forma de Pagamento</Label>
        <RadioGroup value={paymentMethod} onValueChange={(value: string) => setPaymentMethod(value as PaymentMethod)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="money" id="money" />
            <Label htmlFor="money" className="cursor-pointer">
              Dinheiro
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pix" id="pix" />
            <Label htmlFor="pix" className="cursor-pointer">
              Pix
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="debit" id="debit" />
            <Label htmlFor="debit" className="cursor-pointer">
              Cartão de Débito
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="credit" id="credit" />
            <Label htmlFor="credit" className="cursor-pointer">
              Cartão de Crédito
            </Label>
          </div>
        </RadioGroup>
      </div>

      {paymentMethod === "credit" && (
        <div className="space-y-3">
          <Label htmlFor="installments">Parcelamento</Label>
          <Select value={String(installments)} onValueChange={(value) => setInstallments(Number(value))}>
            <SelectTrigger id="installments">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SelectItem key={i} value={String(i)}>
                  {i}x
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {paymentMethod === "money" && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="needsChange" checked={needsChange} onCheckedChange={(checked: boolean) => setNeedsChange(checked)} />
            <Label htmlFor="needsChange" className="cursor-pointer">
              Precisa de troco?
            </Label>
          </div>
          {needsChange && (
            <div className="space-y-3">
              <Label htmlFor="changeFor">Troco para</Label>
              <Input
                id="changeFor"
                type="number"
                min="0"
                step="0.01"
                value={changeFor}
                onChange={(e) => setChangeFor(e.target.value)}
                placeholder="R$"
              />
            </div>
          )}
        </div>
      )}

      <div className="space-y-2 border-t pt-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotalValue)}</span>
        </div>
        {deliveryFee > 0 && (
          <div className="flex justify-between text-sm">
            <span>Taxa de entrega</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <Button type="submit" className="h-12 w-full rounded-full" disabled={isSubmitDisabled}>
        Finalizar Pedido
      </Button>
    </form>
  );
}
