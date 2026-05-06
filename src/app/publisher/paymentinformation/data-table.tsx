"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/context";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from "next/navigation";

interface CapitalistWalletForm {
  capitalist_wallet: string;
  company_name: string;
  account_number: string;
  bank_name: string;
  bank_address: string;
  bank_city: string;
  wire_bank_country_id: string;
  bank_zip_code: string;
  routing_aba: string;
  swift_number: string;
  iban_number: string;
  info_notes?: string;
  country: string;
  payment_method: string;
}

interface Country {
  iso: string;
  name: string;
  children_count: number;
}

export function DataTableDemo() {
  const auth = useAuth();
    const router = useRouter();


  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CapitalistWalletForm>();

  const onSubmit: SubmitHandler<CapitalistWalletForm> = async (data) => {
    const submitData = {
      ...data,
      publisher_id: auth?.publisherData?.id, 
      // publisher_id: 216346, 

    };

    console.log("Submitting data:", submitData);

    try {
      const response = await fetch("/api/paymentinfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Capitalist wallet saved successfully:", result);
      toast.success("Capitalist wallet saved successfully!");

      reset();
    } catch (err) {
      console.error("Error submitting capitalist wallet:", err);
      toast.error("Failed to save capitalist wallet. Please try again.");

    }
  };

  // const [country, setCountry] = useState("");
  const [countryList, setCountryList] = useState<Country[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("");

  const handleTabClick = (value: string) => {
    setPaymentMethod(value);
    setValue("payment_method", value);  // Set the form value
  };

  const loadCountry = async () => {
    try {
      const url = `https://panel.adsaro.com/admin/api/GeoCountries/?version=4&userToken=1wDtEkEz2ykyOdyx`;
      const response = await axios.get(url);
      const rows = response.data?.response?.rows;

      if (rows && typeof rows === "object") {
        const countriesArray = Object.values(rows) as Country[];
        setCountryList(countriesArray);
        console.log("Countries:", countriesArray);
      } else {
        console.warn("Invalid data format:", rows);
      }
    } catch (error) {
      console.error("Failed to load countries:", error);
    }
  };

  useEffect(() => {
    loadCountry();
  }, []);

  return (
    <div className="w-full mt-14">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex items-center justify-between pb-3">
        <nav className="flex items-center text-sm pl-3 text-gray-500">
          <a
            href="/publisher/dashboard"
            className="hover:text-gray-700 font-medium transition-colors"
          >
            Home
          </a>

          <span className="mx-2 text-gray-400">/</span>

          <span className="text-gray-800 font-semibold">Payment Information</span>
        </nav>

        <Button
          onClick={() => router.push("/publisher/paymenttranscation")}
          variant="outline"
          className="h-9"
        >
          Payment Transactions
        </Button>
      </div>

      <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        
        <Label htmlFor="paymentMethod" className="block text-md mb-2">
  Choose your payment method
</Label>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
  <button
    type="button"
    onClick={() => handleTabClick("WIRETRANSFER")}
    className={`flex items-center justify-center px-4 py-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
      paymentMethod === "WIRETRANSFER"
        ? "bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-200"
        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
    }`}
  >
    <div className="flex items-center">
      <div className={`mr-3 flex h-5 w-5 items-center justify-center rounded-full border ${
        paymentMethod === "WIRETRANSFER" ? "border-blue-500" : "border-gray-300"
      }`}>
        <div className={`h-2.5 w-2.5 rounded-full ${
          paymentMethod === "WIRETRANSFER" ? "bg-blue-500" : "bg-transparent"
        }`}></div>
      </div>
      <div>
        <span className="font-medium">ACH / Wire Transfer</span>
        <p className="text-xs text-gray-500 mt-1">Bank to bank transfer</p>
      </div>
    </div>
  </button>
  
  <button
    type="button"
    onClick={() => handleTabClick("DIRECT_DEPOSIT")}
    className={`flex items-center justify-center px-4 py-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
      paymentMethod === "DIRECT_DEPOSIT"
        ? "bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-200"
        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
    }`}
  >
    <div className="flex items-center">
      <div className={`mr-3 flex h-5 w-5 items-center justify-center rounded-full border ${
        paymentMethod === "DIRECT_DEPOSIT" ? "border-blue-500" : "border-gray-300"
      }`}>
        <div className={`h-2.5 w-2.5 rounded-full ${
          paymentMethod === "DIRECT_DEPOSIT" ? "bg-blue-500" : "bg-transparent"
        }`}></div>
      </div>
      <div>
        <span className="font-medium">Direct Deposit</span>
        <p className="text-xs text-gray-500 mt-1">Directly to your account</p>
      </div>
    </div>
  </button>
</div>

          {/* Any errors related to the payment method */}
          {errors.payment_method && (
            <p className="text-sm text-red-500">{errors.payment_method.message}</p>
          )}
          {[
            "wire_company", "wire_account", "wire_bank_name", "wire_bank_address", "wire_bank_city", "wire_bank_zip", "wire_routing", "wire_swift", "wire_iban", "wire_info"
          ].map((name) => (
            <div key={name}>
              <Label className="block mb-1 text-sm">{name.replace("_", " ").toUpperCase()}</Label>
              <Input
                type="text"
                {...register(name as keyof CapitalistWalletForm, { required: `${name} is required` })}
                placeholder={`Enter ${name.replace("_", " ").toLowerCase()}`}
                className="w-full p-2 border rounded"
              />
              {errors[name as keyof CapitalistWalletForm] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[name as keyof CapitalistWalletForm]?.message}
                </p>
              )}
            </div>
          ))}

          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <select
              id="country"
              className="w-full p-2 border rounded"
              onChange={(e) => {
                // setCountry(e.target.value);
                setValue("wire_bank_country_id", e.target.value);
              }}
              defaultValue=""
            >
              <option value="">Select a country</option>
              {countryList.map((country) => (
                <option key={country.iso} value={country.iso}>
                  {country.name} ({country.iso})
                </option>
              ))}
            </select>
            {errors.wire_bank_country_id && (
              <p className="text-sm text-red-500">{errors.wire_bank_country_id.message}</p>
            )}
          </div>

       

          <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
            Save Payment Info
          </Button>
        </form>
      </div>
    </div>
  );
}
