"use client";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/context";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { LogOutIcon, Settings, User, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
 import Image from "next/image";
 import logo from "../../../public/newLogo.png";
 import favicon from "../../../public/newfavicon.png";

interface AdvertiserData {
  id: number;
  name: string;
  login: string;
  password: string | null;
  password_repeat: string | null;
  password_current?: string | null;
  password_stats?: string | null;
  email: string;
  phone?: string | null;
  address_apt: string | null;
  address_city: string | null;
  address_state: string | null;
  address_street: string | null;
  address_zip: string | null;
  address_country: string;
  balance: number;
  remain_balance: number;
  spend_yesterday: number;
  total_spend: number;
  notify_daily_spend: boolean;
  hide_notifications: boolean;
  ui_theme: string;
  company?: string | null;
  website?: string | null;
  days_left?: number | null;
  feed_blacklist?: string | null;
  other_contacts?: string | null;
  tax_id?: string | null;
  rtb_name?: string | null;
  rtb_agency_name?: string | null;
  skype_id?: string | null;
}
interface Notification {
  id: number;
  type: "INFO" | "WARNING" | "ERROR"; // Adjust as needed
  created: string;
  read: string | null;
  subject: string;
}

// Define the structure of the full response
// interface NotificationAPIResponse {
//   response: {
//     rows: Record<number, Notification>;
//   };
// }

