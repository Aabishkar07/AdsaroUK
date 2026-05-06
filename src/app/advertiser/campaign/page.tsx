import { CampaignPageClient } from "./campaign-page-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function Page() {
  return <CampaignPageClient />;
}
