import { OldCampaignPageClient } from "./oldcampaign-page-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function Page() {
  return <OldCampaignPageClient />;
}