export function SiteAdvertiserHeader() {
  const [currentPage, setCurrentPage] = useState<string>("");
  const [notificationCount, setNotificationCount] = useState<number>();
  const [data, setData] = useState<AdvertiserData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const auth = useAuth();
  const mytoken = auth?.token;
  const router = useRouter();

  // Fetch publisher data
  useEffect(() => {
    if (!mytoken) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://panel.adsaro.com/advertiser/api/Account?version=4&token=${mytoken}`
        );
        setData(response.data.response.rows[0]);
      } catch (err) {
        router.push("/advertiser/login");
        auth?.logout();
        toast.error("Please login to again", { autoClose: 4000 });

        console.error("Error fetching data:", err);
      }
    };
    const fetchnotification = async () => {
      try {
        const response = await axios.get(
          `https://panel.adsaro.com/advertiser/api/Notifications?version=4&token=${mytoken}`
        );
        console.log("pppopopo", response.data.response.rows);
        const data: Record<number, Notification> = response.data.response.rows;

        const unreadCount: number = Object.values(data).filter(
          (item) => item.read === null
        ).length;

        setNotificationCount(unreadCount);

        // console.log(`Unread count: ${unreadCount}`);
      } catch (err) {
        console.error("Error fetching notification:", err);
      }
    };

    fetchData();
    fetchnotification();
  }, [mytoken]);

  // Set current page name
  useEffect(() => {
    const path = window.location.pathname;
    const page = path.split("/").filter(Boolean).pop() || "";
    setCurrentPage(page.charAt(0).toUpperCase() + page.slice(1) || "Dashboard");
  }, []);

  // Update date and time
  useEffect(() => {
    const updateDateTime = () => {
      const currentDate = new Date().toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
      setCurrentDateTime(currentDate);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Update every minute instead of every second
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const redirectadkernel = () => {
    window.open(
      `https://panel.adsaro.com/advertiser/popups/add-funds?authToken=${mytoken}&redirectSuccessURL=https://www.adfocusnetwork.com/advertiser/payment-transactions/&redirectCancelURL=https://www.adfocusnetwork.com/advertiser/dashboard`,
      "_blank"
    );
  };

  return (
    <>
      <header className="fixed bg-white inset-x-0 top-0 z-50 w-full group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center border-b transition-[width,height] ease-linear bg-white shadow-sm">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="flex items-center justify-between w-full px-2 sm:px-4 py-2 lg:px-6">
          {/* Left Section */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href="/advertiser/dashboard" className="flex items-center gap-2">
              {/* <div className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white">
                <Image alt="logo" src={favicon} width={26} height={26} />
              </div> */}
              <div className="hidden sm:block px-4">
                <Image alt="logo" src={logo} width={120} />
              </div>
            </Link>
            <SidebarTrigger className="hover:bg-gray-100 rounded-md p-1" />
            {/* <Separator orientation="vertical" className="h-6 mx-3 bg-gray-200" /> */}
            <h1 className="text-md font-semibold text-gray-800 truncate max-w-[45vw] sm:max-w-none">
              {currentPage}
            </h1>
          </div>

        {/* Right Section: Date/Time, Balance, User Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-sm text-black hidden md:block">
            {currentDateTime} <span className="text-xs">(PT)</span>
          </div>
          <div className="relative">
            <Link href="/advertiser/notification">
              <div className="relative">

<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#000000"
  stroke-width="1.25"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
  <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
</svg>

                {/* Notification Badge */}
                <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {notificationCount}
                </div>
              </div>
            </Link>
          </div>

          <div className="hidden sm:flex px-3 py-1.5 text-sm font-medium text-gray-700 bg-white rounded-md items-center gap-1 hover:bg-gray-200 transition-colors">
            <CreditCard className="w-4 h-4" />
            <span>${data ? data.balance.toFixed(3) : "..."}</span>
          </div>
          <div
            onClick={redirectadkernel}
            className="px-2 sm:px-3 cursor-pointer py-1.5 text-xs font-medium text-gray-700 bg-[#6a6bcf] text-white rounded-md flex items-center gap-1 transition-colors"
          >

<svg
  xmlns="http://www.w3.org/2000/svg"
  width="18"
  height="18"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#ffffff"
  stroke-width="1.25"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M4 20l16 0" />
  <path d="M12 14l0 -10" />
  <path d="M12 14l4 -4" />
  <path d="M12 14l-4 -4" />
</svg>

            <span className="hidden sm:inline">Add Fund</span>
          </div>

          {/* User Profile Section with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-100 rounded-md transition-colors"
              onClick={toggleDropdown}
            >
              {/* <div className="relative h-8 w-8 overflow-hidden rounded-full border border-gray-200">
                <Image 
                  alt="profile" 
                  src={profileimg} 
                  layout="fill" 
                  objectFit="cover"
                />
              </div> */}

              <div className="relative  overflow-hidden">

<svg
  xmlns="http://www.w3.org/2000/svg"
  width="22"
  height="22"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#000000"
  stroke-width="1.25"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
  <path d="M6 21v-2a4 4 0 0 1 4 -4h2.5" />
  <path d="M19.001 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
  <path d="M19.001 15.5v1.5" />
  <path d="M19.001 21v1.5" />
  <path d="M22.032 17.25l-1.299 .75" />
  <path d="M17.27 20l-1.3 .75" />
  <path d="M15.97 17.25l1.3 .75" />
  <path d="M20.733 20l1.3 .75" />
</svg>

              </div>
              {/* <div className="hidden md:block">
                <h2 className="text-sm font-medium text-gray-800">{data?.name || "User"}</h2>
                <p className="text-xs text-gray-500">{data?.email || ""}</p>
              </div> */}
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 sm:w-64 max-w-[calc(100vw-1rem)] origin-top-right bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="p-3 border-b">
                  <p className="text-sm font-medium text-gray-800">
                    {data?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">{data?.email || ""}</p>
                </div>

                <div className="py-1">
                  {/* <a href="/publisher/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <User className="w-4 h-4 mr-3 text-gray-500" />
                    Profile
                  </a> */}
                  <div
                    onClick={() => router.push("/advertiser/setting")}
                    className="flex cursor-pointer items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-3 text-gray-500" />
                    Settings
                  </div>
                  {/* <a href="/notifications" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Bell className="w-4 h-4 mr-3 text-gray-500" />
                    Notifications
                  </a> */}
                  {/* <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    {data?.ui_theme === "dark" ? (
                      <>
                        <Sun className="w-4 h-4 mr-3 text-gray-500" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 mr-3 text-gray-500" />
                        Dark Mode
                      </>
                    )}
                  </button> */}
                </div>

                <div className="py-1 border-t">
                  <button
                    onClick={() => {
                      auth?.logout();
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOutIcon className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-12" />
    </>
  );
}
