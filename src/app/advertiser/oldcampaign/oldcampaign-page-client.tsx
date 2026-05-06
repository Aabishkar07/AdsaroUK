"use client";

import { AdvertiserSidebar } from "@/components/advertiser/app-sidebar";
import { SiteAdvertiserHeader } from "@/components/advertiser/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CampaignDataTableDemo } from "./data-table";

export function OldCampaignPageClient() {
  return (
    <SidebarProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <AdvertiserSidebar variant="inset" />
      <SidebarInset>
        <SiteAdvertiserHeader />
        <div className="flex flex-col flex-1">
          <div className="@container/main gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex flex-col flex-1">
                <div className="sm:px-6 sm:space-y-8 md:gap-6 md:py-3">
                  <CampaignDataTableDemo />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
