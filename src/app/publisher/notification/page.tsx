"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { useAuth } from "@/context/context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DataTableDemoNo } from "./data-table";

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
    console.log("pop");
    if (!token) {
      router.push("/publisher/login");
    }
  }, [token]);

  return (
    <SidebarProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col flex-1">
          <div className="sm:p-8 sm:space-y-8  container py-10 mx-auto">
            <DataTableDemoNo />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
