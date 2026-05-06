"use client";

import { AdvertiserSidebar } from "@/components/advertiser/app-sidebar";
import { SiteAdvertiserHeader } from "@/components/advertiser/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/context/context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Calendar,
  Globe,
  TrendingUp,
  FileText,
  Download,
} from "lucide-react";
import { CombinedReportTable } from "./combined-report-table";

export default function AdvertiserReports() {
  const { token, accountType, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;
    if (!token || accountType !== "Advertiser") {
      router.replace("/advertiser/login");
    }
  }, [token, accountType, initializing, router]);

  const reportTypes = [
    {
      title: "Display Report by Date",
      description: "View performance metrics aggregated by date range",
      icon: Calendar,
      href: "/advertiser/report/displayreportbydate",
      color: "bg-blue-500",
      features: [
        "Date-based aggregation",
        "Performance metrics",
        "Real-time data",
      ],
    },
    {
      title: "Display Report by Campaign",
      description: "View campaign-specific performance metrics",
      icon: TrendingUp,
      href: "/advertiser/report/displayreportbycampaign",
      color: "bg-purple-500",
      features: ["Campaign analysis", "Performance insights", "Real-time data"],
    },
    {
      title: "Display Report by Country",
      description: "View geographic performance analysis",
      icon: Globe,
      href: "/advertiser/report/displayreportbycountry",
      color: "bg-orange-500",
      features: ["Geographic data", "Country metrics", "Real-time data"],
    },
    {
      title: "XML Report by Date",
      description: "Export XML formatted reports by date range",
      icon: FileText,
      href: "/advertiser/report/xmlreportbydate",
      color: "bg-green-500",
      features: ["XML export", "Date filtering", "Detailed metrics"],
    },
    {
      title: "XML Report by Campaign",
      description: "Generate campaign-specific XML reports",
      icon: TrendingUp,
      href: "/advertiser/report/xmlreportbycampaign",
      color: "bg-purple-500",
      features: ["Campaign analysis", "XML format", "Performance insights"],
    },
    {
      title: "XML Report by Country",
      description: "Geographic performance analysis in XML format",
      icon: Globe,
      href: "/advertiser/report/xmlreportbycountry",
      color: "bg-orange-500",
      features: ["Geographic data", "Country metrics", "XML export"],
    },
  ];

  if (!token) {
    return null;
  }

  return (
    <SidebarProvider>
      <AdvertiserSidebar variant="inset" />
      <SidebarInset>
        <SiteAdvertiserHeader />
        <div className="flex flex-col flex-1">
          <div className="sm:px-6 sm:space-y-8">
            <CombinedReportTable />{" "}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
