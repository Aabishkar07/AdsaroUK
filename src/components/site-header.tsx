"use client";
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
import logo from "../../public/newLogo.png";

interface PublisherData {
  id: number;
  name: string;
  timestamp: string;
  email: string;
  website: string;
  address_apt: string;
  address_city: string;
  address_country: string;
  address_state: string;
  address_street: string;
  address_zip: string;
  balance: number;
  company: string;
  hide_notifications: boolean;
  login: string;
  other_contacts: string;
  password: string | null;
  password_current: string | null;
  password_repeat: string | null;
  password_stats: string;
  phone: string;
  skype_id: string;
  ui_theme: string;
  website_descr: string;
}
interface Notification {
  id: number;
  type: "INFO" | "WARNING" | "ERROR"; // Adjust as needed
  created: string;
  read: string | null;
  subject: string;
}
export function SiteHeader() {
  const [currentPage, setCurrentPage] = useState<string>("");
  const [data, setData] = useState<PublisherData | null>(null);
  const [notificationCount, setNotificationCount] = useState<number>();

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
          `https://panel.adsaro.com/publisher/api/Account?version=4&token=${mytoken}`
        );

        setData(response.data.response.rows[0]);
      } catch (err) {
        router.push("/publisher/login");
        auth?.logout();
        toast.error("Please login to again", { autoClose: 4000 });

        console.error("Error fetching data:", err);
      }
    };

    const fetchnotification = async () => {
      try {
        const response = await axios.get(
          `https://panel.adsaro.com/publisher/api/Notifications?version=4&token=${mytoken}`
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
    fetchnotification();
    fetchData();
  }, [mytoken]);

  // Set current page name
  useEffect(() => {
    const path = window.location.pathname;
    const page = path.split("/").filter(Boolean).pop() || "";

    if (page == "dashboard") {
      setCurrentPage("Dashboard");
    }

    if (page == "xmlreportbydate" || page == "zonereportbydate") {
      setCurrentPage("Reports");
    }

    if (page == "zone") {
      setCurrentPage("Zone");
    }
    if (page == "bannerzones") {
      setCurrentPage("Banner Zone");
    }
    if (page == "popzones") {
      setCurrentPage("Pop Zone");
    }
    if (page == "referrals") {
      setCurrentPage("Referrals");
    }
    if (page == "profile") {
      setCurrentPage("Profile");
    }
    if (page == "paymenttranscation" || page == "paymentinformation") {
      setCurrentPage("Payment");
    }

    console.log("aaa", page);
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

  return (
    <header className="fixed bg-white inset-x-0 top-0 z-50 w-screen group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center border-b transition-[width,height] ease-linear bg-white shadow-sm">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex items-center justify-between w-full px-4 py-2 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-3 px-6">
          <Link href="/publisher/dashboard" className="flex items-center gap-2">
            <div className="hidden sm:block px-4">
              <Image alt="logo" src={logo} width={120} />
            </div>
          </Link>
          <SidebarTrigger className="ml-4 hover:bg-gray-100 rounded-md p-1" />
          <h1 className="text-md font-semibold text-gray-800">{currentPage}</h1>
        </div>

        {/* Right Section: Date/Time, Balance, User Profile */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 hidden md:block">
            {currentDateTime} <span className="text-xs">(PT)</span>
          </div>

          <div className="relative">
            <Link href="/publisher/notification">
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="icon icon-tabler icons-tabler-filled icon-tabler-bell text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M14.235 19c.865 0 1.322 1.024 .745 1.668a3.992 3.992 0 0 1 -2.98 1.332a3.992 3.992 0 0 1 -2.98 -1.332c-.552 -.616 -.158 -1.579 .634 -1.661l.11 -.006h4.471z" />
                  <path d="M12 2c1.358 0 2.506 .903 2.875 2.141l.046 .171l.008 .043a8.013 8.013 0 0 1 4.024 6.069l.028 .287l.019 .289v2.931l.021 .136a3 3 0 0 0 1.143 1.847l.167 .117l.162 .099c.86 .487 .56 1.766 -.377 1.864l-.116 .006h-16c-1.028 0 -1.387 -1.364 -.493 -1.87a3 3 0 0 0 1.472 -2.063l.021 -.143l.001 -2.97a8 8 0 0 1 3.821 -6.454l.248 -.146l.01 -.043a3.003 3.003 0 0 1 2.562 -2.29l.182 -.017l.176 -.004z" />
                </svg>

                {/* Notification Badge */}
                <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {notificationCount}
                </div>
              </div>
            </Link>
          </div>

          <div className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md flex items-center gap-1 hover:bg-gray-200 transition-colors">
            <CreditCard className="w-4 h-4" />
            <span>${data ? data.balance.toFixed(2) : "..."}</span>
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

              <div className="relative  overflow-hidden rounded-full border border-gray-200">
                <User className="w-8 h-8 p-1 text-gray-500" />
              </div>
              {/* <div className="hidden md:block">
                <h2 className="text-sm font-medium text-gray-800">{data?.name || "User"}</h2>
                <p className="text-xs text-gray-500">{data?.email || ""}</p>
              </div> */}
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 origin-top-right bg-white rounded-md shadow-lg border border-gray-200 z-50">
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
                    onClick={() => router.push("/publisher/profile")}
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
  );
}
