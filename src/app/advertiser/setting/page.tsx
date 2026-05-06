"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { AdvertiserSidebar } from "@/components/advertiser/app-sidebar";
import { SiteAdvertiserHeader } from "@/components/advertiser/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/context/context";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
type FormData = {
  name?: string;
  email?: string;
  website?: string;
  website_descr?: string;
  company?: string;
  phone?: string;
  skype_id?: string;
  address_state?: string;
  address_city?: string;
  address_zip?: string;
  address_street?: string;
  password_current?: string;
  password?: string;
  password_repeat?: string;
  password_stats?: string;
  login?: string;
  address_country?: string;
};

const Page = () => {
  const [data, SetData] = useState<FormData>({});
  const {
    formState: { errors },
  } = useForm<FormData>();
  const [currentPage, setCurrentPage] = useState<string>("");

  const auth = useAuth();
  const mytoken = auth?.token;
  const router = useRouter();

  const logincheck = () => {
    if (!mytoken) {
      router.push("/advertiser/login");
    }
  };
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle input changes
  const handleInputChange = (field: string, value: string) => {
    SetData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  useEffect(() => {
    const path = window.location.pathname;
    const page = path.split("/").filter(Boolean).pop() || "";
    setCurrentPage(page.charAt(0).toUpperCase() + page.slice(1) || "Dashboard");
  }, []);

  const updateData = async () => {
    setIsLoading(true);

    try {
      if (!mytoken) {
        toast.error("Session expired. Please login again.");
        router.push("/advertiser/login");
        return;
      }

      const response = await fetch("/api/advertiserprofile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storedToken: mytoken,
          data: {
            name: data.name,
            email: data.email,
            website: data.website,
            website_descr: data.website_descr,
            company: data.company,
            phone: data?.phone,
            skype_id: data?.skype_id,
            address_state: data?.address_state,
            address_city: data?.address_city,
            address_zip: data?.address_zip,
            address_street: data?.address_street,
            password_current: data?.password_current,
            password_repeat: data?.password_repeat,
            password: data?.password,
          },
        }),
      });

      console.log(response, "aabiresult3");
      const result = await response.json();

      console.log(result, "aabss/siresult");

      const resultStatus = String(result?.status ?? "").toLowerCase();
      const resultMessage = String(result?.message ?? result?.error ?? "");

      if (
        resultMessage.toLowerCase().includes("invalid session") ||
        response.status === 401
      ) {
        toast.error("Invalid Session. Please login again.", {
          autoClose: 4000,
        });
        router.push("/advertiser/login");
        return;
      }

      if (resultStatus === "success" || resultStatus === "ok") {
        toast.success("Profile Updated successfully!", {
          autoClose: 3000,
        });
        console.log("Updated Data:", result);
      } else {
        toast.error(
          resultMessage || "Failed to update profile. Please try again.",
        );
      }
    } catch (err) {
      console.error("Error updating data", err);
      toast.error("Failed to Update data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    logincheck();
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://panel.adsaro.com/advertiser/api/Account?version=4&token=${mytoken}`,
        );
        console.log(response.data);
        SetData(response.data.response.rows[0]);
        // const userData = response.data.response.rows[0];
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [mytoken]);

  return (
    <>
      <SidebarProvider>
        {/* <ToastContainer position="top-right" autoClose={3000} 
        /> */}

        <AdvertiserSidebar variant="inset" />
        <SidebarInset>
          <SiteAdvertiserHeader />

          <div className="flex mt-2 ">
            <div className="flex sm:px-6 pt-2  sm:space-y-8  flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <nav className="flex items-center  pl-3 text-sm text-gray-500 ">
                  <a
                    href="/advertiser/dashboard"
                    className="hover:text-gray-700  font-medium transition-colors"
                  >
                    Home
                  </a>

                  <span className="mx-2 text-gray-400">/</span>

                  <span className="text-gray-800 font-semibold">
                    {currentPage}
                  </span>
                </nav>

                <div className="my-2 mt-4 overflow-y-hidden bg-white border border-gray-300 rounded-lg shadow-xl max-w-4xl mx-4">
                  <div className="px-6 py-2 sm:px-6">
                    <p className="mt-2 text-lg text-gray-600">
                      Detailed information about {data?.name}.
                    </p>
                  </div>
                  <div className="px-6 py-5 border-t border-gray-200 sm:p-6">
                    <dl className="space-y-6 sm:space-y-5">
                      {/* Full Name */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                        <dt className="text-sm font-medium text-gray-600">
                          Full Name
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <input
                            type="text"
                            value={data?.name || ""}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {errors.name && (
                            <p className="text-sm text-red-500">
                              {errors.name.message}
                            </p>
                          )}
                        </dd>
                      </div>

                      {/* Email Address */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                        <dt className="text-sm font-medium text-gray-600">
                          Email Address
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <input
                            type="email"
                            value={data?.email || ""}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </dd>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                        <dt className="text-sm font-medium text-gray-600">
                          Company
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <input
                            type="text"
                            value={data?.company || ""}
                            onChange={(e) =>
                              handleInputChange("company", e.target.value)
                            }
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </dd>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                        <dt className="text-sm font-medium text-gray-600">
                          Login
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <input
                            type="text"
                            value={data?.login || ""}
                            disabled
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </dd>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                        <dt className="text-sm font-medium text-gray-600">
                          Phone Number
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <input
                            type="text"
                            value={data?.phone || ""}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </dd>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                        <dt className="text-sm font-medium text-gray-600">
                          Country
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <input
                            type="text"
                            value={data?.address_country || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "address_country",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </dd>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                        <dt className="text-sm font-medium text-gray-600">
                          Current Password
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <input
                            type="password"
                            value={data?.password_current || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "password_current",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </dd>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                        <dt className="text-sm font-medium text-gray-600">
                          New Password
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <input
                            type="password"
                            value={data?.password || ""}
                            onChange={(e) =>
                              handleInputChange("password", e.target.value)
                            }
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </dd>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                        <dt className="text-sm font-medium text-gray-600">
                          Confirm new password
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <input
                            type="password"
                            value={data?.password_repeat || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "password_repeat",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </dd>
                      </div>

                      {/* <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 sm:gap-6">
                        <dt className="text-sm font-medium text-gray-600">
                          Stats password?
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <input
                            type="text"
                            value={data?.password_stats || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "password_stats",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </dd>
                      </div> */}

                      {/* <div className="mt-4">
                <label className="flex items-center p-2 text-xl cursor-pointer">
                  Compact design theme ?
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={hideNotifications}
                    onChange={toggleSwitch}
                  />
                  <span
                    className={`w-16 h-10 flex items-center flex-shrink-0 ml-4 p-1 rounded-full transition-all duration-300 ${
                      hideNotifications ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 bg-white rounded-full shadow-md transition-transform duration-300 ${
                        hideNotifications ? "translate-x-6" : "translate-x-0"
                      }`}
                    ></span>
                  </span>
                </label>
              </div> */}
                    </dl>
                  </div>

                  {/* Submit Button */}
                  {/* <div className="px-6 py-4 sm:px-6">
                    <button
                      onClick={updateData}
                      className="flex items-center justify-center px-8 py-2 mx-auto font-semibold text-white bg-[#6a6bcf] rounded-md shadow-md hover:bg-white border border-[#6a6bcf] hover:text-[#6a6bcf] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Save
                    </button>
                  </div> */}

                  <div className="px-6 py-4 sm:px-6">
                    <button
                      onClick={updateData}
                      disabled={isLoading}
                      className="flex items-center justify-center px-8 py-2 mx-auto font-semibold text-white bg-[#6a6bcf] rounded-md shadow-md hover:bg-white border border-[#6a6bcf] hover:text-[#6a6bcf] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default Page;
