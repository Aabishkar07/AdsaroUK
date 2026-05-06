"use client";

import { Suspense } from "react";
import { AdvertiserSidebar } from "@/components/advertiser/app-sidebar";
import { SiteAdvertiserHeader } from "@/components/advertiser/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CreativeDataTableDemo } from "./data-table";

export default function CreativePageClient() {
  return (
    <SidebarProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <AdvertiserSidebar variant="inset" />

      <SidebarInset>
        <SiteAdvertiserHeader />

        <div className="flex flex-col flex-1">
          <div className="@container/main gap-2">
            <div className="flex flex-col gap-4 md:gap-6 ">
              <div className="flex flex-col flex-1">
                <div className="w-full px-4 sm:px-6 sm:space-y-8 pt-4 sm:pt-8 md:gap-6">
                  <Suspense fallback={<div>Loading creatives...</div>}>
                    <CreativeDataTableDemo />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
