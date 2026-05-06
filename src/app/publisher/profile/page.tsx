"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/context/context";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

  const auth = useAuth();
  const mytoken = auth?.token;
  const router = useRouter();

  const logincheck = () => {
    if (!mytoken) {
      router.push("/publisher/login");
    }
  }

  // Function to handle input changes
  const handleInputChange = (field: string, value: string) => {
    SetData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const updateData = async () => {
    try {
      const response = await fetch("/api/proxy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${mytoken}`,
        },
        body: JSON.stringify({
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
            token: mytoken,
          },
        }),
      });

      console.log(response, "aabiresult3");
      const result = await response.json();


      console.log(result, "aabss/siresult");

      if (result.status === "success") {
        toast.success("Profile Updated successfully!", {
          autoClose: 4000,
        });
        console.log("Updated Data:", result);
      } else {
        toast.error("Failed to update profile. Please try again.");
      }

    } catch (err) {
      console.error("Error updating data", err);
      toast.error("Failed to Update data. Please try again.");
    }
  };


  useEffect(() => {
    logincheck()
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://panel.adsaro.com/publisher/api/Account?version=4&token=${mytoken}`
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
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />

          <div className="flex mt-10">
            <div className="flex sm:px-2 sm:space-y-8 pt-2 flex-col flex-1 overflow-hidden">
              <div className="flex-1 p-4 overflow-y-auto">


   <nav className="flex items-center  pl-3 text-sm text-gray-500 ">
                  <a
                    href="/advertiser/dashboard"
                    className="hover:text-gray-700  font-medium transition-colors"
                  >
                    Home
                  </a>

                  <span className="mx-2 text-gray-400">/</span>

                  <span className="text-gray-800 font-semibold">
                    Profile
                  </span>
                </nav>


                <div className="my-2 mt-4 overflow-y-hidden bg-white border border-gray-300 rounded-lg shadow-xl max-w-4xl">
                  <div className="px-6 py-2 sm:px-6">
                    {/* <h3 className="text-3xl font-semibold text-gray-800">
                      Main Info
                    </h3> */}
                    <ToastContainer position="top-right" autoClose={3000} />


                    <p className="mt-2 text-lg text-gray-600">
                      Detailed information about {data?.name}.
                    </p>
                  </div>
                  <div className="px-6 py-5 border-t border-gray-200 sm:p-6">
                    <dl className="space-y-6 sm:space-y-5">
                      {/* Full Name */}
                      <div className="grid sm:grid-cols-3 sm:gap-6">
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
                      <div className="grid   sm:grid-cols-3 sm:gap-6">
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

                      <div className="grid  sm:grid-cols-3 sm:gap-6">
                        <dt className="text-sm font-medium text-gray-600">
                          Website
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <input
                            type="text"
                            value={data?.website || ""}
                            onChange={(e) =>
                              handleInputChange("website", e.target.value)
                            }
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </dd>
                      </div>
                      <div className="grid  sm:grid-cols-3 sm:gap-6">
                        <dt className="text-sm font-medium text-gray-600">
                          Website Description
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <input
                            type="text"
                            value={data?.website_descr || ""}
                            onChange={(e) =>
                              handleInputChange("website_descr", e.target.value)
                            }
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </dd>
                      </div>

                      <div className="grid  sm:grid-cols-3 sm:gap-6">
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

                      <div className="grid  sm:grid-cols-3 sm:gap-6">
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

                      <div className="grid  sm:grid-cols-3 sm:gap-6">
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

                      <div className="grid  sm:grid-cols-3 sm:gap-6">
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
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </dd>
                      </div>

                      <div className="grid  sm:grid-cols-3 sm:gap-6">
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
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </dd>
                      </div>

                      <div className="grid  sm:grid-cols-3 sm:gap-6">
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

                      <div className="grid  sm:grid-cols-3 sm:gap-6">
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
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </dd>
                      </div>

                      <div className="grid  sm:grid-cols-3 sm:gap-6">
                        <dt className="text-sm font-medium text-gray-600">
                          Skype Id
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <input
                            type="text"
                            value={data?.skype_id || ""}
                            onChange={(e) =>
                              handleInputChange("skype_id", e.target.value)
                            }
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </dd>
                      </div>

                      <div className="grid  sm:grid-cols-3 sm:gap-6">
                        <dt className="text-sm font-medium text-gray-600">
                          State{" "}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <input
                            type="text"
                            value={data?.address_state || ""}
                            onChange={(e) =>
                              handleInputChange("address_state", e.target.value)
                            }
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </dd>
                      </div>

                      <div className="grid  sm:grid-cols-3 sm:gap-6">
                        <dt className="text-sm font-medium text-gray-600">
                          City{" "}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <input
                            type="text"
                            value={data?.address_city || ""}
                            onChange={(e) =>
                              handleInputChange("address_city", e.target.value)
                            }
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </dd>
                      </div>

                      <div className="grid  sm:grid-cols-3 sm:gap-6">
                        <dt className="text-sm font-medium text-gray-600">
                          Zip{" "}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <input
                            type="text"
                            value={data?.address_zip || ""}
                            onChange={(e) =>
                              handleInputChange("address_zip", e.target.value)
                            }
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </dd>
                      </div>

                      <div className="grid  sm:grid-cols-3 sm:gap-6">
                        <dt className="text-sm font-medium text-gray-600">
                          Street{" "}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <input
                            type="text"
                            value={data?.address_street || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "address_street",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </dd>
                      </div>

                      <div className="grid  sm:grid-cols-3 sm:gap-6">
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
                      </div>

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
                  <div className="px-6 py-4 sm:px-6">
                    <button
                      onClick={updateData}
    className="flex items-center justify-center px-8 py-2 mx-auto font-semibold text-white bg-[#6a6bcf] rounded-md shadow-md hover:bg-white border border-[#6a6bcf] hover:text-[#6a6bcf] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save
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
