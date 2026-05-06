"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { DataTableDemo } from "./data-table";
import { useAuth } from "@/context/context";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";

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
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col flex-1">
          <div className=" sm:px-6 sm:space-y-8">
            <Suspense fallback={<div className="text-sm text-gray-500">Loading...</div>}>
              <DataTableDemo />
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
