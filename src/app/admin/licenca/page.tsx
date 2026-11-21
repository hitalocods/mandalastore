import { getBillingStatus, markBillingAsPaid, ABACATEPAY_BILL_ID } from "@/services/billing";
import { AtlasLicenseClient } from "@/components/admin/atlas-license-page-client";

export const dynamic = "force-dynamic";

export default async function AdminLicensePage({
  searchParams,
}: {
  searchParams: Promise<{ payment_status?: string; status?: string; ref?: string }>;
}) {
  const params = await searchParams;
  let billingStatus = await getBillingStatus();

  if (
    params.payment_status === "success" ||
    params.payment_status === "paid" ||
    params.status === "paid" ||
    params.status === "PAID"
  ) {
    const targetRef = params.ref || billingStatus.dueMonthRef;
    await markBillingAsPaid(targetRef, ABACATEPAY_BILL_ID, "Cartão/AbacatePay");
    billingStatus = await getBillingStatus();
  }

  return <AtlasLicenseClient billing={billingStatus} />;
}
