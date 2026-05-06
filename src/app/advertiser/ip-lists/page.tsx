"use client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";



import { AdvertiserSidebar } from "@/components/advertiser/app-sidebar";
import { SiteAdvertiserHeader } from "@/components/advertiser/site-header";
import { IpListTable } from "./data-table";


export default function Zone() {
  return (
    <SidebarProvider>
      <AdvertiserSidebar variant="inset" />
      <SidebarInset>
        <SiteAdvertiserHeader />
        <div className="flex flex-col flex-1">
          <div className="container sm:px-6 sm:space-y-8 pt-4  ">
            <IpListTable />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
