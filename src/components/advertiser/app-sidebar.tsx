"use client";

import * as React from "react";
import {
  AudioWaveform,
  ClipboardListIcon,
  Command,
  Columns,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboardIcon,
  Map,
  Plus,
  PieChart,
  DollarSign,
  SettingsIcon,
  Users,
  X,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { AdvertiserTeamSwitcher } from "./team-switcher";
import { AdvertiserNavMain } from "./nav-main";
import { AdvertiserNavUser } from "./nav-user";
import advertising from "./../../../public/advertising.jpg";
import bannerads from "./../../../public/Banner Ads.png";
import Image from "next/image";
import Link from "next/link";

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
    email: "naresh@adsaro.net",
    publishersupport: "Naresh Kumar Dhakal",
    telegram: "@Naresh00159",
    team: "naresh@adsaro.net",
    avatar: "/naresh.jpg",
  },

  account: {
    name: " Account Manager",
    email: "oliver@adsaro.com",
    publishersupport: "Oliver Bennett",
    telegram: "@Oliveradsaro",
    team: "oliver@adsaro.com",
    avatar: "/newfavicon.png",
  },
admin: {
    name: " Personal Manager",
    email: "santosh@adsaro.net",
    publishersupport: "Santosh Rajbanshi",
    telegram: "@santosh00159",
    team: "santosh@adsaro.net",
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
        width="24"
        height="24"
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
      title: " Dashboard",
      url: "/advertiser/dashboard",
      icon: LayoutDashboardIcon,
    },

    {
      title: "Reports",
      icon: ClipboardListIcon,
      url: "/advertiser/report",
      // items: [
      //   {
      //     title: "XML Feed reports",
      //     url: "/advertiser/report/xmlreportbydate",
      //     items: [
      //       { title: "by Date", url: "/publisher/xmlreportbydate" },
      //       { title: "by country", url: "/publisher/xmlreportbycountry" },
      //     ],
      //   },
      //   {
      //     title: "Display Zone reports",
      //     url: "/advertiser/report/displayreportbydate",
      //     items: [
      //       { title: "by Date", url: "/publisher/zonereportbydate" },
      //       { title: "by country", url: "/publisher/zonereportbycountry" },
      //     ],
      //   },
      // ],
    },
    {
      title: "Campaigns",
      icon: Columns,
      url: "/advertiser/campaign",
    },

    {
      title: "Budget Manager",
      icon: DollarSign,
      url: "/advertiser/payment-transactions",
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
      url: "/advertiser/referrals",
      icon: Users,
    },
    {
      title: "Creative",
      url: "/advertiser/creative",
      icon: Users,
    },
    {
      title: "Settings",
         url: "/advertiser/setting",
      icon: SettingsIcon,
      items: [
        // {
        //   title: "Setting",
        //   url: "/advertiser/setting",
        // },
        // {
        //   title: "API Tokens",
        //   url: "/advertiser/settings/api-tokens",
        // },
        // {
        //   title: "Domain Lists",
        //   url: "/advertiser/settings/domain-lists",
        // },
        // {
        //   title: "IP Lists",
        //   url: "/advertiser/settings/ip-lists",
        // },
        // {
        //   title: "Global Feeds Blacklist",
        //   url: "/advertiser/settings/global-feeds-blacklist",
        // },
        // {
        //   title: "App Lists",
        //   url: "/advertiser/settings/app-lists",
        // },
        // {
        //   title: "IFA Lists",
        //   url: "/advertiser/settings/ifa-lists",
        // },
      ],
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

export function AdvertiserSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2">
          <AdvertiserTeamSwitcher teams={data.teams} />
          {isMobile && (
            <button
              type="button"
              onClick={() => setOpenMobile(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-2 pt-6 flex justify-center mx-4">
          <Link
            href="/advertiser/campaign/create"
            className="flex w-full gap-2 rounded-md bg-[#64b33c]  px-3 py-1.5 text-sm font-medium text-white hover:bg-[#5b5cc6]"
          >
            <Plus className="h-4 w-4" />
            <span className="truncate">Create Campaign</span>
          </Link>
        </div>
        <AdvertiserNavMain  items={data.navMain} />
        {/* <div className="">
          <Image
            src={advertising}
            width={1000}
            height={1000}
            alt="Programmatic Advertising Platform"
            className="w-full h-44 object-contain  "
            priority
          />
        </div>
        <div className="">
          <Image
            src={bannerads}
            width={400}
            height={400}
            alt="Programmatic Advertising Platform"
            className="w-full object-contain  "
            priority
          />
        </div> */}
        {/* <NavProjects projects={data.projects} /> */}

      
      </SidebarContent>

      <SidebarFooter className="mb-9 px-6">
          
        <AdvertiserNavUser user={data.user} svg={data.svg} />
        <AdvertiserNavUser user={data.account} svg={data.svg} />        
        <AdvertiserNavUser user={data.admin} svg={data.svg} />
      </SidebarFooter>
    </Sidebar>
  );
}
