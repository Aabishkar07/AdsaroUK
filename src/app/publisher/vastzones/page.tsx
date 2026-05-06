import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { DataTableDemo } from "./data-table"


// interface BannerZoneData {
//   id: string;
//   name: string;
//   is_active: boolean;
//   placesize_id: string;
// }


export default async function Zone() {
  

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col flex-1">
        <div className="container py-10 mx-auto">
      <DataTableDemo  />
    </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
