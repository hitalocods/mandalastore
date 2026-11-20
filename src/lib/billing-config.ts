export interface BillingRecord {
  id: string; // '2026-10'
  month_reference: string;
  status: "pending" | "paid";
  amount: number;
  due_date: string;
  preference_id?: string | null;
  payment_id?: string | null;
  payment_method?: string | null;
  paid_at?: string | null;
}

export interface BillingStatus {
  isBlocked: boolean;
  isWarningPeriod: boolean;
  isOverdue?: boolean;
  currentMonthRef: string;
  dueMonthRef: string;
  status: "pending" | "paid";
  amount: number;
  dueDateFormatted: string;
  dueDay: number;
  daysUntilDue: number;
  daysOverdue: number;
  preferenceId?: string | null;
  checkoutUrl?: string | null;
}

export const ABACATEPAY_CARD_CHECKOUT_URL =
  "https://app.abacatepay.com/pay/bill_3SrRcSesbk4Kd0zSh21cGKqL";
export const ABACATEPAY_BILL_ID = "bill_3SrRcSesbk4Kd0zSh21cGKqL";
