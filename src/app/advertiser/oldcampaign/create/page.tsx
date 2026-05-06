"use client";

import { AdContentForm } from "./AdContentForm";
import { useCallback, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AdvertiserSidebar } from "@/components/advertiser/app-sidebar";
import { SiteAdvertiserHeader } from "@/components/advertiser/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/context";
// import LocationTargeting from "./Location";
import TimeTargeting from "./TimeTargeting";
import OperatingSystem from "./operatingsystem";
import DeviceTargeting from "./Devicetargeting";
import DeviceBrand from "./Devicebrand";
import BrowserTargeting from "./Browsertargeting";
import Carriers from "./carriers";
// import AppLists from "./AppLists";
// import IpLists from "./IpLists";
// import IfaLists from "./IfaLists";
// import DomainLists from "./DomainLists";
import Image from "next/image";
import axios from "axios";

interface FormData {
  name: string;
  ad_vertical_id?: string;
  start_date: string;
  end_date: string;
  budget_daily: string;
  budget_total: string;
  defaultCpc: string;
  e_cpm: string;
  impressions_per_ip: number;
  clicks_per_ip: string;
  clicks_daily: string;
  pricing_model: string;
  title?: string;
  destination_url: string;
  ad_domain?: string;
  call_to_action?: string;
  sponsor_name?: string;
  description?: string;
  main_image?: FileList;
  icon_image?: FileList;
  video?: FileList;
  banner_size?: string;
  banner_type?: "TEXT" | "HTML" | "IMAGE" | "NATIVE" | "VIDEO";
  html_text?: string;
}

// Types for saved ad content and media items used in localStorage/state
type MediaImage = {
  width?: number;
  height?: number;
  type?: string;
  image?: unknown;
};

type MediaVideo = {
  video?: unknown;
};

interface SavedAdContentItem {
  title: string;
  desc: string | null;
  display: string | null;
  dest_url: string | null;
  cta?: string | null;
  sponsored: string | null;
  enabled: boolean;
  type: string | null;
  target_window: string;
  bannersize_id: number | null;
  html_text: string | null;
  images: MediaImage[];
  videos: MediaVideo[];
}

const adFormats = [
  {
    name: "Native Ad",
    value: "NATIVE",
    description: "Ads that match the form and function of the platform.",
    image: "/Nativeads.gif",
  },
  {
    name: "Push",
    value: "PUSH",
    description: "Push notification based ads.",
    image: "/pushads.gif",
  },
  {
    name: "Popunder / ClickUnder",
    value: "CPC",
    description:
      "Traditional onclick full-tabs with high visibility and wide reach",
    image: "/popunderad.gif",
  },
  {
    name: "CPC",
    value: "CPC",
    description: "Traditional display banner ads.",
    image: "/CPC.gif",
  },
  {
    name: "Display ( Banner )",
    value: "DISPLAY",
    description: "Traditional display banner ads.",
    image: "/Display_ads.gif",
  },
  // {
  //   name: "Inpage-Push",
  //   value: "FLOATING_PUSH",
  //   description: "Video ads that play within video content.",
  //   image: "/Inpageads.gif",
  // },
];

