import { getBillingStatus } from "@/services/billing";
import { PaymentWarningBanner } from "@/components/admin/payment-warning-banner";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verifica o status de faturamento da plataforma
  const billingStatus = await getBillingStatus();

  // O painel NUNCA é bloqueado, mesmo em caso de atraso ou demora para pagar.
  // Apenas exibimos o banner informativo para permitir pagamento fácil via PIX.
  const showPaymentBanner =
    billingStatus.status !== "paid" &&
    (billingStatus.isWarningPeriod || billingStatus.isOverdue || billingStatus.daysOverdue > 0);

  return (
    <AdminShell billingStatus={billingStatus}>
      {showPaymentBanner && (
        <div className="mb-6">
          <PaymentWarningBanner billing={billingStatus} />
        </div>
      )}
      {children}
    </AdminShell>
  );
}
