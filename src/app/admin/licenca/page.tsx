import { getBillingStatus } from "@/services/billing";
import { AtlasLicenseClient } from "@/components/admin/atlas-license-page-client";

export const dynamic = "force-dynamic";

export default async function AdminLicensePage() {
  const billingStatus = await getBillingStatus();

  return <AtlasLicenseClient billing={billingStatus} />;
}
