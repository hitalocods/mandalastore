export type DeliveryType = "pickup" | "delivery";

export type PaymentMethod = "money" | "pix" | "debit" | "credit";

export type DeliveryOption = "mototaxi";

export type CheckoutData = {
  deliveryType: DeliveryType;
  fullName: string;
  whatsapp: string;
  paymentMethod: PaymentMethod;
  installments?: number;
  needsChange?: boolean;
  changeFor?: number;
  neighborhoodId?: string;
  address?: string;
  number?: string;
  complement?: string;
  reference?: string;
  deliveryOption?: DeliveryOption;
};
