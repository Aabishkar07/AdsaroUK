"use client";
import { AdvertiserSidebar } from "@/components/advertiser/app-sidebar";
import { SiteAdvertiserHeader } from "@/components/advertiser/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditCreativeForm from "./EditCreativeForm";

export default function Page() {
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
                <div className="container sm:p-8 sm:space-y-8 mx-auto py-4 md:gap-6 md:py-6">
                  <EditCreativeForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
