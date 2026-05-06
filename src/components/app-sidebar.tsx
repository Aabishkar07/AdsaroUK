"use client";

import * as React from "react";
import {
  AudioWaveform,
  ClipboardListIcon,
  Command,
  Columns,
  Plus,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboardIcon,
  Map,
  PieChart,
  DollarSign,
  SettingsIcon,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  user: {
    name: " Personal Manager",
    email: "adsaro@gmail.com",
    publishersupport: "Ujwal Singh Sewa",
    telegram: "@ujwal_adsaro",
    team: "usinghsewa@gmail.com",
    avatar: "/ujjwal.jpg",
  },
  account: {
    name: " Account Manager",
    email: "oliver@adsaro.com",
    publishersupport: "Oliver Bennett",
    telegram: "@Oliveradsaro",
    team: "oliver@adsaro.com",
    avatar: "/newfavicon.png",
  },
  svg: {
    telegram: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-brand-telegram"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" />
      </svg>
    ),

    team: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-brand-teams"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M3 7h10v10h-10z" />
        <path d="M6 10h4" />
        <path d="M8 10v4" />
        <path d="M8.104 17c.47 2.274 2.483 4 4.896 4a5 5 0 0 0 5 -5v-7h-5" />
        <path d="M18 18a4 4 0 0 0 4 -4v-5h-4" />
        <path d="M13.003 8.83a3 3 0 1 0 -1.833 -1.833" />
        <path d="M15.83 8.36a2.5 2.5 0 1 0 .594 -4.117" />
      </svg>
    ),
  },

  navMain: [
    {
      title: "Dashboard",
      url: "/publisher/dashboard",
      icon: LayoutDashboardIcon,
    },

    {
      title: "Reports",
      icon: ClipboardListIcon,
      url: "/publisher/report",
      // items: [
      //   {
      //     title: "XML Feed reports",
      //     url: "/publisher/xmlreportbydate",
      //     items: [
      //       { title: "by Date", url: "/publisher/xmlreportbydate" },
      //       { title: "by country", url: "/publisher/xmlreportbycountry" },
      //     ],
      //   },
      //   {
      //     title: "Display Zone reports",
      //     url: "/publisher/zonereportbydate",
      //     items: [
      //       { title: "by Date", url: "/publisher/zonereportbydate" },
      //       { title: "by country", url: "/publisher/zonereportbycountry" },
      //     ],
      //   },
      // ],
    },
    {
      title: "Zones",
      icon: Columns,
      url: "/publisher/zone",
      // items: [
      //   {
      //     title: "Banner Zone",
      //     url: "/publisher/bannerzones",
      //     icon: ListIcon,
      //   },
      //   {
      //     title: "Pop Zone",
      //     url: "/publisher/popzones",
      //     icon: ListIcon,
      //   },
      //   {
      //     title: "Vast Zone",
      //     url: "/publisher/vastzones",
      //     icon: ListIcon,
      //   },
      // ],
    },

    {
      title: "Payments",
      icon: DollarSign,
      url: "/publisher/paymenttranscation",
      // items: [
      //   {
      //     title: "Payment Transactions",
      //     url: "/publisher/paymenttranscation",
      //   },
      //   {
      //     title: "Payment Information",
      //     url: "/publisher/paymentinformation",
      //   },
      // ],
    },

    {
      title: "Referrals",
      url: "/publisher/referrals",
      icon: Users,
    },
    {
      title: "Settings",
      url: "/publisher/profile",
      icon: SettingsIcon,
    },
  ],

  // navSecondary: [
  //   {
  //     title: "Settings",
  //     url: "/publisher/profile",
  //     icon: SettingsIcon,
  //   },

  // ],

  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <div className="px-2 pt-6 flex justify-center mx-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full gap-2 rounded-md bg-[#6a6bcf] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#5a5bc4]">
                <Plus className="h-4 w-4" />
                <span className="truncate">Create Zone</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/publisher/zone?addZone=POP">POP</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/publisher/zone?addZone=Banner">Banner</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter className="mb-9 px-6">
        <NavUser user={data.user} svg={data.svg} />
        <NavUser user={data.account} svg={data.svg} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