export default function Page() {
  console.log("📍 Main page: Component rendering");

  const [selected, setSelected] = useState(adFormats[0]);
  const [savedAdContents, setSavedAdContents] = useState<SavedAdContentItem[]>(
    []
  );

  // Load saved ad contents when campaign type changes
  useEffect(() => {
    const raw = localStorage.getItem(`adContents_${selected.value}`);
    console.log("daaaaaaaaaaaaaaaaaaaaaaaaaa");

    console.log(raw);
    if (!raw) {
      setSavedAdContents([]);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSavedAdContents(parsed);
      } else {
        // Guard against accidental primitives like 0 or objects
        setSavedAdContents([]);
      }
    } catch {
      // Invalid JSON (e.g., "0"), reset to empty
      setSavedAdContents([]);
    }
  }, [selected.value]);
  console.log("poooooooooooooooooooooooooooooooooooo");
  console.log(savedAdContents);

  // Handle when ad content is saved to localStorage
  // const handleAdContentSaved = () => {
  //   const saved = localStorage.getItem(`adContents_${selected.value}`);
  //   if (saved) {
  //     setSavedAdContents(JSON.parse(saved));
  //   }
  // };
  const [selectedOption, setSelectedOption] = useState("");
  const [option, setOption] = useState("immediate");
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [adVerticals, setAdVerticals] = useState<
    Array<{ id: string; vertical: string }>
  >([]);
  const [adVerticalLoading, setAdVerticalLoading] = useState(false);
  const [adVerticalError, setAdVerticalError] = useState<string | null>(null);
  // const [savedAdContent, setSavedAdContent] = useState<any>(null);

  // Effect to reset saved ad content when campaign type changes
  // useEffect(() => {
  //   setSavedAdContent(null);
  // }, [selected.value]);

  // Handle ad content save
  const handleAdContentSave = (
    payload: SavedAdContentItem[] | SavedAdContentItem
  ) => {
    try {
      // AdContentForm already persists to localStorage and passes back the
      // full updated array via onSave(updatedContents). To avoid duplicates,
      // do not write to localStorage here when an array is received.
      if (Array.isArray(payload)) {
        setSavedAdContents(payload);
        toast.success(`${selected.name} ad content saved successfully!`);
        return;
      }

      // Fallback: if a single item is ever passed, append to in-memory list
      // without writing to localStorage (child handles persistence elsewhere).
      setSavedAdContents((prev) => [...prev, payload]);
      toast.success(`${selected.name} ad content saved successfully!`);
    } catch (e) {
      console.error("Error handling ad content save:", e);
    }
  };

  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
    // watch,
  } = useForm<FormData>();
  const auth = useAuth();

  // Auto-select pricing model based on ad format selection
  useEffect(() => {
    if (!selected || !selected.value) return;
    const cpmFormats = new Set(["NATIVE", "DISPLAY"]);
    const autoPricing = cpmFormats.has(selected.value) ? "CPM" : "CPC";
    setSelectedOption(autoPricing);
    clearErrors(["pricing_model", "clicks_per_ip", "impressions_per_ip"]);
  }, [selected, clearErrors]);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.token) return;

          console.log("rowsyyyyyy" ,auth.token);

      setAdVerticalLoading(true);
      setAdVerticalError(null);
      try {
        const url = `https://panel.adsaro.com/admin/api/AdVertical/?version=5&userToken=l95U5k9sQhhlLEal`;
        const response = await axios.get(url);
        const rows = response.data?.response?.rows as
          | Record<string, { id?: string | number; vertical?: string }>
          | undefined;

          console.log("rowsyyyyyy",rows);

        const list = rows
          ? Object.entries(rows).map(([key, value]) => ({
              id: String(value?.id ?? key),
              vertical: String(value?.vertical ?? key),
            }))
          : [];


          console.log("list",list);

        setAdVerticals(list);
      } catch (error) {
        console.error("Error fetching data:", error);
        setAdVerticalError("Failed to load Ad Verticals");
        setAdVerticals([]);
      } finally {
        setAdVerticalLoading(false);
      }
    };

    fetchData();
  }, [auth.token]);



  // Location targeting
  // Initialize with default values using lazy initializer to avoid
  // mutating state during render which would cause re-renders.
  const [locationIds] = useState<Set<string>>(() => new Set(["test"]));
  const [locationData] = useState<
    Array<{
      id: string;
      name: string;
      type: string;
      enabled: boolean;
      bid_adjustment: number;
    }>
  >(() => [
    {
      id: "np",
      name: "np",
      type: "COUNTRY",
      enabled: true,
      bid_adjustment: 1.5,
    },
  ]);

  // const handleLocationSelection = useCallback(
  //   (selectedIds: Set<string>) => {
  //     const newIds = Array.from(selectedIds).sort().join(",");
  //     const currentIds = Array.from(locationIds).sort().join(",");

  //     if (newIds !== currentIds) {
  //       setLocationIds(new Set(selectedIds));
  //     }
  //   },
  //   [locationIds]
  // );

  // Operating system targeting
  const [operatingSystem, setOperatingSystem] = useState<Set<string>>(
    new Set()
  );
  const [operatingSystemData, setOperatingSystemData] = useState<
    Array<{
      id: string;
      name: string;
      type: string;
      bid_adjustment?: number;
      enabled?: boolean;
    }>
  >([]);

  const handleOperatingSystemSelection = useCallback(
    (selectedIds: Set<string>) => {
      // Only update state if value has changed to prevent infinite loop
      const newIds = Array.from(selectedIds).sort().join(",");
      const currentIds = Array.from(operatingSystem).sort().join(",");

      if (newIds !== currentIds) {
        console.log("🔄 Operating system selection changed:", {
          from: Array.from(operatingSystem),
          to: Array.from(selectedIds),
          timestamp: new Date().toISOString(),
        });
        setOperatingSystem(new Set(selectedIds));
      }
    },
    [operatingSystem]
  );

  const handleOperatingSystemDataChange = useCallback(
    (
      operatingSystemData: Array<{
        id: string;
        name: string;
        type: string;
        bid_adjustment?: number;
        enabled?: boolean;
      }>
    ) => {
      console.log("🔄 Operating system data changed:", {
        count: operatingSystemData.length,
        types: operatingSystemData.map((os) => os.type),
        timestamp: new Date().toISOString(),
      });
      setOperatingSystemData(operatingSystemData);
    },
    []
  );

  // Device type targeting
  const [deviceIds, setDeviceIds] = useState<Set<string>>(new Set());
  const [deviceData, setDeviceData] = useState<
    Array<{ id: string; name: string; type: string }>
  >([]);

  const handleDeviceSelection = useCallback(
    (selectedIds: Set<string>) => {
      // Only update state if value has changed to prevent infinite loop
      const newIds = Array.from(selectedIds).sort().join(",");
      const currentIds = Array.from(deviceIds).sort().join(",");

      if (newIds !== currentIds) {
        setDeviceIds(new Set(selectedIds));
      }
    },
    [deviceIds]
  );

  const handleDeviceDataChange = useCallback(
    (deviceData: Array<{ id: string; name: string; type: string }>) => {
      setDeviceData(deviceData);
    },
    []
  );

  // Device brand targeting
  const [deviceBrand, setDeviceBrand] = useState<Set<string>>(new Set());
  const [deviceBrandData, setDeviceBrandData] = useState<
    Array<{ id: string; name: string; type: string }>
  >([]);

  const handleDeviceBrandSelection = useCallback(
    (selectedIds: Set<string>) => {
      // Only update state if value has changed to prevent infinite loop
      const newIds = Array.from(selectedIds).sort().join(",");
      const currentIds = Array.from(deviceBrand).sort().join(",");

      if (newIds !== currentIds) {
        setDeviceBrand(new Set(selectedIds));
      }
    },
    [deviceBrand]
  );

  const handleDeviceBrandDataChange = useCallback(
    (deviceBrandData: Array<{ id: string; name: string; type: string }>) => {
      setDeviceBrandData(deviceBrandData);
    },
    []
  );

  // Browser targeting
  const [browsers, setBrowserIds] = useState<Set<string>>(new Set());
  const [browserData, setBrowserData] = useState<
    Array<{
      id: string;
      name: string;
      type: string;
      bid_adjustment?: number;
      enabled?: boolean;
    }>
  >([]);

  const handleBrowserSelection = useCallback(
    (selectedIds: Set<string>) => {
      // Only update state if value has changed to prevent infinite loop
      const newIds = Array.from(selectedIds).sort().join(",");
      const currentIds = Array.from(browsers).sort().join(",");

      if (newIds !== currentIds) {
        setBrowserIds(new Set(selectedIds));
      }
    },
    [browsers]
  );

  const handleBrowserDataChange = useCallback(
    (
      browserData: Array<{
        id: string;
        name: string;
        type: string;
        bid_adjustment?: number;
        enabled?: boolean;
      }>
    ) => {
      console.log("🔄 Browser data changed:", {
        count: browserData.length,
        ids: browserData.map((browser) => browser.id),
        timestamp: new Date().toISOString(),
      });
      setBrowserData(browserData);
    },
    []
  );

  // Carrier targeting
  const [carriers, setCarriers] = useState<Set<string>>(new Set());
  const [carrierData, setCarrierData] = useState<
    Array<{ id: string; name: string; type: string }>
  >([]);

  const handleCarrierSelection = useCallback(
    (selectedIds: Set<string>) => {
      // Only update state if value has changed to prevent infinite loop
      const newIds = Array.from(selectedIds).sort().join(",");
      const currentIds = Array.from(carriers).sort().join(",");

      if (newIds !== currentIds) {
        setCarriers(new Set(selectedIds));
      }
    },
    [carriers]
  );

  const handleCarrierDataChange = useCallback(
    (carrierData: Array<{ id: string; name: string; type: string }>) => {
      setCarrierData(carrierData);
    },
    []
  );

  // Time targeting
  const [timeSlots, setTimeSlots] = useState<Set<string>>(new Set());
  const [timeData, setTimeData] = useState<
    Array<{ day: string; time_periods: string[] }>
  >([]);

  // App lists targeting
  // const [appListIds, setAppListIds] = useState<Set<string>>(new Set());
  // const [appListData, setAppListData] = useState<
  //   Array<{ id: string; name: string; type: string }>
  // >([]);

  // IP lists targeting
  // const [ipListIds, setIpListIds] = useState<Set<string>>(new Set());
  // const [ipListData, setIpListData] = useState<
  //   Array<{ id: string; name: string; type: string }>
  // >([]);

  // IFA lists targeting
  // const [ifaListIds, setIfaListIds] = useState<Set<string>>(new Set());
  // const [ifaListData, setIfaListData] = useState<
  //   Array<{ id: string; name: string; type: string }>
  // >([]);

  // Domain lists targeting
  // const [domainListIds, setDomainListIds] = useState<Set<string>>(new Set());
  // const [domainListData, setDomainListData] = useState<
  //   Array<{ id: string; name: string; type: string; domains?: string }>
  // >([]);

  const handleTimeSelection = useCallback(
    (selectedSlots: Set<string>) => {
      console.log(
        "🔄 Main page: handleTimeSelection called with:",
        Array.from(selectedSlots)
      );
      console.log("🔄 Main page: Current timeSlots:", Array.from(timeSlots));

      // Only update state if value has changed to prevent infinite loop
      const newSlots = Array.from(selectedSlots).sort().join(",");
      const currentSlots = Array.from(timeSlots).sort().join(",");

      if (newSlots !== currentSlots) {
        console.log("🔄 Main page: Updating timeSlots state");
        setTimeSlots(new Set(selectedSlots));
      } else {
        console.log("🔄 Main page: No change detected, skipping update");
      }
    },
    [timeSlots]
  );

  const handleTimeDataChange = useCallback(
    (timeData: Array<{ day: string; time_periods: string[] }>) => {
      console.log("🔄 Main page: Time data changed:", {
        count: timeData.length,
        days: timeData.map((t) => t.day),
        timestamp: new Date().toISOString(),
      });
      console.log("🔄 Main page: Full timeData:", timeData);

      // Validate that we're only receiving selected days
      if (timeData.length > 0) {
        const receivedDays = timeData.map((t) => t.day);
        console.log("🔄 Main page: Received days:", receivedDays);
        console.log("🔄 Main page: Expected only selected days, not all days");
      }

      setTimeData(timeData);
    },
    []
  );

  // App lists targeting handlers
  // const handleAppListSelection = useCallback(
  //   (selectedIds: Set<string>) => {
  //     // Only update state if value has changed to prevent infinite loop
  //     const newIds = Array.from(selectedIds).sort().join(",");
  //     const currentIds = Array.from(appListIds).sort().join(",");

  //     if (newIds !== currentIds) {
  //       setAppListIds(new Set(selectedIds));
  //     }
  //   },
  //   [appListIds]
  // );

  // const handleAppListDataChange = useCallback(
  //   (appListData: Array<{ id: string; name: string; type: string }>) => {
  //     setAppListData(appListData);
  //   },
  //   []
  // );

  // IP lists targeting handlers
  // const handleIpListSelection = useCallback(
  //   (selectedIds: Set<string>) => {
  //     // Only update state if value has changed to prevent infinite loop
  //     const newIds = Array.from(selectedIds).sort().join(",");
  //     const currentIds = Array.from(ipListIds).sort().join(",");

  //     if (newIds !== currentIds) {
  //       setIpListIds(new Set(selectedIds));
  //     }
  //   },
  //   [ipListIds]
  // );

  // const handleIpListDataChange = useCallback(
  //   (ipListData: Array<{ id: string; name: string; type: string }>) => {
  //     setIpListData(ipListData);
  //   },
  //   []
  // );

  // IFA lists targeting handlers
  // const handleIfaListSelection = useCallback(
  //   (selectedIds: Set<string>) => {
  //     // Only update state if value has changed to prevent infinite loop
  //     const newIds = Array.from(selectedIds).sort().join(",");
  //     const currentIds = Array.from(ifaListIds).sort().join(",");

  //     if (newIds !== currentIds) {
  //       setIfaListIds(new Set(selectedIds));
  //     }
  //   },
  //   [ifaListIds]
  // );

  // const handleIfaListDataChange = useCallback(
  //   (ifaListData: Array<{ id: string; name: string; type: string }>) => {
  //     setIfaListData(ifaListData);
  //   },
  //   []
  // );

  // Domain lists targeting handlers
  // const handleDomainListSelection = useCallback(
  //   (selectedIds: Set<string>) => {
  //     // Only update state if value has changed to prevent infinite loop
  //     const newIds = Array.from(selectedIds).sort().join(",");
  //     const currentIds = Array.from(domainListIds).sort().join(",");

  //     if (newIds !== currentIds) {
  //       setDomainListIds(new Set(selectedIds));
  //     }
  //   },
  //   [domainListIds]
  // );

  // const handleDomainListDataChange = useCallback(
  //   (
  //     domainListData: Array<{
  //       id: string;
  //       name: string;
  //       type: string;
  //       domains?: string;
  //     }>
  //   ) => {
  //     setDomainListData(domainListData);
  //   },
  //   []
  // );

  console.log("locationIds", locationIds);
  console.log("operatingSystem", operatingSystem);
  console.log("deviceIds", deviceIds);
  console.log("deviceBrand", deviceBrand);
  console.log("browsers", browsers);
  console.log("carriers", carriers);
  console.log("timeSlots", timeSlots);
  console.log("timeData", timeData);
  // console.log("appListIds", appListIds);
  // console.log("ipListIds", ipListIds);
  // console.log("ifaListIds", ifaListIds);
  // console.log("domainListIds", domainListIds);
  // console.log("browsers",browsers)
  // console.log("aaa", deviceIds);

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return Boolean(selected.value && selectedOption); // Basic validation for step 1
      case 2:
        return true; // Targeting is optional
      case 3:
        return true; // No required fields for campaign create at this step; OfferAd will validate destination_url
      case 4:
        return true; // Review step
      default:
        return false;
    }
  };

  const onSubmit = async (data: FormData) => {
    // Basic client-side validation to avoid unnecessary API calls
    if (!selectedOption) {
      setError("pricing_model", {
        type: "custom",
        message: "Please select a pricing model",
      });
      toast.error("Please select a pricing model");
      return;
    }

    const clicksPerIp = Number(data.clicks_per_ip);
    const impressionsPerIp = Number(data.impressions_per_ip);

    if (Number.isNaN(clicksPerIp) || clicksPerIp < 1 || clicksPerIp > 50) {
      setError("clicks_per_ip", {
        type: "custom",
        message: "Clicks per IP must be between 1 and 50",
      });
      toast.error("Clicks per IP must be between 1 and 50");
      return;
    }

    if (
      Number.isNaN(impressionsPerIp) ||
      impressionsPerIp < 1 ||
      impressionsPerIp > 50
    ) {
      setError("impressions_per_ip", {
        type: "custom",
        message: "Impressions per IP must be between 1 and 50",
      });
      toast.error("Impressions per IP must be between 1 and 50");
      return;
    }

    setIsSubmitting(true);
    const datas = {
      token: auth.token,
      collectdata: {
        name: data.name,
        ad_vertical_id: data.ad_vertical_id ? Number(data.ad_vertical_id) : null,
        type: selected.value,
        budget_total: Number(data.budget_total) / 145,
        budget_daily: Number(data.budget_daily) / 145,
        clicks_daily: Number(data.clicks_daily),
        clicks_per_ip: clicksPerIp,
        impressions_per_ip: impressionsPerIp,
        pricing_model: selectedOption,
        // If the date inputs are empty strings, convert to null so the
        // backend doesn't receive an invalid empty date string.
        // When option === 'immediate' these will typically be empty.
        start_date: data.start_date ? data.start_date : null,
        end_date: data.end_date ? data.end_date : null,
        // Location targeting handled separately by Location component via OfferNew API
        // time_slots: Array.from(timeSlots), // Temporarily commented out - API doesn't support time_slots field
        // device_ids: Array.from(deviceIds), // Temporarily commented out - API doesn't support device_ids field
        // device_brand_ids: Array.from(deviceBrand), // Temporarily commented out - API doesn't support device_brand_ids field
        // carrier_ids: Array.from(career), // Temporarily commented out - API doesn't support carrier_ids field
        // browser_ids: Array.from(browsers), // Temporarily commented out - API doesn't support browser_ids field
        // operating_system_ids: Array.from(operatingsystem), // Temporarily commented out - API doesn't support operating_system_ids field
      },
    };

    console.log("Campaign data being sent:", JSON.stringify(datas, null, 2));
    console.log("Location IDs:", Array.from(locationIds));
    console.log("Location data for targeting:", locationData);
    console.log("Device Type IDs:", Array.from(deviceIds));
    console.log("Device Brand IDs:", Array.from(deviceBrand));
    console.log("Device data for targeting:", deviceData);
    console.log("Device Brand data for targeting:", deviceBrandData);
    // console.log("App List IDs:", Array.from(appListIds));
    // console.log("IP List IDs:", Array.from(ipListIds));
    // console.log("IFA List IDs:", Array.from(ifaListIds));
    // console.log("Domain List IDs:", Array.from(domainListIds));
    console.log("Operating System IDs:", Array.from(operatingSystem));
    console.log("Operating System data for targeting:", operatingSystemData);
    console.log("Device Type IDs:", Array.from(deviceIds));
    console.log("Device Brand IDs:", Array.from(deviceBrand));
    console.log("Browser IDs:", Array.from(browsers));
    console.log("Browser data for targeting:", browserData);
    console.log("Carrier IDs:", Array.from(carriers));
    console.log("Carrier data for targeting:", carrierData);
    console.log(
      "Location targeting: Handled separately via Location component and OfferNew API"
    );
    console.log(
      "Device targeting: Handled separately via DeviceTargeting component and OfferNew API"
    );
    console.log(
      "Device Brand targeting: Handled separately via DeviceBrand component and OfferNew API"
    );
    console.log(
      "Carrier targeting: Handled separately via Carriers component and OfferNew API"
    );
    console.log(
      "Operating System targeting: Handled separately via OperatingSystem component and Operating System Targeting API"
    );

    try {
      const response = await fetch("/api/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: datas }),
      });
      const result = await response.json();

      // Debug: Check what we have after campaign creation
      console.log("🔍 DEBUG: After campaign creation");
      console.log("🔍 Campaign result:", result);
      console.log("🔍 Campaign result type:", typeof result);
      console.log("🔍 Campaign result keys:", Object.keys(result));

      // Deep dive into the response structure
      if (result.response) {
        console.log("🔍 Response keys:", Object.keys(result.response));
        console.log("🔍 Response type:", typeof result.response);

        if (result.response.rows) {
          console.log("🔍 Rows type:", typeof result.response.rows);
          console.log("🔍 Rows keys:", Object.keys(result.response.rows));
          console.log(
            "🔍 Rows length:",
            Object.keys(result.response.rows).length
          );

          const firstRowKey = Object.keys(result.response.rows)[0];
          if (firstRowKey) {
            console.log("🔍 First row key:", firstRowKey);
            console.log(
              "🔍 First row data:",
              result.response.rows[firstRowKey]
            );
            console.log(
              "🔍 First row type:",
              typeof result.response.rows[firstRowKey]
            );
            if (result.response.rows[firstRowKey]) {
              console.log(
                "🔍 First row keys:",
                Object.keys(result.response.rows[firstRowKey])
              );
            }
          }
        }

        // Check for other possible ID fields
        console.log("🔍 Response.id:", result.response.id);
        console.log("🔍 Response.campaign_id:", result.response.campaign_id);
        console.log("🔍 Response.campaignId:", result.response.campaignId);
      }

      // Check direct result properties
      console.log("🔍 Result.id:", result.id);
      console.log("🔍 Result.campaign_id:", result.campaign_id);
      console.log("🔍 Result.campaignId:", result.campaignId);
      console.log("🔍 Result.ad_campaign_id:", result.ad_campaign_id);

      console.log("🔍 Location IDs:", Array.from(locationIds));
      console.log("🔍 Location data:", locationData);
      console.log("🔍 Device IDs:", Array.from(deviceIds));
      console.log("🔍 Device data:", deviceData);
      console.log("🔍 Device Brand IDs:", Array.from(deviceBrand));
      console.log("🔍 Device Brand data:", deviceBrandData);
      console.log("🔍 Carrier IDs:", Array.from(carriers));
      console.log("🔍 Carrier data:", carrierData);
      console.log("🔍 Auth token:", auth.token ? "Available" : "Missing");

      if (result.status === "OK") {
        console.log("🎉 CAMPAIGN CREATED SUCCESSFULLY!");
        console.log("📋 Campaign creation result:", result);
        console.log("📍 Location IDs selected:", Array.from(locationIds));
        console.log("📊 Location data available:", locationData);
        console.log(
          "💻 Operating System IDs selected:",
          Array.from(operatingSystem)
        );
        console.log("💻 Operating System data available:", operatingSystemData);
        console.log("📱 Device IDs selected:", Array.from(deviceIds));
        console.log("📱 Device data available:", deviceData);
        console.log("📱 Device Brand IDs selected:", Array.from(deviceBrand));
        console.log("📱 Device Brand data available:", deviceBrandData);
        console.log("🌐 Browser IDs selected:", Array.from(browsers));
        console.log("🌐 Browser data available:", browserData);
        console.log("📱 Carrier IDs selected:", Array.from(carriers));
        console.log("📱 Carrier data available:", carrierData);
        console.log("🕐 Time slots selected:", Array.from(timeSlots));
        console.log("🕐 Time data available:", timeData);

        // If campaign was created successfully and we have targeting data, submit targeting
        if (
          (locationIds.size > 0 && locationData && locationData.length > 0) ||
          (operatingSystem.size > 0 &&
            operatingSystemData &&
            operatingSystemData.length > 0) ||
          deviceIds.size > 0 ||
          deviceBrand.size > 0 ||
          carriers.size > 0 ||
          (browsers.size > 0 && browserData && browserData.length > 0) ||
          (timeSlots.size > 0 && timeData && timeData.length > 0)
          // ||
          // appListIds.size > 0 ||
          // ipListIds.size > 0 ||
          // ifaListIds.size > 0 ||
          // domainListIds.size > 0
        ) {
          try {
            console.log(
              "🚀 Starting separate location, operating system, and device targeting setup..."
            );

            // Extract campaign ID from the response - handle different response formats
            let campaignId;
            console.log(
              "🔍 Full campaign response structure:",
              JSON.stringify(result, null, 2)
            );

            // Try multiple ways to extract campaign ID
            console.log("🔍 Attempting to extract campaign ID...");

            // Helper function to search recursively for campaign ID
            const findCampaignId = (
              obj: unknown,
              path: string = ""
            ): string | number | null => {
              if (!obj || typeof obj !== "object") return null;

              const objRecord = obj as Record<string, unknown>;

              // Check if this object has an ID field
              if (
                objRecord.id &&
                (typeof objRecord.id === "number" ||
                  typeof objRecord.id === "string")
              ) {
                console.log(
                  `🔍 Found potential ID at ${path}.id:`,
                  objRecord.id
                );
                return objRecord.id;
              }
              if (
                objRecord.ad_campaign_id &&
                (typeof objRecord.ad_campaign_id === "number" ||
                  typeof objRecord.ad_campaign_id === "string")
              ) {
                console.log(
                  `🔍 Found potential ad_campaign_id at ${path}.ad_campaign_id:`,
                  objRecord.ad_campaign_id
                );
                return objRecord.ad_campaign_id;
              }
              if (
                objRecord.campaign_id &&
                (typeof objRecord.campaign_id === "number" ||
                  typeof objRecord.campaign_id === "string")
              ) {
                console.log(
                  `🔍 Found potential campaign_id at ${path}.campaign_id:`,
                  objRecord.campaign_id
                );
                return objRecord.campaign_id;
              }
              if (
                objRecord.campaignId &&
                (typeof objRecord.campaignId === "number" ||
                  typeof objRecord.campaignId === "string")
              ) {
                console.log(
                  `🔍 Found potential campaignId at ${path}.campaignId:`,
                  objRecord.campaignId
                );
                return objRecord.campaignId;
              }

              // Recursively search through all properties
              for (const key in objRecord) {
                if (
                  objRecord.hasOwnProperty(key) &&
                  typeof objRecord[key] === "object"
                ) {
                  const found = findCampaignId(
                    objRecord[key],
                    `${path}.${key}`
                  );
                  if (found) return found;
                }
              }

              return null;
            };

            // Try standard extraction methods first
            console.log(
              "🔍 Checking result.response?.created:",
              result.response?.created
            );
            console.log("🔍 Created type:", typeof result.response?.created);

            if (result.response?.created) {
              if (
                Array.isArray(result.response.created) &&
                result.response.created.length > 0
              ) {
                // Check if created array has objects with ID
                const firstCreated = result.response.created[0];
                console.log("🔍 First created item:", firstCreated);
                console.log("🔍 First created type:", typeof firstCreated);

                if (typeof firstCreated === "object" && firstCreated !== null) {
                  console.log(
                    "🔍 First created keys:",
                    Object.keys(firstCreated)
                  );

                  if (firstCreated.id) {
                    campaignId = firstCreated.id;
                    console.log(
                      "✅ Found campaign ID in result.response.created[0].id:",
                      campaignId
                    );
                  } else if (firstCreated.ad_campaign_id) {
                    campaignId = firstCreated.ad_campaign_id;
                    console.log(
                      "✅ Found campaign ID in result.response.created[0].ad_campaign_id:",
                      campaignId
                    );
                  } else if (firstCreated.campaign_id) {
                    campaignId = firstCreated.campaign_id;
                    console.log(
                      "✅ Found campaign ID in result.response.created[0].campaign_id:",
                      campaignId
                    );
                  } else {
                    console.log("❌ No ID found in first created item");
                  }
                } else if (
                  typeof firstCreated === "number" ||
                  typeof firstCreated === "string"
                ) {
                  // If created array contains direct IDs
                  campaignId = firstCreated;
                  console.log(
                    "✅ Found campaign ID in result.response.created[0] (direct):",
                    campaignId
                  );
                }
              } else if (
                typeof result.response.created === "number" ||
                typeof result.response.created === "string"
              ) {
                // If created is a direct number/string (not an array)
                campaignId = result.response.created;
                console.log(
                  "✅ Found campaign ID in result.response.created (direct):",
                  campaignId
                );
              }
            } else if (result.response?.id) {
              campaignId = result.response.id;
              console.log(
                "✅ Found campaign ID in result.response.id:",
                campaignId
              );
            } else if (
              result.response?.rows &&
              Object.keys(result.response.rows).length > 0
            ) {
              const firstCampaignKey = Object.keys(result.response.rows)[0];
              const firstRow = result.response.rows[firstCampaignKey];
              console.log("🔍 First row data:", firstRow);
              console.log("🔍 First row keys:", Object.keys(firstRow));

              if (firstRow.id) {
                campaignId = firstRow.id;
                console.log(
                  "✅ Found campaign ID in result.response.rows[0].id:",
                  campaignId
                );
              } else if (firstRow.ad_campaign_id) {
                campaignId = firstRow.ad_campaign_id;
                console.log(
                  "✅ Found campaign ID in result.response.rows[0].ad_campaign_id:",
                  campaignId
                );
              } else {
                console.log("❌ No ID found in first row");
              }
            } else if (result.id) {
              campaignId = result.id;
              console.log("✅ Found campaign ID in result.id:", campaignId);
            } else if (result.response?.campaign_id) {
              campaignId = result.response.campaign_id;
              console.log(
                "✅ Found campaign ID in result.response.campaign_id:",
                campaignId
              );
            } else if (result.response?.campaignId) {
              campaignId = result.response.campaignId;
              console.log(
                "✅ Found campaign ID in result.response.campaignId:",
                campaignId
              );
            } else if (result.ad_campaign_id) {
              campaignId = result.ad_campaign_id;
              console.log(
                "✅ Found campaign ID in result.ad_campaign_id:",
                campaignId
              );
            } else {
              console.log(
                "🔍 Standard extraction failed, trying recursive search..."
              );
              const foundId = findCampaignId(result, "result");
              if (foundId) {
                campaignId = foundId;
                console.log(
                  "✅ Found campaign ID through recursive search:",
                  campaignId
                );
              } else {
                console.error("❌ COULD NOT EXTRACT CAMPAIGN ID!");
                console.error("Response structure:", result);
                console.error("Available keys:", Object.keys(result));
                if (result.response) {
                  console.error("Response keys:", Object.keys(result.response));
                  if (result.response.created) {
                    console.error("Created array:", result.response.created);
                  }
                  if (result.response.rows) {
                    console.error("Rows structure:", result.response.rows);
                  }
                }
                throw new Error("Could not extract campaign ID from response");
              }
            }

            console.log("thisismycampaignid", campaignId);

            // After extracting campaignId, create a lightweight Ad payload for consolidated targeting (no images)
            // Helper to get image dimensions
            const getImageDimensions = (
              file: File
            ): Promise<{ width: number; height: number }> => {
              return new Promise((resolve, reject) => {
                const img = new window.Image();
                img.onload = () => {
                  resolve({ width: img.width, height: img.height });
                };
                img.onerror = reject;
                img.src = URL.createObjectURL(file);
              });
            };

            // Helper to get video metadata
            const getVideoMetadata = (
              file: File
            ): Promise<{ width: number; height: number; duration: number }> => {
              return new Promise((resolve, reject) => {
                const video = document.createElement("video");
                video.preload = "metadata";
                video.onloadedmetadata = () => {
                  resolve({
                    width: video.videoWidth,
                    height: video.videoHeight,
                    duration: video.duration,
                  });
                };
                video.onerror = reject;
                video.src = URL.createObjectURL(file);
              });
            };

            // Helper to convert file to base64
            const fileToBase64 = (file: File): Promise<string> => {
              return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              });
            };

            // Normalize base64 string: strip whitespace/newlines, remove surrounding quotes
            // and pad with '=' so length is a multiple of 4. This avoids server errors like
            // 'Length of Base64 encoded input string is not a multiple of 4.'
            const normalizeBase64 = (input: string) => {
              if (!input) return input;
              let s = input.replace(/\s+/g, ""); // remove whitespace/newlines
              // Remove surrounding quotes if present (defensive)
              if (s.startsWith('"') && s.endsWith('"')) {
                s = s.slice(1, -1);
              }
              // Add padding if required
              const mod = s.length % 4;
              if (mod > 0) {
                s += "=".repeat(4 - mod);
              }
              return s;
            };

            // Build images array (ImageValue[])
            const buildImages = async () => {
              const images: Array<{
                width: number;
                height: number;
                type: string;
                image: string;
                filename?: string;
              }> = [];
              if (data.main_image && data.main_image.length > 0) {
                const file = data.main_image[0];
                const { width, height } = await getImageDimensions(file);
                const base64 = await fileToBase64(file);
                // Strip data URL prefix if present (data:<mime>;base64,...) and keep raw base64
                const rawBase64 = base64.includes(",")
                  ? base64.split(",")[1]
                  : base64;
                // According to docs UploadValue when using base64 must be set as JSON string
                images.push({
                  width,
                  height,
                  type: "MAIN",
                  image: normalizeBase64(rawBase64),
                  filename:
                    file.name ||
                    `main.${(file.type && file.type.split("/")[1]) || "png"}`,
                });
              }
              if (data.icon_image && data.icon_image.length > 0) {
                const file = data.icon_image[0];
                const { width, height } = await getImageDimensions(file);
                const base64 = await fileToBase64(file);
                const rawBase64 = base64.includes(",")
                  ? base64.split(",")[1]
                  : base64;
                images.push({
                  width,
                  height,
                  type: "ICON",
                  image: normalizeBase64(rawBase64),
                  filename:
                    file.name ||
                    `icon.${(file.type && file.type.split("/")[1]) || "png"}`,
                });
              }
              return images.length > 0 ? images : undefined;
            };

            // Build videos array (VideoValue[])
            const buildVideos = async () => {
              if (data.video && data.video.length > 0) {
                const file = data.video[0];
                const { width, height, duration } = await getVideoMetadata(
                  file
                );
                const base64 = await fileToBase64(file);
                const rawBase64 = base64.includes(",")
                  ? base64.split(",")[1]
                  : base64;
                // Guess type from file extension and map to allowed enum values
                const extRaw =
                  file.name.split(".").pop()?.toUpperCase() || "MP4";
                const extMap = (e: string) => {
                  if (["MP4", "AVI", "WEBM", "MPEG", "QUICKTIME"].includes(e))
                    return e;
                  if (e === "MOV") return "QUICKTIME";
                  return "MP4";
                };
                const ext = extMap(extRaw);
                // Bitrate is not available from browser, set as 0 or estimate if needed
                return [
                  {
                    width,
                    height,
                    bitrate: 0,
                    duration: Math.round(duration),
                    type: ext,
                    filename: file.name,
                    video: normalizeBase64(rawBase64),
                  },
                ];
              }
              return undefined;
            };

            // Await images and videos
            const images = await buildImages();
            const videos = await buildVideos();

            // Determine Ad.content type expected by API (enum: TEXT, HTML, IMAGE, NATIVE, VIDEO)
            const rawBannerType = data.banner_type;
            const contentEnums = new Set([
              "TEXT",
              "HTML",
              "IMAGE",
              "NATIVE",
              "VIDEO",
            ]);
            let adType: string | undefined = undefined;

            if (rawBannerType && typeof rawBannerType === "string") {
              const up = rawBannerType.toUpperCase();
              if (contentEnums.has(up)) adType = up;
            }

            // If banner_type not provided or not a content enum, map ad format to content type
            if (!adType) {
              switch (selected.value) {
                case "NATIVE":
                  adType = "NATIVE";
                  break;
                case "PUSH":
                case "FLOATING_PUSH":
                  adType = "TEXT";
                  break;
                case "POPUNDER":
                  adType = "HTML";
                  break;
                case "DISPLAY":
                default:
                  adType = "IMAGE";
                  break;
              }
            }

            // For HTML/POP campaigns, create a default minimal base64 image to bypass API validation
            const defaultPopImage = adType === "HTML" ? [{
              type: "MAIN",
              width: 300,
              height: 250,
              image: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", // 1x1 transparent PNG
            }] : [];

            // Get ad contents from localStorage for this campaign type
            const savedAdContents = JSON.parse(
              localStorage.getItem(`adContents_${selected.value}`) || "[]"
            );
            console.log("loocalstorage_savedAdContents", savedAdContents);

            // If we have saved ad contents, ensure they contain images/videos; otherwise fallback to freshly built ones
            const adContents = (
              savedAdContents.length > 0
                ? savedAdContents.map((c: SavedAdContentItem) => {
                    // For HTML/POP type, use default image to bypass API validation
                    if (adType === "HTML") {
                      return {
                        ...c,
                        images: defaultPopImage, // Use default 1x1 image
                        videos: [],
                      };
                    }
                    // For TEXT type (PUSH), no images needed
                    if (adType === "TEXT") {
                      const { images: _, ...rest } = c;
                      return {
                        ...rest,
                        videos: videos || [],
                      };
                    }
                    // For IMAGE/NATIVE types, keep images
                    return {
                      ...c,
                      images: Array.isArray(c.images) && c.images.length > 0
                        ? c.images
                        : images || [],
                      videos: videos || [],
                    };
                  })
                : [
                    {
                      title: data.title || adType,
                      desc: data.description || null,
                      display: data.ad_domain || null,
                      dest_url: data.destination_url || null,
                      cta: data.call_to_action || null,
                      sponsored: data.sponsor_name || null,
                      enabled: true,
                      type: adType || null, // Use computed adType, not data.banner_type
                      target_window: "NEW",
                      bannersize_id: data.banner_size
                        ? Number(data.banner_size)
                        : 12, // Default to 12 for all campaigns
                      html_text: data.html_text || null,
                      // For HTML/POP type, use default image to bypass API validation
                      ...(adType === "HTML" ? {
                        images: defaultPopImage,
                      } : {}),
                      // Only include images for IMAGE/NATIVE types
                      ...(adType === "IMAGE" || adType === "NATIVE" ? {
                        images: images || [],
                      } : {}),
                      // Only include videos for VIDEO type
                      ...(selected.value === "VIDEO" ? {
                        videos: videos || [],
                      } : {}),
                    },
                  ]
            ).map((c: SavedAdContentItem) => ({
              ...c,
              // Only include images for IMAGE/NATIVE types
              ...(adType === "IMAGE" || adType === "NATIVE" ? {
                images: Array.isArray(c.images) && c.images.length > 0
                  ? c.images
                  : images || [],
              } : { images: undefined }),
              // Only include videos for VIDEO type
              ...(selected.value === "VIDEO" ? {
                videos: Array.isArray(c.videos) && c.videos.length > 0
                  ? c.videos
                  : videos || [],
              } : {}),
            }));

            // Ensure any base64 strings in saved contents are normalized (strip data: prefix and pad to length % 4 === 0)
            const sanitizeUploadValue = (val: unknown): unknown => {
              if (typeof val !== "string") return val;
              const original = val;
              let s = original;
              // If the value is a JSON string like '{"image":"..."}', extract the inner value
              if (s.trim().startsWith("{") || s.trim().startsWith("[")) {
                try {
                  const parsed = JSON.parse(s);
                  if (
                    parsed &&
                    typeof parsed === "object" &&
                    typeof parsed.image === "string"
                  ) {
                    s = parsed.image as string;
                  }
                } catch {}
              }
              let fromDataUrl = false;
              if (s.startsWith("data:")) {
                const splitIdx = s.indexOf(",");
                s = splitIdx >= 0 ? s.slice(splitIdx + 1) : s;
                fromDataUrl = true;
              }
              // remove whitespace/newlines
              s = s.replace(/\s+/g, "");
              // Decide if we should treat as base64 or as a File ID
              const looksNumericId = /^\d{1,32}$/.test(s);
              const looksUuidLike = /^[0-9a-fA-F-]{8,}$/.test(s);
              const containsB64Symbols = /[+/=]/.test(s);
              const base64CharsetOnly = /^[A-Za-z0-9+/=]+$/.test(s);
              const longEnoughToBeB64 = s.length >= 24;
              const lengthNotMultipleOf4 = s.length % 4 !== 0;
              const shouldTreatAsBase64 =
                fromDataUrl ||
                containsB64Symbols ||
                (base64CharsetOnly &&
                  longEnoughToBeB64 &&
                  lengthNotMultipleOf4 &&
                  !looksNumericId &&
                  !looksUuidLike);
              if (!shouldTreatAsBase64) return s; // treat as File ID or plain string
              // Convert URL-safe base64 to standard
              s = s.replace(/-/g, "+").replace(/_/g, "/");
              // Pad to multiple of 4
              const mod = s.length % 4;
              if (mod > 0) s += "=".repeat(4 - mod);
              return s;
            };

            const sanitizedAdContents = (adContents || []).map(
              (c: SavedAdContentItem) => ({
                ...c,
                images: Array.isArray(c?.images)
                  ? c.images.map((img: MediaImage) => ({
                      ...img,
                      type:
                        typeof img?.type === "string"
                          ? img.type.toUpperCase()
                          : img?.type,
                      image: sanitizeUploadValue(img?.image),
                    }))
                  : c?.images,
                videos: Array.isArray(c?.videos)
                  ? c.videos.map((v: MediaVideo) => ({
                      ...v,
                      video: sanitizeUploadValue(v?.video),
                    }))
                  : c?.videos,
                // Remove invalid fields that might be in old localStorage data
                banner_type: undefined,
              })
            );

            console.log("Using ad contents:", adContents);
            console.log("🎯 FINAL EXTRACTED CAMPAIGN ID:", campaignId);
            console.log("🎯 Campaign ID type:", typeof campaignId);
            console.log("📍 Location data for offer:", locationData);
            console.log(
              "💻 Operating System IDs for offer:",
              Array.from(operatingSystem)
            );
            console.log(
              "💻 Operating System data for offer:",
              operatingSystemData
            );
            console.log("📱 Device IDs for offer:", Array.from(deviceIds));
            console.log("📱 Device data for offer:", deviceData);
            console.log(
              "📱 Device Brand IDs for offer:",
              Array.from(deviceBrand)
            );
            console.log("📱 Device Brand data for offer:", deviceBrandData);
            console.log("🌐 Browser IDs for offer:", Array.from(browsers));
            console.log("🌐 Browser data for offer:", browserData);
            console.log("📱 Carrier IDs for offer:", Array.from(carriers));
            console.log("📱 Carrier data for offer:", carrierData);
            console.log("🕐 Time slots for offer:", Array.from(timeSlots));
            console.log("🕐 Time data for offer:", timeData);

            // Validate campaign ID
            if (
              !campaignId ||
              campaignId === "undefined" ||
              campaignId === "null"
            ) {
              console.error("❌ INVALID CAMPAIGN ID:", campaignId);
              throw new Error(`Invalid campaign ID: ${campaignId}`);
            }

            // Create a single consolidated payload for all targeting
            let consolidatedOfferResult: unknown;

            // Log final location data before creating payload
            console.log(
              "📍 Main page: Final location data for API payload:",
              locationData
            );
            console.log("📍 Main page: Location IDs count:", locationIds.size);
            console.log(
              "📍 Main page: locationData type:",
              typeof locationData
            );
            console.log(
              "📍 Main page: locationData is array:",
              Array.isArray(locationData)
            );
            console.log(
              "📍 Main page: locationData length:",
              locationData ? locationData.length : "undefined"
            );
            if (locationData && locationData.length > 0) {
              console.log(
                "📍 Main page: First location item:",
                locationData[0]
              );
              console.log(
                "📍 Main page: First location item keys:",
                Object.keys(locationData[0])
              );
            }

            // Create consolidated payload with all targeting data
            const consolidatedPayload = {
              data: {
                token: auth.token,
                collectdata: {
                  ad_campaign_id: campaignId,
                  name: data.name,
                  bid: data.defaultCpc ? Number(data.defaultCpc) : 0.01,
                  e_cpm: data.e_cpm ? Number(data.e_cpm) : 0.01,
                  // Build Ad object per API example
                  Ad: {
                    mode: "REPLACE",
                    create: sanitizedAdContents,
                  },
                  // Include location targeting if available - send ALL locations as object with [id, TYPE] keys
                  ...(locationData &&
                    locationData.length > 0 && {
                      Location: {
                        mode: "UPDATE",
                        edit: locationData
                          .filter(
                            (location) =>
                              location.id &&
                              location.type &&
                              typeof location.bid_adjustment === "number"
                          )
                          .reduce((acc, location) => {
                            const key = `[${location.id}, ${location.type}]`;
                            const isSelected = locationIds.has(location.id);
                            acc[key] = {
                              id: location.id,
                              type: location.type,
                              parent: null,
                              name: location.name,
                              enabled: isSelected, // true if selected, false if not
                              bid_adjustment: location.bid_adjustment,
                            };
                            return acc;
                          }, {} as Record<string, any>),
                      },
                    }),
                  // Include operating system targeting if available
                  ...(operatingSystem.size > 0 &&
                    operatingSystemData &&
                    operatingSystemData.length > 0 && {
                      OpsysNew: {
                        mode: "UPDATE",
                        edit: operatingSystemData
                          .filter(
                            (os) =>
                              os.type &&
                              typeof os.enabled === "boolean" &&
                              typeof os.bid_adjustment === "number"
                          )
                          .map((os) => ({
                            os: os.type,
                            enabled: os.enabled,
                            bid_adjustment: os.bid_adjustment,
                          })),
                      },
                    }),
                  // Include device targeting if available
                  ...(deviceIds.size > 0 && {
                    device_types: Array.from(deviceIds).map((id) =>
                      id.toUpperCase()
                    ),
                  }),
                  // Include device brand targeting if available
                  ...(deviceBrand.size > 0 && {
                    device_brands: Array.from(deviceBrand).map((id) =>
                      id.toUpperCase()
                    ),
                  }),

                  // Include carrier targeting if available
                  ...(carriers.size > 0 && {
                    carriers: Array.from(carriers).map((id) => parseInt(id)),
                  }),
                  // Include browser targeting if available
                  ...(browsers.size > 0 &&
                    browserData &&
                    browserData.length > 0 && {
                      BrowserNew: {
                        mode: "UPDATE",
                        edit: browserData
                          .filter(
                            (browser) =>
                              browser.id &&
                              typeof browser.enabled === "boolean" &&
                              typeof browser.bid_adjustment === "number" &&
                              browser.bid_adjustment >= 0.1 &&
                              browser.bid_adjustment <= 10.0
                          )
                          .map((browser) => ({
                            id: parseInt(browser.id),
                            enabled: browser.enabled,
                            bid_adjustment: browser.bid_adjustment,
                          })),
                      },
                    }),
                  // Include time targeting only if at least one slot is selected
                  ...(() => {
                    const dayTimeObject: Record<string, boolean> = {};

                    if (
                      timeData &&
                      Array.isArray(timeData) &&
                      timeData.length > 0
                    ) {
                      console.log(
                        "🔄 Converting selected time targeting data to API format..."
                      );
                      console.log("📅 Input timeData:", timeData);

                      timeData.forEach((time) => {
                        if (time.day && Array.isArray(time.time_periods)) {
                          time.time_periods.forEach((period) => {
                            if (period === "ALL") {
                              for (let hour = 0; hour < 24; hour++) {
                                dayTimeObject[`${time.day}:${hour}`] = true;
                              }
                            } else if (period.includes("-")) {
                              const [start, end] = period.split("-");
                              const startHour = parseInt(start.split(":")[0]);
                              const endHour = parseInt(end.split(":")[0]);
                              for (
                                let hour = startHour;
                                hour < endHour;
                                hour++
                              ) {
                                dayTimeObject[`${time.day}:${hour}`] = true;
                              }
                            }
                          });
                        }
                      });
                    }

                    const count = Object.keys(dayTimeObject).length;
                    if (count > 0) {
                      console.log(
                        "✅ Generated compact day_time object with only selected slots",
                        count,
                        "selected entries"
                      );
                      return { day_time: dayTimeObject };
                    } else {
                      console.log(
                        "ℹ️ No time selections detected. Skipping day_time field."
                      );
                      return {};
                    }
                  })(),
                },
              },
            };

            // Debug: Log time targeting status (conditional)
            if (timeSlots.size > 0 && timeData && timeData.length > 0) {
              console.log(
                "🕐 Time targeting: INCLUDED with selected day_time entries"
              );
              console.log("   timeSlots.size:", timeSlots.size);
              console.log("   timeData.length:", timeData.length);
            } else {
              console.log("🕐 Time targeting: SKIPPED (no selections)");
            }

            // Safety: if day_time exists but is empty object, remove it (without using any)
            try {
              type DayTime = Record<string, boolean>;
              type PayloadShape = {
                data?: { collectdata?: { day_time?: DayTime } };
              };
              const cp = consolidatedPayload as unknown as PayloadShape;
              const dt = cp?.data?.collectdata?.day_time;
              if (dt && Object.keys(dt).length === 0 && cp.data?.collectdata) {
                console.warn(
                  "⚠️ day_time is empty object. Removing field before API call."
                );
                delete cp.data.collectdata.day_time;
              }
            } catch (e) {
              console.warn("⚠️ Could not inspect/cleanup day_time:", e);
            }

            console.log("📤 Sending consolidated targeting payload to API:");
            const payloadString = JSON.stringify(consolidatedPayload);
            console.log(payloadString);
            console.log(
              "📦 Consolidated payload size (bytes):",
              new Blob([payloadString]).size
            );
            console.log("🌐 API endpoint: /api/consolidated-targeting");

            // Log the final payload structure that matches the API specification
            console.log("📋 Final Consolidated API Payload Structure:");
            console.log("   Campaign ID:", campaignId);
            console.log("   Campaign Name:", data.name);
            // Location targeting is always included
            console.log("   📍 Location targeting: Always included");
            if (
              locationIds.size > 0 &&
              locationData &&
              locationData.length > 0
            ) {
              console.log(
                "   📍 Selected locations:",
                locationData.length,
                "locations"
              );

              // Validate location data structure
              const validLocationData = locationData.filter(
                (location) =>
                  location.id &&
                  typeof location.enabled === "boolean" &&
                  typeof location.bid_adjustment === "number" &&
                  location.bid_adjustment >= 0.1 &&
                  location.bid_adjustment <= 10.0
              );

              if (validLocationData.length !== locationData.length) {
                console.warn(
                  "⚠️ Some location data entries are invalid and will be skipped"
                );
                console.warn(
                  "Invalid entries:",
                  locationData.filter(
                    (location) =>
                      !location.id ||
                      typeof location.enabled !== "boolean" ||
                      typeof location.bid_adjustment !== "number" ||
                      (location.bid_adjustment !== undefined &&
                        (location.bid_adjustment < 0.1 ||
                          location.bid_adjustment > 10.0))
                  )
                );
              }

              console.log(
                "✅ Valid location entries:",
                validLocationData.length
              );

              // Log the structure being sent to match API specification
              console.log("📋 Location API Structure:");
              console.log("   - Mode: UPDATE");
              console.log(
                "   - Edit entries:",
                validLocationData.map((location) => ({
                  id: location.id,
                  type: location.type,
                  enabled: location.enabled,
                  bid_adjustment: location.bid_adjustment,
                }))
              );

              // Validate bid adjustment ranges
              const invalidBidAdjustments = validLocationData.filter(
                (location) =>
                  location.bid_adjustment !== undefined &&
                  (location.bid_adjustment < 0.1 ||
                    location.bid_adjustment > 10.0)
              );
              if (invalidBidAdjustments.length > 0) {
                console.warn(
                  "⚠️ Some location bid adjustments are outside recommended range (0.1 - 10.0):",
                  invalidBidAdjustments.map(
                    (location) => `${location.name}: ${location.bid_adjustment}`
                  )
                );
              }

              // Log the final payload structure that matches the API specification
              console.log("📋 Final Location API Payload Structure:");
              console.log("   Location:", {
                mode: "UPDATE",
                edit: validLocationData.map((location) => ({
                  id: location.id,
                  type: location.type,
                  enabled: location.enabled,
                  bid_adjustment: location.bid_adjustment,
                })),
              });
            } else {
              console.log("   📍 No locations selected - sending empty array");
              console.log("📋 Location API Structure:");
              console.log("   - Mode: UPDATE");
              console.log("   - Edit entries: []");
            }
            if (
              operatingSystem.size > 0 &&
              operatingSystemData &&
              operatingSystemData.length > 0
            ) {
              console.log(
                "   💻 Operating system targeting included:",
                operatingSystemData.length,
                "OS types"
              );
            }
            if (
              deviceIds.size > 0 ||
              deviceBrand.size > 0 ||
              carriers.size > 0
            ) {
              console.log("   📱 Device targeting included:", {
                device_types: deviceIds.size,
                device_brands: deviceBrand.size,
                carriers: carriers.size,
              });
            }

            if (browsers.size > 0 && browserData && browserData.length > 0) {
              console.log(
                "   🌐 Browser targeting included:",
                browserData.length,
                "browsers"
              );

              // Validate browser data structure
              const validBrowserData = browserData.filter(
                (browser) =>
                  browser.id &&
                  typeof browser.enabled === "boolean" &&
                  typeof browser.bid_adjustment === "number" &&
                  browser.bid_adjustment >= 0.1 &&
                  browser.bid_adjustment <= 10.0
              );

              if (validBrowserData.length !== browserData.length) {
                console.warn(
                  "⚠️ Some browser data entries are invalid and will be skipped"
                );
                console.warn(
                  "Invalid entries:",
                  browserData.filter(
                    (browser) =>
                      !browser.id ||
                      typeof browser.enabled !== "boolean" ||
                      typeof browser.bid_adjustment !== "number" ||
                      (browser.bid_adjustment !== undefined &&
                        (browser.bid_adjustment < 0.1 ||
                          browser.bid_adjustment > 10.0))
                  )
                );
              }

              console.log("✅ Valid browser entries:", validBrowserData.length);

              // Log the structure being sent to match API specification
              console.log("📋 Browser API Structure:");
              console.log("   - Mode: UPDATE");
              console.log(
                "   - Edit entries:",
                validBrowserData.map((browser) => ({
                  id: parseInt(browser.id),
                  enabled: browser.enabled,
                  bid_adjustment: browser.bid_adjustment,
                }))
              );

              // Validate bid adjustment ranges
              const invalidBidAdjustments = validBrowserData.filter(
                (browser) =>
                  browser.bid_adjustment !== undefined &&
                  (browser.bid_adjustment < 0.1 ||
                    browser.bid_adjustment > 10.0)
              );
              if (invalidBidAdjustments.length > 0) {
                console.warn(
                  "⚠️ Some browser bid adjustments are outside recommended range (0.1 - 10.0):",
                  invalidBidAdjustments.map(
                    (browser) => `${browser.name}: ${browser.bid_adjustment}`
                  )
                );
              }

              // Log the final payload structure that matches the API specification
              console.log("📋 Final Browser API Payload Structure:");
              console.log("   BrowserNew:", {
                mode: "UPDATE",
                edit: validBrowserData.map((browser) => ({
                  id: parseInt(browser.id),
                  enabled: browser.enabled,
                  bid_adjustment: browser.bid_adjustment,
                })),
              });
            }

            if (timeSlots.size > 0 && timeData && timeData.length > 0) {
              console.log(
                "   🕐 Time targeting included:",
                timeData.length,
                "days"
              );

              // Validate time data structure
              const validTimeData = timeData.filter(
                (time) =>
                  time.day &&
                  Array.isArray(time.time_periods) &&
                  time.time_periods.length > 0
              );

              if (validTimeData.length !== timeData.length) {
                console.warn(
                  "⚠️ Some time data entries are invalid and will be skipped"
                );
                console.warn(
                  "Invalid entries:",
                  timeData.filter(
                    (time) =>
                      !time.day ||
                      !Array.isArray(time.time_periods) ||
                      time.time_periods.length === 0
                  )
                );
              }

              console.log("✅ Valid time entries:", validTimeData.length);

              // Generate the day_time object to show the structure
              const dayTimeObject: Record<string, boolean> = {};
              validTimeData.forEach((time) => {
                if (time.day && Array.isArray(time.time_periods)) {
                  time.time_periods.forEach((period) => {
                    if (period === "ALL") {
                      // If "ALL" is selected, enable all 24 hours for that day
                      for (let hour = 0; hour < 24; hour++) {
                        dayTimeObject[`${time.day}:${hour}`] = true;
                      }
                    } else if (period.includes("-")) {
                      // Handle time ranges like "09:00-17:00"
                      const [start, end] = period.split("-");
                      const startHour = parseInt(start.split(":")[0]);
                      const endHour = parseInt(end.split(":")[0]);

                      for (let hour = startHour; hour < endHour; hour++) {
                        dayTimeObject[`${time.day}:${hour}`] = true;
                      }
                    }
                  });
                }
              });

              // Log the structure being sent to match API specification
              console.log("📋 Time API Structure:");
              console.log("   - Format: DAY_NAME:PERIOD = boolean");
              console.log("   - Example: SUNDAY:0 = true, MONDAY:16 = true");

              // Log the final payload structure that matches the API specification
              console.log("📋 Final Time API Payload Structure:");
              console.log("   day_time:", dayTimeObject);

              // Show some examples of the generated keys
              const exampleKeys = Object.keys(dayTimeObject).slice(0, 10);
              console.log("   📝 Example keys:", exampleKeys);
            }

            try {
              const requestId = `consolidated_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`;
              console.log(
                `🔄 Making fetch request to /api/consolidated-targeting... (Request ID: ${requestId})`
              );

              // Build absolute URL to avoid basePath or routing issues
              const apiUrl = `${window.location.origin}/api/consolidated-targeting`;
              console.log("🌐 Consolidated targeting URL:", apiUrl);
              console.log(
                "🌐 Navigator online:",
                typeof navigator !== "undefined" ? navigator.onLine : "unknown"
              );

              const consolidatedResponse = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(consolidatedPayload),
              });

              console.log("📥 Consolidated targeting API response received!");
              console.log("📥 Response status:", consolidatedResponse.status);

              // Read response text for better debugging (we'll try to parse JSON afterward)
              const responseText = await consolidatedResponse.text();
              if (!consolidatedResponse.ok) {
                console.error(
                  "❌ Consolidated targeting API response not OK:",
                  consolidatedResponse.status,
                  consolidatedResponse.statusText
                );
                console.error("❌ Response body:", responseText);
                // Try to parse JSON message if possible in a type-safe manner
                let parsedErr: unknown = null;
                try {
                  parsedErr = JSON.parse(responseText) as Record<
                    string,
                    unknown
                  >;
                } catch (e) {
                  console.log("add camp error", e);
                }

                // Safely extract message or error fields if present, otherwise fallback to raw response text
                let serverMessage = responseText;
                if (parsedErr && typeof parsedErr === "object") {
                  const obj = parsedErr as Record<string, unknown>;
                  const msg = obj["message"] ?? obj["error"];
                  if (typeof msg === "string" && msg.length > 0) {
                    serverMessage = msg;
                  }
                }
                throw new Error(`Consolidated API error: ${serverMessage}`);
              }

              console.log(
                "🔄 Parsing consolidated targeting API response JSON..."
              );
              try {
                consolidatedOfferResult = JSON.parse(responseText);
              } catch (e) {
                console.error(
                  "❌ Failed to parse consolidated API response as JSON",
                  e
                );
                console.error("Raw response:", responseText);
                throw new Error(
                  "Failed to parse consolidated API response as JSON"
                );
              }
              console.log(
                "📥 Consolidated targeting API result:",
                consolidatedOfferResult
              );

              // Log success details
              const consolidatedResult = consolidatedOfferResult as {
                status?: string;
              };
              if (consolidatedResult.status === "OK") {
                console.log("🎉 Consolidated targeting API call successful!");
                console.log("🎯 Single offer created with all targeting data!");
                console.log(
                  "📍 Location targeting: Always included (with or without selections)"
                );
                console.log(
                  "📍 Location targeting selections:",
                  locationIds.size > 0
                    ? `${locationData.length} locations`
                    : "0 locations"
                );
                console.log(
                  "💻 Operating system targeting included:",
                  operatingSystem.size > 0
                );
                console.log(
                  "📱 Device targeting included:",
                  deviceIds.size > 0 ||
                    deviceBrand.size > 0 ||
                    carriers.size > 0
                );
                console.log(
                  "🌐 Browser targeting included:",
                  browsers.size > 0
                );
                console.log("🕐 Time targeting included:", timeSlots.size > 0);

                // Summary of what was included
                const targetingSummary = [];
                // Location is always included
                if (
                  locationIds.size > 0 &&
                  locationData &&
                  locationData.length > 0
                ) {
                  targetingSummary.push(
                    `Location (${locationData.length} selected)`
                  );
                } else {
                  targetingSummary.push(`Location (0 selected)`);
                }
                if (
                  operatingSystem.size > 0 &&
                  operatingSystemData &&
                  operatingSystemData.length > 0
                ) {
                  targetingSummary.push(`OS (${operatingSystemData.length})`);
                }
                if (
                  deviceIds.size > 0 ||
                  deviceBrand.size > 0 ||
                  carriers.size > 0
                ) {
                  targetingSummary.push(
                    `Device (${
                      deviceIds.size + deviceBrand.size + carriers.size
                    })`
                  );
                }

                if (
                  browsers.size > 0 &&
                  browserData &&
                  browserData.length > 0
                ) {
                  targetingSummary.push(`Browser (${browserData.length})`);
                }
                if (timeSlots.size > 0 && timeData && timeData.length > 0) {
                  targetingSummary.push(`Time (${timeData.length})`);
                }

                console.log(
                  "📊 Targeting Summary:",
                  targetingSummary.join(", ")
                );
              }
            } catch (consolidatedFetchError: unknown) {
              console.error(
                "❌ Error during consolidated targeting fetch or JSON parsing:",
                consolidatedFetchError
              );
              const errorMessage =
                consolidatedFetchError instanceof Error
                  ? consolidatedFetchError.message
                  : String(consolidatedFetchError);
              throw new Error(
                `Consolidated targeting fetch/Parse error: ${errorMessage}`
              );
            }

            // Check consolidated targeting result
            let targetingSuccess = true;
            const errorMessages: string[] = [];

            if (consolidatedOfferResult) {
              const consolidatedResultRecord =
                consolidatedOfferResult as Record<string, unknown>;
              if (
                consolidatedResultRecord &&
                consolidatedResultRecord.status === "OK"
              ) {
                console.log("🎉 CONSOLIDATED TARGETING SUCCESSFULLY APPLIED!");
                console.log(
                  "📊 Consolidated response details:",
                  consolidatedResultRecord.response
                );

                // Log what targeting was included
                console.log(
                  "📍 Location targeting: Always included in API payload"
                );
                if (
                  locationIds.size > 0 &&
                  locationData &&
                  locationData.length > 0
                ) {
                  console.log(
                    "📍 Location targeting successfully applied with selected locations"
                  );

                  // Show location targeting details
                  const validLocationData = locationData.filter(
                    (location) =>
                      location.id &&
                      typeof location.enabled === "boolean" &&
                      typeof location.bid_adjustment === "number"
                  );

                  console.log(
                    "📍 Location targeting details:",
                    validLocationData.map((location) => ({
                      id: location.id,
                      type: location.type,
                      enabled: location.enabled,
                      bid_adjustment: location.bid_adjustment,
                    }))
                  );
                } else {
                  console.log(
                    "📍 Location targeting: No locations selected, empty array sent"
                  );
                }

                if (
                  operatingSystem.size > 0 &&
                  operatingSystemData &&
                  operatingSystemData.length > 0
                ) {
                  console.log(
                    "💻 Operating system targeting successfully applied"
                  );
                }
                if (
                  deviceIds.size > 0 ||
                  deviceBrand.size > 0 ||
                  carriers.size > 0
                ) {
                  console.log("📱 Device targeting successfully applied");
                }
                if (
                  browsers.size > 0 &&
                  browserData &&
                  browserData.length > 0
                ) {
                  console.log("🌐 Browser targeting successfully applied");
                }
                if (timeSlots.size > 0 && timeData && timeData.length > 0) {
                  console.log("🕐 Time targeting successfully applied");
                }
              } else {
                targetingSuccess = false;
                const errorMsg =
                  (consolidatedResultRecord?.message as string) ||
                  "Consolidated targeting failed";
                errorMessages.push(errorMsg);
                console.error("❌ CONSOLIDATED TARGETING FAILED!");
                console.error("Error message:", errorMsg);
                console.error("Full error response:", consolidatedResultRecord);
              }
            } else {
              targetingSuccess = false;
              errorMessages.push("No consolidated targeting result available");
              console.error("❌ NO CONSOLIDATED TARGETING RESULT AVAILABLE!");
            }

            if (targetingSuccess) {
              console.log("🎉 ALL TARGETING SUCCESSFULLY APPLIED!");
              try {
                // Show a user-friendly popup notification that campaign + targeting were applied
                toast.success(
                  "Campaign successfully created and targeting applied",
                  {
                    position: "top-right",
                    autoClose: 3000,
                  }
                );
              } catch (toastError) {
                console.warn("Could not show toast notification:", toastError);
              }
            } else {
              console.error("❌ SOME TARGETING FAILED!");
              const combinedErrorMsg = errorMessages.join("; ");
              alert(
                `Campaign created but some targeting failed: ${combinedErrorMsg}. Check console for details.`
              );
              return;
            }
          } catch (offerError: unknown) {
            console.error(
              "❌ ERROR SETTING UP CONSOLIDATED TARGETING:",
              offerError
            );
            console.error("❌ Error type:", typeof offerError);
            console.error(
              "❌ Error constructor:",
              (offerError as Error)?.constructor?.name
            );
            console.error("❌ Error stack:", (offerError as Error)?.stack);
            console.error("❌ Error message:", (offerError as Error)?.message);
            console.error(
              "❌ Full error object:",
              JSON.stringify(offerError, null, 2)
            );

            let errorMessage = "Unknown error occurred";
            if (offerError instanceof Error) {
              errorMessage = offerError.message;
            } else if (typeof offerError === "string") {
              errorMessage = offerError;
            } else if (offerError && typeof offerError === "object") {
              errorMessage = JSON.stringify(offerError);
            }

            alert(
              `Campaign created but consolidated targeting setup failed: ${errorMessage}`
            );
            return;
          }
        } else {
          console.log(
            "ℹ️ No targeting data available, skipping offer creation"
          );
        }

        console.log("🔄 Clearing campaign draft data from localStorage...");
        try {
          const keysToRemove = [
            `adContents_${selected.value}`,
            `images_${selected.value}`,
            `mainImageMeta_${selected.value}`,
            `iconImageMeta_${selected.value}`,
          ];
          keysToRemove.forEach((k) => {
            try {
              localStorage.removeItem(k);
            } catch (e) {
              console.warn("Failed to remove localStorage key:", k, e);
            }
          });
        } catch (e) {
          console.warn("Error clearing campaign localStorage:", e);
        }
        console.log("🔄 Redirecting to campaign list...");
        router.push("/advertiser/campaign");
      }

      if (result.status === "Error") {
        if (!selectedOption) {
          setError("pricing_model", {
            type: "custom",
            message: "Please Select Campaign Type",
          });
        }

        const message = result?.message;

        if (
          message ===
          "Validation error: type=Selected Campaign Type requires CPM pricing model. clicks_per_ip=Must be between 1 and 50. impressions_per_ip=Must be between 1 and 50"
        ) {
          setError("pricing_model", {
            type: "custom",
            message: "Selected Campaign Type requires CPM pricing model",
          });
          setError("clicks_per_ip", {
            type: "custom",
            message: "Clicks per IP must be between 1 and 50",
          });
          setError("impressions_per_ip", {
            type: "custom",
            message: "Impressions per IP must be between 1 and 50",
          });
        } else if (
          message ===
          "Validation error: type=Selected Campaign Type requires CPM pricing model. impressions_per_ip=Must be between 1 and 50"
        ) {
          setError("pricing_model", {
            type: "custom",
            message: "Selected Campaign Type requires CPM pricing model",
          });
          setError("impressions_per_ip", {
            type: "custom",
            message: "Impressions per IP must be between 1 and 50",
          });
        } else if (
          message ===
          "Validation error: type=Selected Campaign Type requires CPM pricing model. clicks_per_ip=Must be between 1 and 50"
        ) {
          setError("pricing_model", {
            type: "custom",
            message: "Selected Campaign Type requires CPM pricing model",
          });
          setError("clicks_per_ip", {
            type: "custom",
            message: "Clicks per IP must be between 1 and 50",
          });
        } else if (
          message ===
          "Validation error: clicks_per_ip=Must be between 1 and 50. impressions_per_ip=Must be between 1 and 50"
        ) {
          setError("clicks_per_ip", {
            type: "custom",
            message: "Clicks per IP must be between 1 and 50",
          });
          setError("impressions_per_ip", {
            type: "custom",
            message: "Impressions per IP must be between 1 and 50",
          });
        } else if (
          message ===
          "Validation error: type=Selected Campaign Type requires CPM pricing model"
        ) {
          setError("pricing_model", {
            type: "custom",
            message: "Selected Campaign Type requires CPM pricing model",
          });
        } else if (
          message ===
          "Validation error: type=Selected Campaign Type requires CPC or CPA pricing model"
        ) {
          setError("pricing_model", {
            type: "custom",
            message: "Selected Campaign Type requires CPC or CPA pricing model",
          });
        } else if (
          message ===
          "Validation error: impressions_per_ip=Must be between 1 and 50"
        ) {
          setError("impressions_per_ip", {
            type: "custom",
            message: "Impressions per IP must be between 1 and 50",
          });
        } else if (
          message === "Validation error: clicks_per_ip=Must be between 1 and 50"
        ) {
          setError("clicks_per_ip", {
            type: "custom",
            message: "Clicks per IP must be between 1 and 50",
          });
        }
      } else if (result.status !== "OK") {
        // Unknown error status from API
        const serverMsg =
          (result && result.message) || "Failed to create campaign";
        toast.error(serverMsg);
      }
    } catch (err) {
      console.error("Error submitting banner zone:", err);
      const e = err as { message?: string };
      toast.error(e?.message || "Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <AdvertiserSidebar variant="inset" />
      <SidebarInset>
        <SiteAdvertiserHeader />
        <div className="min-h-screen bg-gray-50">
          <div className=" py-8 px-4">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      onClick={() => goToStep(step)}
                      className={`w-10 cursor-pointer h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= step
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200                                text-gray-600"
                      }`}
                    >
                      {step}
                    </div>
                    {step < 3 && (
                      <div
                        className={`w-16  h-1 mx-2 ${
                          currentStep > step ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-4 space-x-12">
                <span
                  // onClick={() => goToStep(1)}
                  className={`text-sm cursor-pointer font-medium ${
                    currentStep >= 1 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  Campaign Setup
                </span>
                <span
                  // onClick={() => goToStep(2)}
                  className={`text-sm cursor-pointer font-medium ${
                    currentStep >= 2 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  Ad Group Targeting
                </span>
                {/* <span
                  
                  className={`text-sm cursor-pointer font-medium ${
                    currentStep >= 3 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  TQ & Analytics
                </span> */}
                <span
                  // onClick={() => goToStep(4)}
                  className={`text-sm cursor-pointer font-medium ${
                    currentStep >= 3 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  Ad Content
                </span>
              </div>
            </div>

          

            <form onSubmit={handleSubmit(onSubmit)} className="">
              {/* Step 1: Campaign Setup */}
              {currentStep === 1 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        1
                      </span>
                      Campaign Setup
                    </CardTitle>
                    <CardDescription>
                      Configure your campaign basics including ad format,
                      budget, and scheduling
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {/* Ad Format Selection */}
                    <div>
                      <Label className="text-lg font-semibold  block">
                        Select Ad Format
                      </Label>
                      <div className="grid grid-cols-1 items-center md:grid-cols-2 gap-2">
                        <div className=" items-center grid grid-cols-1 md:grid-cols-2 gap-4">
                          {adFormats.map((format) => (
                            <div
                              key={format.name}
                              className={`p-4 w-full border-2 grid grid-cols-2 rounded-lg cursor-pointer transition-all ${
                                selected.value === format.value
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => setSelected(format)}
                            >
                              <div className=" w-48">
                                <h3 className="font-medium w-full text-sm">
                                  {format.name}
                                </h3>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-center">
                          <div className="w-full  border rounded-lg bg-gray-50 p-1">
                            <Image
                              width={300}
                              height={200}
                              src={selected.image}
                              alt={selected.name}
                              className="w-full h-48 object-contain rounded"
                            />
                            <div className="mt-3 text-center">
                              <h3 className="font-medium">{selected.name}</h3>
                              <p className="text-sm text-gray-600">
                                {selected.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Campaign Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                      <div>
                        <Label htmlFor="name">Campaign Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter campaign name"
                          {...register("name", {
                            required: "Campaign name is required",
                          })}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="ad_vertical_id">Ad Vertical</Label>
                        <select
                          id="ad_vertical_id"
                          disabled={adVerticalLoading}
                          className="w-full p-2 border rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          {...register("ad_vertical_id")}
                        >
                          <option value="">
                            {adVerticalLoading
                              ? "Loading Ad Verticals..."
                              : "-- Select Ad Vertical --"}
                          </option>
                          {adVerticals.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.vertical}
                            </option>
                          ))}
                        </select>
                        {adVerticalError && (
                          <p className="text-sm text-red-500 mt-1">
                            {adVerticalError}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="pricing_model">Pricing Model</Label>
                        <select
                          id="pricing_model"
                          value={selectedOption}
                          onChange={(e) => {
                            setSelectedOption(e.target.value);
                            clearErrors([
                              "pricing_model",
                              "clicks_per_ip",
                              "impressions_per_ip",
                            ]);
                          }}
                          className="w-full p-2 border rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="" disabled>
                            -- Please choose a pricing model --
                          </option>
                          <option value="CPC">CPC (Cost Per Click)</option>
                          <option value="CPM">CPM (Cost Per Mille)</option>
                        </select>
                        {errors.pricing_model && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.pricing_model.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="budget_total">Total Budget (Rs.)</Label>
                        <Input
                          id="budget_total"
                          type="number"
                          placeholder="e.g. 1000"
                          {...register("budget_total", {
                            required: "Total budget is required",
                          })}
                        />
                        {errors.budget_total && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.budget_total.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="budget_daily">Daily Budget (Rs.)</Label>
                        <Input
                          id="budget_daily"
                          type="number"
                          placeholder="e.g. 100"
                          {...register("budget_daily", {
                            required: "Daily budget is required",
                          })}
                        />
                        {errors.budget_daily && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.budget_daily.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="clicks_daily">Daily Clicks</Label>
                        <Input
                          id="clicks_daily"
                          type="number"
                          placeholder="e.g. 100"
                          {...register("clicks_daily", {
                            required: "Clicks Daily is required",
                          })}
                        />
                        {errors.clicks_daily && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.clicks_daily.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="clicks_per_ip">Clicks per IP</Label>
                        <Input
                          id="clicks_per_ip"
                          type="number"
                          placeholder="e.g. 3"
                          {...register("clicks_per_ip", {
                            required: "Clicks Per IP is required",
                          })}
                        />
                        {errors.clicks_per_ip && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.clicks_per_ip.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="e_cpm">Default e_cpm</Label>
                        <Input
                          id="e_cpm"
                          type="number"
                          defaultValue={0.01}
                          placeholder="e.g. 0.01"
                          {...register("e_cpm", {
                            required: "e_cpm is required",
                          })}
                        />
                        {errors.e_cpm && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.e_cpm.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="impressions_per_ip">
                          Impressions per IP
                        </Label>
                        <Input
                          id="impressions_per_ip"
                          type="number"
                          placeholder="e.g. 10"
                          {...register("impressions_per_ip", {
                            required: "Impressions per IP is required",
                          })}
                        />
                        {errors.impressions_per_ip && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.impressions_per_ip.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <Label className="text-lg font-semibold mb-4 block">
                          Campaign Schedule
                        </Label>
                        <RadioGroup
                          defaultValue="immediate"
                          onValueChange={(value) => setOption(value)}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value="immediate" id="immediate" />
                            <Label htmlFor="immediate" className="flex-1">
                              <div className="font-medium">
                                Start immediately, run continuously
                              </div>
                              <div className="text-sm text-gray-600">
                                Your campaign will start as soon as it&apos;s
                                approved
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value="setup" id="setup" />
                            <Label htmlFor="setup" className="flex-1">
                              <div className="font-medium">
                                Setup start and end date
                              </div>
                              <div className="text-sm text-gray-600">
                                Schedule your campaign for specific dates
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>

                        {option === "setup" && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <Label className="block mb-2 font-medium">
                              Date Range
                            </Label>
                            <div className="flex space-x-4">
                              <div className="flex-1">
                                <Label
                                  htmlFor="start_date"
                                  className="text-sm text-gray-600"
                                >
                                  Start Date
                                </Label>
                                <Input
                                  type="date"
                                  {...register("start_date")}
                                />
                              </div>
                              <div className="flex-1">
                                <Label
                                  htmlFor="end_date"
                                  className="text-sm text-gray-600"
                                >
                                  End Date
                                </Label>
                                <Input type="date" {...register("end_date")} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Targeting */}
              {currentStep === 2 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        2
                      </span>
                      Targeting Options
                    </CardTitle>
                    <CardDescription>
                      Configure targeting settings to reach your desired
                      audience (all targeting options are optional)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {/* {(() => {
                        console.log(
                          "📍 Main page: Rendering LocationTargeting component"
                        );
                        console.log(
                          "📍 Main page: handleLocationSelection exists:",
                          !!handleLocationSelection
                        );
                        console.log(
                          "📍 Main page: handleLocationDataChange exists:",
                          !!handleLocationDataChange
                        );
                        return (
                          <LocationTargeting
                            onSelectionChange={handleLocationSelection}
                            onDataChange={handleLocationDataChange}
                          />
                        );
                      })()} */}
                      <OperatingSystem
                        onSelectionChange={handleOperatingSystemSelection}
                        onDataChange={handleOperatingSystemDataChange}
                      />
                      <DeviceTargeting
                        onSelectionChange={handleDeviceSelection}
                        onDeviceDataChange={handleDeviceDataChange}
                      />
                      <DeviceBrand
                        onSelectionChange={handleDeviceBrandSelection}
                        onDeviceBrandDataChange={handleDeviceBrandDataChange}
                      />
                      <BrowserTargeting
                        onSelectionChange={handleBrowserSelection}
                        onDataChange={handleBrowserDataChange}
                      />
                      <Carriers
                        onSelectionChange={handleCarrierSelection}
                        onCarrierDataChange={handleCarrierDataChange}
                      />

                      <TimeTargeting
                        onSelectionChange={handleTimeSelection}
                        onTimeDataChange={handleTimeDataChange}
                      />
                    </div>

                    {/* Targeting Summary */}
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-800 mb-3">
                        Targeting Summary
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {/* <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              locationIds.size > 0 ? "default" : "secondary"
                            }
                          >
                            {locationIds.size}
                          </Badge>
                          <span>Locations</span>
                        </div> */}
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              operatingSystem.size > 0 ? "default" : "secondary"
                            }
                          >
                            {operatingSystem.size}
                          </Badge>
                          <span>OS Types</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              deviceIds.size > 0 ? "default" : "secondary"
                            }
                          >
                            {deviceIds.size}
                          </Badge>
                          <span>Device Types</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              browsers.size > 0 ? "default" : "secondary"
                            }
                          >
                            {browsers.size}
                          </Badge>
                          <span>Browsers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              carriers.size > 0 ? "default" : "secondary"
                            }
                          >
                            {carriers.size}
                          </Badge>
                          <span>Carriers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              timeSlots.size > 0 ? "default" : "secondary"
                            }
                          >
                            {timeSlots.size}
                          </Badge>
                          <span>Time Slots</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Ad Content */}
              {/* {currentStep === 3 && (
                <Card className="mb-6">
                  <AppLists
                    onSelectionChange={handleAppListSelection}
                    onAppListDataChange={handleAppListDataChange}
                  />
                  <IpLists
                    onSelectionChange={handleIpListSelection}
                    onIpListDataChange={handleIpListDataChange}
                  />
                  <IfaLists
                    onSelectionChange={handleIfaListSelection}
                    onIfaListDataChange={handleIfaListDataChange}
                  />
                  <DomainLists
                    onSelectionChange={handleDomainListSelection}
                    onDomainListDataChange={handleDomainListDataChange}
                  />

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={appListIds.size > 0 ? "default" : "secondary"}
                    >
                      {appListIds.size}
                    </Badge>
                    <span>App Lists</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={domainListIds.size > 0 ? "default" : "secondary"}
                    >
                      {domainListIds.size}
                    </Badge>
                    <span>Domain Lists</span>
                  </div>
                </Card>
              )} */}

              {/* Step 4: Ad Content */}
              {currentStep === 3 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        4
                      </span>
                      {selected.name} Content
                    </CardTitle>
                    <CardDescription>
                      Configure your {selected.name.toLowerCase()} ad content
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <AdContentForm
                      campaignType={selected.value}
                      autoOpen={true}
                      onSave={handleAdContentSave}
                    />
                    {/* Inline ad content fields removed in favor of popup-only flow */}
                  </CardContent>
                </Card>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    prevStep();
                  }}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>

                {/* <div className="flex space-x-2">
                  {[1, 2, 3, 4].map((step) => (
                    <Button
                      key={step}
                      type="button"
                      variant={currentStep === step ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToStep(step)}
                    >
                      {step}
                    </Button>
                  ))}
                </div> */}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      nextStep();
                    }}
                    disabled={!validateStep(currentStep)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Campaign"}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
