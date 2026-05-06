
"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/context/context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Page() {
  const auth = useAuth();
  const token = auth?.token;
  const router = useRouter();

  const logincheck = () => {
    if (!token) {
      router.push("/publisher/login");
    }
  }

  useEffect(() => {
    logincheck();
    const message = localStorage.getItem("login_success");
    if (message) {
      toast.success(message, { autoClose: 4000 });

      setTimeout(() => {
        localStorage.removeItem("login_success");
      }, 10000);
    }
  }, []);

  return (
    <SidebarProvider>
      {/* <ToastContainer position="top-right" autoClose={3000} /> */}
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col flex-1">
          <div className="@container/main gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              {/* <ChartAreaInteractive /> */}
              {/* <DataTable data={data} /> */}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
