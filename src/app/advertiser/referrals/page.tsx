"use client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { DataTableDemo } from "./data-table"


import { AdvertiserSidebar } from "@/components/advertiser/app-sidebar";
import { SiteAdvertiserHeader } from "@/components/advertiser/site-header";


export default function Zone() {



  return (
    <SidebarProvider>
      <AdvertiserSidebar variant="inset" />
      <SidebarInset>
        <SiteAdvertiserHeader />
        <div className="flex flex-col flex-1 ">
          <div className=" sm:px-6 sm:space-y-8">
            <DataTableDemo />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
