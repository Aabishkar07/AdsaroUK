"use client";
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { DataTableDemo } from "./data-table"
import { useAuth } from "@/context/context";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";


// interface BannerZoneData {
//   id: string;
//   name: string;
//   is_active: boolean;
//   placesize_id: string;
// }


export default  function Zone() {

  const auth = useAuth();
  const token = auth?.token;
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/publisher/login");
    }
  }, [token]);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col flex-1">
          <div className="container sm:p-8 sm:space-y-8  mx-auto py-4 md:gap-6 md:py-6">
            <Suspense fallback={<div className="text-sm text-gray-500">Loading...</div>}>
              <DataTableDemo />
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
