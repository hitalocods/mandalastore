import { sql } from "@/lib/db";

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

const DEFAULT_AMOUNT = 60.0;
const DUE_DAY = 20;

export const ABACATEPAY_CARD_CHECKOUT_URL =
  "https://app.abacatepay.com/pay/bill_3SrRcSesbk4Kd0zSh21cGKqL";
export const ABACATEPAY_BILL_ID = "bill_3SrRcSesbk4Kd0zSh21cGKqL";

/**
 * Retorna as partes da data no horário oficial de Brasília (America/Sao_Paulo)
 */
export function getBrasiliaDate(): {
  year: number;
  month: number; // 1 a 12
  day: number; // 1 a 31
  date: Date;
} {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const parts = formatter.formatToParts(now);
  const day = Number(parts.find((p) => p.type === "day")?.value || now.getDate());
  const month = Number(parts.find((p) => p.type === "month")?.value || now.getMonth() + 1);
  const year = Number(parts.find((p) => p.type === "year")?.value || now.getFullYear());

  return { year, month, day, date: now };
}

export function formatMonthRef(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getPreviousMonthRef(year: number, month: number): string {
  if (month === 1) {
    return `${year - 1}-12`;
  }
  return `${year}-${String(month - 1).padStart(2, "0")}`;
}

/**
 * Garante que a tabela system_billing existe no banco
 */
export async function ensureBillingTable(): Promise<void> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS system_billing (
        id TEXT PRIMARY KEY,
        month_reference TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'pending',
        amount DECIMAL(10, 2) NOT NULL DEFAULT 60.00,
        due_date DATE NOT NULL,
        preference_id TEXT,
        payment_id TEXT,
        payment_method TEXT,
        paid_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_system_billing_month ON system_billing(month_reference)
    `;
  } catch (error) {
    console.error("Erro ao verificar/criar tabela system_billing:", error);
  }
}

/**
 * Busca ou cria a cobrança do mês indicado
 */
export async function getOrCreateMonthBilling(
  monthRef: string,
  dueYear: number,
  dueMonth: number,
  dueDay = DUE_DAY
): Promise<BillingRecord> {
  await ensureBillingTable();

  try {
    const existing = await sql`
      SELECT id, month_reference, status, amount, due_date, preference_id, payment_id, payment_method, paid_at
      FROM system_billing
      WHERE month_reference = ${monthRef}
      LIMIT 1
    `;

    if (existing.length > 0) {
      const row = existing[0];
      return {
        id: row.id,
        month_reference: row.month_reference,
        status: row.status as "pending" | "paid",
        amount: Number(row.amount) || DEFAULT_AMOUNT,
        due_date: String(row.due_date),
        preference_id: row.preference_id,
        payment_id: row.payment_id,
        payment_method: row.payment_method,
        paid_at: row.paid_at ? String(row.paid_at) : null,
      };
    }

    const dueDateStr = `${dueYear}-${String(dueMonth).padStart(2, "0")}-${String(dueDay).padStart(2, "0")}`;
    const configuredAmount = Number(process.env.SYSTEM_MONTHLY_FEE) || DEFAULT_AMOUNT;

    await sql`
      INSERT INTO system_billing (id, month_reference, status, amount, due_date)
      VALUES (${monthRef}, ${monthRef}, 'pending', ${configuredAmount}, ${dueDateStr}::DATE)
      ON CONFLICT (month_reference) DO NOTHING
    `;

    return {
      id: monthRef,
      month_reference: monthRef,
      status: "pending",
      amount: configuredAmount,
      due_date: dueDateStr,
      preference_id: null,
      payment_id: null,
      payment_method: null,
      paid_at: null,
    };
  } catch (error) {
    console.error(`Erro ao obter/criar mensalidade para ${monthRef}:`, error);
    return {
      id: monthRef,
      month_reference: monthRef,
      status: "pending",
      amount: DEFAULT_AMOUNT,
      due_date: `${dueYear}-${String(dueMonth).padStart(2, "0")}-${dueDay}`,
    };
  }
}

/**
 * Avalia o status financeiro atual do sistema com base na data de hoje e regras de bloqueio
 */
export async function getBillingStatus(): Promise<BillingStatus> {
  const { year, month, day } = getBrasiliaDate();
  const currentMonthRef = formatMonthRef(year, month);
  const dueDay = Number(process.env.SYSTEM_PAYMENT_DUE_DAY) || DUE_DAY;

  // O painel NUNCA é bloqueado por atraso no pagamento (isBlocked permanece false).
  // Apenas calculamos os dias de atraso e período de aviso para exibir lembrete no painel.
  const isBlocked = false;
  let isWarningPeriod = false;
  let dueMonthRef = currentMonthRef;
  let targetYear = year;
  let targetMonth = month;
  let daysUntilDue = 0;
  let daysOverdue = 0;

  if (day >= dueDay + 1) {
    // Dia 21 em diante: o mês corrente já passou do dia 20.
    dueMonthRef = currentMonthRef;
    targetYear = year;
    targetMonth = month;
    daysOverdue = day - dueDay;
  } else {
    // Dia 1 até dia 20:
    daysUntilDue = dueDay - day;
    dueMonthRef = currentMonthRef;
    targetYear = year;
    targetMonth = month;

    // Se estiver entre os dias 15 e 20, ativa o período de aviso prévio
    if (day >= 15 && day <= dueDay) {
      isWarningPeriod = true;
    }

    // Verifica se o mês anterior ficou pendente
    const prevMonthRef = getPreviousMonthRef(year, month);
    try {
      const prevRows = await sql`
        SELECT status FROM system_billing WHERE month_reference = ${prevMonthRef} LIMIT 1
      `;
      if (prevRows.length > 0 && prevRows[0].status === "pending") {
        dueMonthRef = prevMonthRef;
        daysOverdue = day + 10;
      }
    } catch {
      // Ignora erro de consulta do mês anterior
    }
  }

  const activeBilling = await getOrCreateMonthBilling(dueMonthRef, targetYear, targetMonth, dueDay);
  const isOverdue = daysOverdue > 0 && activeBilling.status !== "paid";

  if (activeBilling.status === "paid") {
    isWarningPeriod = false;
  } else if (isOverdue) {
    isWarningPeriod = true;
  }

  const dueDateFormatted = `${String(dueDay).padStart(2, "0")}/${String(targetMonth).padStart(2, "0")}/${targetYear}`;

  return {
    isBlocked,
    isWarningPeriod,
    isOverdue,
    currentMonthRef,
    dueMonthRef,
    status: activeBilling.status,
    amount: activeBilling.amount,
    dueDateFormatted,
    dueDay,
    daysUntilDue,
    daysOverdue,
    preferenceId: activeBilling.preference_id || ABACATEPAY_BILL_ID,
    checkoutUrl: ABACATEPAY_CARD_CHECKOUT_URL,
  };
}

/**
 * Retorna o link direto de pagamento via Cartão no AbacatePay
 */
export async function getOrCreateAbacatePayCheckout(
  monthRef: string,
  _baseUrl?: string
): Promise<{
  initPoint: string;
  preferenceId: string;
  qrCode?: string | null;
  pixCopyPaste?: string | null;
}> {
  void _baseUrl;
  const [yearStr, monthStr] = monthRef.split("-");
  await getOrCreateMonthBilling(monthRef, Number(yearStr), Number(monthStr));

  try {
    await sql`
      UPDATE system_billing
      SET preference_id = ${ABACATEPAY_BILL_ID}, updated_at = CURRENT_TIMESTAMP
      WHERE month_reference = ${monthRef}
    `;
  } catch (e) {
    console.error("Erro ao atualizar preference_id no banco:", e);
  }

  return {
    initPoint: ABACATEPAY_CARD_CHECKOUT_URL,
    preferenceId: ABACATEPAY_BILL_ID,
    qrCode: null,
    pixCopyPaste: null,
  };
}

// Alias para compatibilidade
export const getOrCreateMercadoPagoPreference = getOrCreateAbacatePayCheckout;

/**
 * Marca uma mensalidade como paga
 */
export async function markBillingAsPaid(
  monthRef: string,
  paymentId?: string,
  paymentMethod?: string
): Promise<void> {
  await ensureBillingTable();
  await sql`
    UPDATE system_billing
    SET status = 'paid',
        paid_at = CURRENT_TIMESTAMP,
        payment_id = COALESCE(${paymentId || null}, payment_id),
        payment_method = COALESCE(${paymentMethod || null}, payment_method),
        updated_at = CURRENT_TIMESTAMP
    WHERE month_reference = ${monthRef}
  `;
}

/**
 * Consulta a API da AbacatePay para verificar se a cobrança foi paga
 */
export async function checkAbacatePayPaymentStatus(monthRef: string): Promise<boolean> {
  const token = process.env.ABACATEPAY_API_KEY;
  if (!token) return false;

  try {
    const [yearStr, monthStr] = monthRef.split("-");
    const billing = await getOrCreateMonthBilling(monthRef, Number(yearStr), Number(monthStr));

    // Se tiver id de PIX transparente (ex: pix_char_...)
    if (billing.preference_id && billing.preference_id.startsWith("pix_char_")) {
      try {
        const checkRes = await fetch(
          `https://api.abacatepay.com/v2/transparents/check?id=${billing.preference_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }
        );
        if (checkRes.ok) {
          const checkJson = await checkRes.json();
          if (checkJson.data?.status === "PAID") {
            await markBillingAsPaid(monthRef, billing.preference_id, "PIX/AbacatePay");
            return true;
          }
        }
      } catch (e) {
        console.warn("Erro ao checar transparent pix:", e);
      }
    }

    // Consulta também lista de checkouts
    const res = await fetch("https://api.abacatepay.com/v2/checkouts/list", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return false;

    const json = await res.json();
    const checkouts = json.data || [];

    interface AbacateCheckout {
      id?: string;
      externalId?: string | null;
      status?: string;
      paidAmount?: number | null;
    }

    const matchedCheckout = checkouts.find((c: AbacateCheckout) => {
      const matchId =
        (billing.preference_id && c.id === billing.preference_id) ||
        c.id === ABACATEPAY_BILL_ID;
      const matchExt = c.externalId === `billing-${monthRef}`;
      return matchId || matchExt;
    });

    if (
      matchedCheckout &&
      (matchedCheckout.status === "PAID" ||
        (matchedCheckout.paidAmount && matchedCheckout.paidAmount > 0))
    ) {
      await markBillingAsPaid(monthRef, matchedCheckout.id, "Cartão/AbacatePay");
      return true;
    }
  } catch (error) {
    console.error("Erro ao consultar pagamentos no AbacatePay:", error);
  }

  return false;
}

// Alias para compatibilidade
export const checkMercadoPagoPaymentStatus = checkAbacatePayPaymentStatus;


