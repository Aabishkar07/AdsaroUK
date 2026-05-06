"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import axios from "axios";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import logo from "../../../public/newLogo.png";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormData = {
  login: string;
  fullName: string;
  email: string;
  password: string;
  password_repeat: string;
  website?: string;
  websiteDescription?: string;
  other_contacts?: string;
  skype_id?: string;
  phone?: string;
  country: string;
  status?: string;
};

interface Country {
  iso: string;
  name: string;
  children_count: number;
}

// Component to isolate useSearchParams usage (optional, but helps Suspense boundary)
// function Referrer() {
//   const searchParams = useSearchParams();
//   const ref = searchParams.get("ref");
//   return <>{ref && <input type="hidden" name="referrer" value={ref} />}</>;
// }

export default function AdvertiserSignup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>();

  const [country, setCountry] = useState("");
  const [countryList, setCountryList] = useState<Country[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function loadCountry() {
      try {
        const url = `https://panel.adsaro.com/admin/api/GeoCountries/?version=4&userToken=wluwaTC2xLwEy11r`;
        const response = await axios.get(url);
        const rows = response.data?.response?.rows;

        console.log("Rows:", rows);

        if (rows && typeof rows === "object") {
          const countriesArray = Object.values(rows) as Country[];
          setCountryList(countriesArray);
        } else {
          console.warn("Invalid data format for countries:", rows);
        }
      } catch (error) {
        console.error("Failed to load countries:", error);
      }
    }

    loadCountry();
  }, []);

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.password_repeat) {
      setError("password_repeat", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }

    const loginLower = (data.login || "").toLowerCase().trim();
    const passwordLower = (data.password || "").toLowerCase();
    if (loginLower && passwordLower.includes(loginLower)) {
      setError("password", {
        type: "manual",
        message: "Password must not contain your username",
      });
      return;
    }

    if (!country) {
      setError("country", { type: "manual", message: "Country is required" });
      return;
    }

    const now = new Date();
    const formatted = format(now, "yyyy-MM-dd HH:mm");

    const refParam = new URLSearchParams(window.location.search).get("ref");
    const ref = refParam ? parseInt(refParam, 10) : null;

    const payload = {
      login: data.login,
      name: data.fullName,
      email: data.email,
      password: data.password,
      password_repeat: data.password_repeat,
      website: data.website,
      other_contacts: data.other_contacts,
      skype_id: data.skype_id,
      phone: data.phone,
      address_country: data.country,
      signup_country: data.country,
      registered: formatted,
      status: "NEW",
      ...(Number.isInteger(ref) ? { referral_partner: ref } : {}),
    };
    // console.log("payload", payload);
    // return false;

    try {
      const response = await fetch("/api/advertisersignup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
      });
      const result = await response.json();

      if (result?.status === "Error") {
        if (result.message.includes("login=Duplicate entry")) {
          setError("login", {
            type: "custom",
            message: "Username Already Exists",
          });
        } else if (result.message.includes("email=Duplicate entry")) {
          setError("email", {
            type: "custom",
            message: "Email Already Exists",
          });
        } else if (
          result.message.includes("website=Must be a well-formed domain name")
        ) {
          setError("website", {
            type: "custom",
            message: "Website Must be a well-formed domain name",
          });
        } else if (result.message.includes("password=Password contains login in it")) {
          setError("password", {
            type: "custom",
            message: "Password must not contain your username",
          });
        }
      }

      if (result?.status === "OK") {
        localStorage.setItem(
          "signup_success",
          "Signup Completed successfully!"
        );
        router.push("/advertiser/login");
      }
    } catch (error) {
      console.error("Error during signup:", error);
    }
  };

  return (
<div className="">


    <div className={cn("my-20", className)} {...props}>
      <Suspense fallback={<div>Loading...</div>}>
        <Card>
          <CardHeader>
            <div className="flex justify-center mx-auto">
              <Image alt="logo" width={200} src={logo} />
            </div>
            <CardTitle className="text-2xl text-center text-gray-500">
              Create your Advertiser Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* <Referrer /> */}
              <div className="flex flex-col gap-6">
                {/* Username + Full Name */}
                <div className="flex gap-4">
                  <div className="grid w-1/2 gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="username"
                      {...register("login", {
                        required: "Username is required",
                      })}
                    />
                    {errors.login && (
                      <p className="text-sm text-red-500">
                        {errors.login.message}
                      </p>
                    )}
                  </div>
                  <div className="grid w-1/2 gap-2">
                    <Label htmlFor="fullName">First and Last Name</Label>
                    <Input
                      id="fullName"
                      placeholder="First and Last Name"
                      {...register("fullName", {
                        required: "Full name is required",
                      })}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-500">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email + Phone */}
                <div className="flex gap-4">
                  <div className="grid w-1/2 gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      {...register("email", { required: "Email is required" })}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="grid w-1/2 gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 234 567 890"
                      {...register("phone")}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password + Confirm */}
                <div className="flex gap-4">
                  <div className="grid w-1/2 gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message:
                            "Password must be at least 8 characters long",
                        },
                        pattern: {
                          value:
                            /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
                          message:
                            "Password must include one uppercase letter and one special character",
                        },
                      })}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="grid w-1/2 gap-2">
                    <Label htmlFor="password_repeat">Confirm Password</Label>
                    <Input
                      id="password_repeat"
                      type="password"
                      {...register("password_repeat", {
                        required: "Please confirm password",
                        validate: (value) =>
                          value === getValues("password") ||
                          "Passwords do not match",
                      })}
                    />
                    {errors.password_repeat && (
                      <p className="text-sm text-red-500">
                        {errors.password_repeat.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Telegram / Teams ID */}
                <div className="flex gap-4">
                  <div className="grid w-full gap-2">
                    <Label htmlFor="other_contacts">Telegram / Teams ID</Label>
                    <Input
                      id="other_contacts"
                      placeholder="Telegram or Teams ID"
                      {...register("other_contacts")}
                    />
                    {errors.other_contacts && (
                      <p className="text-sm text-red-500">
                        {errors.other_contacts.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Skype + Country */}
                <div className="flex gap-4">
                  <div className="grid w-1/2 gap-2">
                    <Label htmlFor="skype">Skype</Label>
                    <Input
                      id="skype"
                      placeholder="Skype ID"
                      {...register("skype_id")}
                    />
                    {errors.skype_id && (
                      <p className="text-sm text-red-500">
                        {errors.skype_id.message}
                      </p>
                    )}
                  </div>
                  <div className="grid w-1/2 gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      onValueChange={(value) => {
                        setCountry(value);
                        setValue("country", value);
                      }}
                      value={country}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryList.map((c) => (
                          <SelectItem key={c.iso} value={c.iso}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <p className="text-sm text-red-500">
                        {errors.country.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Website + Description */}
                <div className="flex gap-4">
                  <div className="grid w-1/2 gap-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      placeholder="example.com"
                      {...register("website")}
                    />
                    {errors.website && (
                      <p className="text-sm text-red-500">
                        {errors.website.message}
                      </p>
                    )}
                  </div>
                  <div className="grid w-1/2 gap-2">
                    <Label htmlFor="websiteDescription">
                      Website Description
                    </Label>
                    <Input
                      id="websiteDescription"
                      placeholder="Description of your website"
                      {...register("websiteDescription")}
                    />
                    {errors.websiteDescription && (
                      <p className="text-sm text-red-500">
                        {errors.websiteDescription.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full mt-6 bg-[#6a6bcf] hover:bg-white border border-[#6a6bcf] text-white hover:text-[#6a6bcf]">
                  Submit
                </Button>
              </div>

 <div className="mt-4 text-sm text-center">
              Already have an account?{" "}
              <div
                onClick={() => router.push("/advertiser/login")}
                className="cursor-pointer underline-offset-4"
              >
                Log in
              </div>
            </div>

            </form>
          </CardContent>
        </Card>
      </Suspense>
    </div>

    </div>
  );
}
