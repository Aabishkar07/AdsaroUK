"use client";
import { AdvertiserSidebar } from "@/components/advertiser/app-sidebar";
import { SiteAdvertiserHeader } from "@/components/advertiser/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DataTableDemo } from "./data-table"
import { useAuth } from "@/context/context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";





export default function XmlReportByDate() {
  const { token, accountType, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;
    if (!token || accountType !== "Advertiser") {
      router.replace("/advertiser/login");
    }
  }, [token, accountType, initializing, router]);
  return (
    <SidebarProvider>
    <AdvertiserSidebar variant="inset" />
    <SidebarInset>
      <SiteAdvertiserHeader />
        <div className="flex flex-col flex-1">
          <div className="w-full px-4 sm:px-6 sm:space-y-8 pt-4 sm:pt-8">
            <div className="mb-6">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                  <li className="inline-flex items-center">
                    <button
                      onClick={() => router.push("/advertiser/dashboard")}
                      className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                    >
                    Home
                    </button>
                  </li>
                  <li>
                    <div className="flex items-center">
                     /
                      <span className="ml-1 text-sm font-medium text-gray-700 md:ml-2">XML Report by Date</span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
            <DataTableDemo />
          </div>
        </div>
         </SidebarInset>
             </SidebarProvider>
  )
}
