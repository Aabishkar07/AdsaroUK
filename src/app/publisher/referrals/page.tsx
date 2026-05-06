"use client";
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { DataTableDemo } from "./data-table"
import { useAuth } from "@/context/context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


// interface BannerZoneData {
//   date: string
//   pub_clicks: number
//   pub_epc: number
//   pub_revenue: number
//   pub_gross: number
//   pub_requests: number
//   pub_ecpm: number
//   pub_net_clicks: number
//   pub_ctr: number
//   pub_pixel_impressions: number
// }


export default function Zone() {
  const auth = useAuth();
  const token = auth?.token;
  const router = useRouter();

  useEffect(() => {
    console.log("pop")
    if (!token) {
      router.push("/publisher/login");
    }
  }, [token]);
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col flex-1 ">
          <div className=" sm:px-6 sm:space-y-8">
            <DataTableDemo />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
