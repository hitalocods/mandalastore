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

  // Se hoje for até dia 20: o mês atual vence dia 20.
  // O que já DEVERIA estar pago para não bloquear é o mês anterior (se hoje for até dia 20).
  // Porém, a partir do dia 21: o mês ATUAL já deveria estar pago! Se não estiver, BLOQUEIA.
  let isBlocked = false;
  let isWarningPeriod = false;
  let dueMonthRef = currentMonthRef;
  let targetYear = year;
  let targetMonth = month;
  let daysUntilDue = 0;
  let daysOverdue = 0;

  if (day >= dueDay + 1) {
    // Dia 21 em diante: o mês corrente já venceu no dia 20.
    dueMonthRef = currentMonthRef;
    targetYear = year;
    targetMonth = month;
    daysOverdue = day - dueDay;

    const billing = await getOrCreateMonthBilling(dueMonthRef, targetYear, targetMonth, dueDay);
    if (billing.status !== "paid") {
      isBlocked = true;
    }
  } else {
    // Dia 1 até dia 20:
    // O mês corrente ainda não venceu (faltam X dias).
    daysUntilDue = dueDay - day;
    dueMonthRef = currentMonthRef;
    targetYear = year;
    targetMonth = month;

    // Se estiver entre os dias 15 e 20, ativa o período de aviso prévio
    if (day >= 15 && day <= dueDay) {
      const currentBilling = await getOrCreateMonthBilling(dueMonthRef, targetYear, targetMonth, dueDay);
      if (currentBilling.status !== "paid") {
        isWarningPeriod = true;
      }
    }

    // Verifica se o mês anterior ficou inadimplente
    const prevMonthRef = getPreviousMonthRef(year, month);
    // Checa se existe registro pendente para o mês anterior
    try {
      const prevRows = await sql`
        SELECT status FROM system_billing WHERE month_reference = ${prevMonthRef} LIMIT 1
      `;
      if (prevRows.length > 0 && prevRows[0].status === "pending") {
        isBlocked = true;
        dueMonthRef = prevMonthRef;
        daysOverdue = day + 10; // dias decorridos desde o dia 20 do mês passado
      }
    } catch {
      // Ignora erro de consulta do mês anterior
    }
  }

  const activeBilling = await getOrCreateMonthBilling(dueMonthRef, targetYear, targetMonth, dueDay);

  const dueDateFormatted = `${String(dueDay).padStart(2, "0")}/${String(targetMonth).padStart(2, "0")}/${targetYear}`;

  return {
    isBlocked,
    isWarningPeriod,
    currentMonthRef,
    dueMonthRef,
    status: activeBilling.status,
    amount: activeBilling.amount,
    dueDateFormatted,
    dueDay,
    daysUntilDue,
    daysOverdue,
    preferenceId: activeBilling.preference_id,
  };
}

/**
 * Cria ou recupera a preferência no Mercado Pago Checkout Pro
 */
export async function getOrCreateMercadoPagoPreference(
  monthRef: string,
  baseUrl: string
): Promise<{ initPoint: string; preferenceId: string }> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado no .env");
  }

  const [yearStr, monthStr] = monthRef.split("-");
  const monthNum = Number(monthStr);
  const yearNum = Number(yearStr);
  const billing = await getOrCreateMonthBilling(monthRef, yearNum, monthNum);

  // Se já tem preferência salva, verifica se podemos reutilizar
  // Para evitar criar centenas de preferências repetidas
  if (billing.preference_id) {
    try {
      const checkRes = await fetch(
        `https://api.mercadopago.com/checkout/preferences/${billing.preference_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (checkRes.ok) {
        const prefData = await checkRes.json();
        if (prefData.init_point) {
          return {
            initPoint: prefData.init_point,
            preferenceId: billing.preference_id,
          };
        }
      }
    } catch (e) {
      console.warn("Não foi possível reutilizar preferência antiga, gerando nova:", e);
    }
  }

  // Gera nova preferência
  const safeBaseUrl = baseUrl.replace(/\/$/, "");
  const payload = {
    items: [
      {
        id: `mensalidade-${monthRef}`,
        title: `Mensalidade Plataforma Mandala Prime (${monthStr}/${yearStr})`,
        description: `Manutenção, suporte e hospedagem da loja virtual Mandala Prime referente a ${monthStr}/${yearStr}. Vencimento dia 20.`,
        quantity: 1,
        unit_price: Number(billing.amount) || DEFAULT_AMOUNT,
        currency_id: "BRL",
      },
    ],
    external_reference: `billing-${monthRef}`,
    back_urls: {
      success: `${safeBaseUrl}/admin?payment_status=success&ref=${monthRef}`,
      failure: `${safeBaseUrl}/admin?payment_status=failure&ref=${monthRef}`,
      pending: `${safeBaseUrl}/admin?payment_status=pending&ref=${monthRef}`,
    },
    auto_return: "approved",
    statement_descriptor: "MANDALA PRIME",
    notification_url: `${safeBaseUrl}/api/webhooks/mercadopago`,
  };

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Erro Mercado Pago Checkout Preferences:", errorData);
    throw new Error(`Falha ao criar checkout do Mercado Pago: ${response.statusText}`);
  }

  const data = await response.json();
  const initPoint = data.init_point;
  const preferenceId = data.id;

  // Salva no banco
  try {
    await sql`
      UPDATE system_billing
      SET preference_id = ${preferenceId}, updated_at = CURRENT_TIMESTAMP
      WHERE month_reference = ${monthRef}
    `;
  } catch (e) {
    console.error("Erro ao atualizar preference_id no banco:", e);
  }

  return { initPoint, preferenceId };
}

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
 * Consulta a API do Mercado Pago para verificar se há algum pagamento aprovado recente para a mensalidade
 */
export async function checkMercadoPagoPaymentStatus(monthRef: string): Promise<boolean> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return false;

  try {
    const searchUrl = `https://api.mercadopago.com/v1/payments/search?external_reference=billing-${monthRef}&sort=date_created&criteria=desc`;
    const res = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return false;

    const data = await res.json();
    const payments = data.results || [];

    // Procura por algum pagamento aprovado
    interface MercadoPagoPaymentResult {
      id?: string | number;
      status?: string;
      payment_type_id?: string;
      payment_method_id?: string;
    }
    const approved = payments.find((p: MercadoPagoPaymentResult) => p.status === "approved");
    if (approved && approved.id) {
      await markBillingAsPaid(
        monthRef,
        String(approved.id),
        approved.payment_type_id || approved.payment_method_id
      );
      return true;
    }
  } catch (error) {
    console.error("Erro ao consultar pagamentos no Mercado Pago:", error);
  }

  return false;
}
