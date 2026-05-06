"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import {  DataTableDemo2 } from "./data-table";
import { useAuth } from "@/context/context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdvertiserSidebar } from "@/components/advertiser/app-sidebar";
import { ToastContainer } from "react-toastify";
import { SiteAdvertiserHeader } from "@/components/advertiser/site-header";

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
      router.push("/advertiser/login");
    }
  }, [token]);

  return (
    <SidebarProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <AdvertiserSidebar variant="inset" />
      <SidebarInset>
        <SiteAdvertiserHeader />
        <div className="flex flex-col flex-1">
          <div className=" sm:px-6 sm:space-y-8">
            <DataTableDemo2 />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
