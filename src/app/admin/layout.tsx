import { isAdminAuthenticated } from "@/lib/auth";
import { getBillingStatus } from "@/services/billing";
import { PaymentBlockedScreen } from "@/components/admin/payment-blocked-screen";
import { PaymentWarningBanner } from "@/components/admin/payment-warning-banner";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await isAdminAuthenticated();

  // Se não estiver autenticado (ex: na tela /admin/login), deixa passar para o formulário de login
  if (!isAdmin) {
    return <>{children}</>;
  }

  // Verifica o status de faturamento da plataforma
  const billingStatus = await getBillingStatus();

  // Se hoje for dia 21 em diante e a fatura não estiver paga, bloqueia todo o painel admin
  if (billingStatus.isBlocked) {
    return <PaymentBlockedScreen billing={billingStatus} />;
  }

  return (
    <div>
      {billingStatus.isWarningPeriod && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <PaymentWarningBanner billing={billingStatus} />
        </div>
      )}
      {children}
    </div>
  );
}
