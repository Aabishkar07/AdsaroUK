
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdvertiserSidebar } from "@/components/advertiser/app-sidebar";
// import { AdvertiserSectionCards } from "@/components/advertiser/section-cards";
import { SiteAdvertiserHeader } from "@/components/advertiser/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "@/context/context";
import "react-toastify/dist/ReactToastify.css";
import AdvertiserSectionCards from "@/components/advertiser/section-cards";

export default function Page() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for context to finish initializing before making any decisions
    if (auth.initializing) {
      return;
    }

    // Check if user is logged in and has advertiser access
    if (!auth.isLogin || !auth.token || !auth.advertiserData) {
      router.push("/advertiser/login");
      return;
    }

    // Show success message if redirected from login
    const message = localStorage.getItem("login_success");
    if (message) {
      toast.success(message, { autoClose: 4000 });
      setTimeout(() => {
        localStorage.removeItem("login_success");
      }, 10000);
    }

    // Check for logout message
    const logoutMessage = localStorage.getItem("logout");
    if (logoutMessage) {
      toast.info(logoutMessage, { autoClose: 4000 });
      setTimeout(() => {
        localStorage.removeItem("logout");
      }, 10000);
    }

    // Cleanup function for timeouts
    return () => {
      // Clean up any pending timeouts if component unmounts
      const message = localStorage.getItem("login_success");
      if (message) {
        localStorage.removeItem("login_success");
      }
      const logoutMessage = localStorage.getItem("logout");
      if (logoutMessage) {
        localStorage.removeItem("logout");
      }
    };
  }, [auth.isLogin, auth.token, auth.advertiserData, auth.initializing, router]);

  // Show loading or redirect if not authenticated
  if (auth.initializing || !auth.isLogin || !auth.token || !auth.advertiserData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {auth.initializing ? "Initializing..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <AdvertiserSidebar variant="inset" />
      <SidebarInset>
        <SiteAdvertiserHeader />
        <div className="flex flex-col flex-1">
          <div className="@container/main gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-4 mb-3">
              <AdvertiserSectionCards />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
