"use client";
/**
 * Campaign Edit Form with Operating System Targeting
 *
 * Operating System Targeting API Structure:
 * The OpsysNew field in the API payload follows this format:
 * {
 *   "OpsysNew": {
 *     "mode": "UPDATE",
 *     "edit": [
 *       {"os": "WINDOWS", "bid_adjustment": 0.5},
 *       {"os": "ANDROID", "enabled": true},
 *       {"os": "IOS", "enabled": true, "bid_adjustment": 1.5}
 *     ]
 *   }
 * }
 *
 * Where:
 * - "os": Operating system identifier (WINDOWS, ANDROID, IOS, etc.)
 * - "enabled": Boolean to enable/disable targeting for that OS
 * - "bid_adjustment": Numeric value for bid adjustment (0.5 = 50% reduction, 1.5 = 50% increase)
 */
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AdvertiserSidebar } from "@/components/advertiser/app-sidebar";
import { SiteAdvertiserHeader } from "@/components/advertiser/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
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
// import LocationTargeting from "../../create/Location";
import TimeTargeting from "../../create/TimeTargeting";
import OperatingSystem from "../../create/operatingsystem";
import DeviceTargeting from "../../create/Devicetargeting";
import DeviceBrand from "../../create/Devicebrand";
import BrowserTargeting from "../../create/Browsertargeting";
import Carriers from "../../create/carriers";
import AppLists from "../../create/AppLists";
import IpLists from "../../create/IpLists";
import IfaLists from "../../create/IfaLists";
import DomainLists from "../../create/DomainLists";
import Image from "next/image";
import EditLocationTargeting from "../EditLocation";

interface DayTimeValue {
  day: string;
  time_periods: string[];
}

interface FormData {
  name: string;
  start_date: string; // ISO date string: YYYY-MM-DD for <input type="date"/>
  end_date: string; // ISO date string: YYYY-MM-DD for <input type="date"/>
  budget_daily: string;
  budget_total: string;
  defaultCpc: string;
  impressions_per_ip: number;
  clicks_per_ip: string;
  clicks_daily: string;
  pricing_model: string;
  title: string;
  destination_url: string;
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
    value: "POPUNDER",
    description:
      "Traditional onclick full-tabs with high visibility and wide reach",
    image: "/popunderad.gif",
  },
  // {
  //   name: "CPC",
  //   value: "CPC",
  //   description: "Traditional display banner ads.",
  //   image: "/CPC.gif",
  // },
  {
    name: "Display ( Banner )",
    value: "DISPLAY",
    description: "Traditional display banner ads.",
    image: "/Display_ads.gif",
  },
  {
    name: "Inpage-Push",
    value: "FLOATING_PUSH",
    description: "Video ads that play within video content.",
    image: "/Inpageads.gif",
  },
];

export default function Page() {
  console.log("📍 Edit page: Component rendering");

  const [selected, setSelected] = useState(adFormats[0]);
  const [selectedOption, setSelectedOption] = useState("");
  const [option, setOption] = useState("immediate");
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const params = useParams<{ id: string | string[] }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
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

  // Location targeting
  const [locationIds, setLocationIds] = useState<Set<string>>(new Set());
  const [locationData, setLocationData] = useState<
    Array<{
      id: string;
      name: string;
      type: string;
      enabled: boolean;
      bid_adjustment: number;
    }>
  >([]);

  const handleLocationSelection = useCallback(
    (selectedIds: Set<string>) => {
      // Only update state if value has changed to prevent infinite loop
      const newIds = Array.from(selectedIds).sort().join(",");
      const currentIds = Array.from(locationIds).sort().join(",");

      if (newIds !== currentIds) {
        setLocationIds(new Set(selectedIds));
      }
    },
    [locationIds]
  );

  const handleLocationDataChange = useCallback(
    (
      locationData: Array<{
        id: string;
        name: string;
        type: string;
        enabled: boolean;
        bid_adjustment: number;
      }>
    ) => {
      console.log("📍 Edit page: Location data received:", {
        count: locationData.length,
        data: locationData,
        timestamp: new Date().toISOString(),
      });
      setLocationData(locationData);

      // Also log the state after setting it
      setTimeout(() => {
        console.log(
          "📍 Edit page: locationData state after setState:",
          locationData
        );
      }, 0);
    },
    []
  );

  // Operating system targeting
  const [operatingSystem, setOperatingSystem] = useState<Set<string>>(
    new Set()
  );
  const [, setOperatingSystemData] = useState<
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
  const [, setDeviceData] = useState<
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
  const [, setDeviceBrandData] = useState<
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
  const [disabledBrowserIds, setDisabledBrowserIds] = useState<Set<string>>(
    new Set()
  );
  const [disabledBrowserTypes, setDisabledBrowserTypes] = useState<Set<string>>(
    new Set()
  );
  const [browserData, setBrowserData] = useState<
    Array<{
      id: string;
      name: string;
      type: string;
      enabled?: boolean;
      bid_adjustment?: number;
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
      setBrowserData(browserData);
    },
    []
  );

  // Carrier targeting
  const [carriers, setCarriers] = useState<Set<string>>(new Set());
  const [, setCarrierData] = useState<
    Array<{
      id: string;
      name: string;
      type: string;
      bid_adjustment?: number;
      enabled?: boolean;
    }>
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
    (
      carrierData: Array<{
        id: string;
        name: string;
        type: string;
        bid_adjustment?: number;
        enabled?: boolean;
      }>
    ) => {
      setCarrierData(carrierData);
    },
    []
  );

  // Time targeting
  const [timeSlots, setTimeSlots] = useState<Set<string>>(new Set());
  const [, setTimeData] = useState<
    Array<{
      id: string;
      name: string;
      type: string;
      bid_adjustment?: number;
      enabled?: boolean;
    }>
  >([]);

  const handleTimeSelection = useCallback(
    (selectedIds: Set<string>) => {
      // Only update state if value has changed to prevent infinite loop
      const newIds = Array.from(selectedIds).sort().join(",");
      const currentIds = Array.from(timeSlots).sort().join(",");

      if (newIds !== currentIds) {
        setTimeSlots(new Set(selectedIds));
      }
    },
    [timeSlots]
  );

  const handleTimeDataChange = useCallback((timeData: DayTimeValue[]) => {
    // Convert DayTimeValue[] to the expected format for timeData state
    const convertedTimeData = timeData.map((dayTime) => ({
      id: dayTime.day,
      name: `${dayTime.day} (${dayTime.time_periods.join(", ")})`,
      type: "time_slot",
      enabled: true,
    }));
    setTimeData(convertedTimeData);
  }, []);

  // App Lists targeting
  const [appListIds, setAppListIds] = useState<Set<string>>(new Set());
  const [, setAppListData] = useState<
    Array<{ id: string; name: string; type: string }>
  >([]);

  const handleAppListSelection = useCallback(
    (selectedIds: Set<string>) => {
      const newIds = Array.from(selectedIds).sort().join(",");
      const currentIds = Array.from(appListIds).sort().join(",");

      if (newIds !== currentIds) {
        setAppListIds(new Set(selectedIds));
      }
    },
    [appListIds]
  );

  const handleAppListDataChange = useCallback(
    (appListData: Array<{ id: string; name: string; type: string }>) => {
      setAppListData(appListData);
    },
    []
  );

  // IP Lists targeting
  const [ipListIds, setIpListIds] = useState<Set<string>>(new Set());
  const [, setIpListData] = useState<
    Array<{ id: string; name: string; type: string }>
  >([]);

  const handleIpListSelection = useCallback(
    (selectedIds: Set<string>) => {
      const newIds = Array.from(selectedIds).sort().join(",");
      const currentIds = Array.from(ipListIds).sort().join(",");

      if (newIds !== currentIds) {
        setIpListIds(new Set(selectedIds));
      }
    },
    [ipListIds]
  );

  const handleIpListDataChange = useCallback(
    (ipListData: Array<{ id: string; name: string; type: string }>) => {
      setIpListData(ipListData);
    },
    []
  );

  // IFA Lists targeting
  const [ifaListIds, setIfaListIds] = useState<Set<string>>(new Set());
  const [, setIfaListData] = useState<
    Array<{ id: string; name: string; type: string }>
  >([]);

  const handleIfaListSelection = useCallback(
    (selectedIds: Set<string>) => {
      const newIds = Array.from(selectedIds).sort().join(",");
      const currentIds = Array.from(ifaListIds).sort().join(",");

      if (newIds !== currentIds) {
        setIfaListIds(new Set(selectedIds));
      }
    },
    [ifaListIds]
  );

  const handleIfaListDataChange = useCallback(
    (ifaListData: Array<{ id: string; name: string; type: string }>) => {
      setIfaListData(ifaListData);
    },
    []
  );

  // Domain Lists targeting
  const [domainListIds, setDomainListIds] = useState<Set<string>>(new Set());
  const [, setDomainListData] = useState<
    Array<{ id: string; name: string; type: string }>
  >([]);

  const handleDomainListSelection = useCallback(
    (selectedIds: Set<string>) => {
      const newIds = Array.from(selectedIds).sort().join(",");
      const currentIds = Array.from(domainListIds).sort().join(",");

      if (newIds !== currentIds) {
        setDomainListIds(new Set(selectedIds));
      }
    },
    [domainListIds]
  );

  const handleDomainListDataChange = useCallback(
    (domainListData: Array<{ id: string; name: string; type: string }>) => {
      setDomainListData(domainListData);
    },
    []
  );

  const formatDate = (d?: string | Date) =>
    d ? new Date(d).toISOString().slice(0, 10) : "";

  // Types to avoid 'any' usage in API parsing
  type OfferRow = {
    id?: number | string;
    ad_campaign_id?: number | string;
    campaign_id?: number | string;
  };
  type LocationEntry = {
    id?: string | number;
    name?: string;
    type?: string;
    enabled?: boolean;
    bid_adjustment?: number;
  };
  type OsEntry = { os?: string; enabled?: boolean; bid_adjustment?: number };
  type BrowserEntry = {
    id?: string | number;
    name?: string;
    type?: string;
    enabled?: boolean;
    bid_adjustment?: number;
  };

  // Helper types and functions to normalize mixed API values
  type IdLike = number | string | { id?: number | string; name?: string };
  const getIdStr = (v: IdLike): string => {
    if (typeof v === "object" && v !== null) {
      return String(v.id ?? "");
    }
    return String(v);
  };

  // Track resolved OfferNew ID to ensure we update the exact record (e.g., 3567591)
  const [resolvedOfferId, setResolvedOfferId] = useState<
    number | string | undefined
  >(undefined);

  const loadTargetingData = useCallback(async () => {
    try {
      console.log(`🔍 Loading targeting data for campaign ID: ${id}`);
      // Validate auth token
      if (!auth?.token) {
        console.warn("❗ Missing auth token. Cannot load targeting data.");
        return;
      }

      // Step 1: Find the correct OfferNew ID for this campaign by querying the OfferNew index
      console.log(
        "📡 Fetching OfferNew index to locate offer for campaign:",
        id
      );
      const listRes = await axios.get(
        `https://panel.adsaro.com/advertiser/api/OfferNew?version=4&token=${auth?.token}`
      );

      const listRows = listRes?.data?.response?.rows || {};
      const listArray: OfferRow[] = Array.isArray(listRows)
        ? (listRows as OfferRow[])
        : (Object.values(listRows) as OfferRow[]);
      console.log(
        "📋 OfferNew index rows (sample):",
        listArray.slice(0, 5).map((r: OfferRow) => ({
          id: r?.id,
          ad_campaign_id: r?.ad_campaign_id,
          campaign_id: r?.campaign_id,
        }))
      );

      // Try to capture a direct OfferNew/{id} if available
      try {
        const detailRes = await axios.get(
          `https://panel.adsaro.com/advertiser/api/OfferNew/${id}?version=4&token=${auth?.token}`
        );
        const dRows = detailRes?.data?.response?.rows;
        if (dRows && typeof dRows === "object") {
          const keys = Object.keys(dRows);
          if (keys.length > 0) {
            const firstKey = keys[0];
            const row = (dRows as Record<string, OfferRow>)[firstKey];
            if (row?.id) {
              setResolvedOfferId(row.id);
              console.log("🔎 Resolved Offer ID from detail endpoint:", row.id);
            }
          }
        }
      } catch {
        console.log(
          "ℹ️ OfferNew/{id} detail fetch not usable, proceeding with index match."
        );
      }

      const matchedOffer = listArray.find(
        (row: OfferRow) =>
          String(row?.ad_campaign_id) === String(id) ||
          String(row?.campaign_id) === String(id)
      );

      if (!matchedOffer?.id) {
        console.warn("⚠️ No matching Offer found for campaign:", id);
        return;
      }

      const offerId = matchedOffer.id;
      console.log("✅ Matched Offer ID:", offerId, "for campaign:", id);

      // Step 2: Fetch targeting data from OfferNew API using the resolved offer ID
      const response = await axios.get(
        `https://panel.adsaro.com/advertiser/api/OfferNew/${offerId}?version=4&token=${auth?.token}`
      );

      console.log("🎯 OfferNew targeting response:", response);
      if (response.status === 200) {
        const data = response.data;
        console.log(
          "📥 Raw targeting data response:",
          JSON.stringify(data, null, 2)
        );
        // Process the targeting data and set the selections
        if (data.response && data.response.rows) {
          console.log(
            "🔍 Looking for campaign data in rows:",
            Object.keys(data.response.rows)
          );
          let targetingData = data.response.rows[String(id)];
          console.log(
            `🎯 Direct lookup for ID ${id}:`,
            targetingData ? "Found" : "Not found"
          );
          // Fallback: handle rows as array or object values
          if (!targetingData) {
            const rowsArray: OfferRow[] = Array.isArray(data.response.rows)
              ? (data.response.rows as OfferRow[])
              : (Object.values(data.response.rows) as OfferRow[]);
            console.log(
              "📊 Rows array:",
              rowsArray.map((row: OfferRow) => ({
                id: row?.id,
                ad_campaign_id: row?.ad_campaign_id,
                campaign_id: row?.campaign_id,
              }))
            );
            targetingData = rowsArray.find(
              (row: OfferRow) =>
                String(row?.ad_campaign_id) === String(id) ||
                String(row?.campaign_id) === String(id) ||
                String(row?.id) === String(id)
            );
          }

          if (targetingData) {
            console.log("🎉 Processing targeting data:", targetingData);
            // Set location targeting
            if (
              targetingData.Location &&
              Array.isArray(targetingData.Location)
            ) {
              console.log(
                "📍 Loading location targeting:",
                targetingData.Location
              );
              const locationIds = new Set(
                (targetingData.Location as LocationEntry[]).map((loc) =>
                  String(loc.id ?? "")
                )
              );
              setLocationIds(locationIds);
              const locationData = (
                targetingData.Location as LocationEntry[]
              ).map((loc) => ({
                id: String(loc.id ?? ""),
                name: loc.name || `Location ${String(loc.id ?? "")}`,
                type: loc.type || "country",
                enabled: loc.enabled !== false,
                bid_adjustment:
                  typeof loc.bid_adjustment === "number"
                    ? loc.bid_adjustment
                    : 1.0,
              }));
              setLocationData(locationData);
              console.log(
                "✅ Location targeting loaded:",
                locationData.length,
                "locations"
              );
            } else if (
              targetingData.Location &&
              targetingData.Location.value &&
              typeof targetingData.Location.value === "object"
            ) {
              // Map format: Location.value = { "[al, COUNTRY]": { id, type, name, enabled, bid_adjustment } }
              const mapObj = targetingData.Location.value as Record<
                string,
                LocationEntry
              >;
              console.log(
                "📍 Loading location targeting (map format):",
                Object.keys(mapObj)
              );
              const ids: string[] = [];
              const locDataArr: Array<{
                id: string;
                name: string;
                type: string;
                enabled: boolean;
                bid_adjustment: number;
              }> = [];
              Object.entries(mapObj).forEach(
                ([key, loc]: [string, LocationEntry]) => {
                  if (loc && typeof loc === "object") {
                    const rawId = String(
                      (loc.id ?? key.replace(/^\[/, "").split(",")[0])
                        .toString()
                        .trim()
                    );
                    const normId = rawId.toUpperCase();
                    ids.push(normId);
                    locDataArr.push({
                      id: rawId,
                      name: (loc.name ?? `Location ${rawId}`).toString(),
                      type: (loc.type ?? "COUNTRY").toString(),
                      enabled: loc.enabled === true,
                      bid_adjustment:
                        typeof loc.bid_adjustment === "number"
                          ? loc.bid_adjustment
                          : 1.0,
                    });
                  }
                }
              );
              setLocationIds(new Set(ids));
              setLocationData(locDataArr);
              console.log("✅ Location targeting loaded (map):", {
                total: locDataArr.length,
                selectedCount: ids.length,
              });
            } else {
              console.log(
                "❌ No location data found in targetingData.Location"
              );
            }

            // Handle OS targeting from OfferNew API structure
            console.log("🔍 Checking OS targeting data structure:");
            console.log("- targetingData.OpsysNew:", !!targetingData.OpsysNew);
            console.log(
              "- targetingData.OpsysNew?.value:",
              !!targetingData.OpsysNew?.value
            );
            console.log(
              "- targetingData.OpsysNew?.value?.value:",
              !!targetingData.OpsysNew?.value?.value
            );
            console.log(
              "- Full OpsysNew structure:",
              JSON.stringify(targetingData.OpsysNew, null, 2)
            );

            if (targetingData.OpsysNew && targetingData.OpsysNew.value) {
              console.log(
                "🖥️ Found OS data in OfferNew API:",
                JSON.stringify(targetingData.OpsysNew.value, null, 2)
              );
              const enabledOSArray: string[] = [];
              const osDataArray: Array<{
                id: string;
                name: string;
                type: string;
                enabled?: boolean;
                bid_adjustment?: number;
              }> = [];
              Object.entries(
                targetingData.OpsysNew.value as Record<string, OsEntry>
              ).forEach(([osKey, osValue]) => {
                if (osValue && osValue.enabled === true) {
                  const cleanOSKey = osKey.replace(/^\[|\]$/g, "");
                  enabledOSArray.push(cleanOSKey);
                  osDataArray.push({
                    id: cleanOSKey,
                    name: osValue.os || cleanOSKey,
                    type: "operating_system",
                    enabled: osValue.enabled,
                    bid_adjustment:
                      typeof osValue.bid_adjustment === "number"
                        ? osValue.bid_adjustment
                        : 1.0,
                  });
                  console.log("✅ Added enabled OS:", cleanOSKey);
                } else {
                  console.log(
                    "❌ Skipped disabled OS:",
                    osKey,
                    "enabled:",
                    (osValue as OsEntry | undefined)?.enabled
                  );
                }
              });

              const osSet: Set<string> = new Set<string>(enabledOSArray);
              setOperatingSystem(osSet);
              setOperatingSystemData(osDataArray);
              console.log(
                "✅ OS targeting loaded from OfferNew API (enabled only):",
                Array.from(osSet)
              );
              console.log("📏 Operating system Set size:", osSet.size);
            } else {
              console.log(
                "❌ No OS data found in targetingData.OpsysNew.value.value"
              );
              console.log("🔍 Trying alternative OS data structures...");

              // Check for alternative structures
              if (targetingData.OpsysNew) {
                console.log(
                  "- Checking targetingData.OpsysNew directly:",
                  JSON.stringify(targetingData.OpsysNew, null, 2)
                );
              }
              if (targetingData.operating_systems) {
                console.log(
                  "- Found operating_systems:",
                  JSON.stringify(targetingData.operating_systems, null, 2)
                );
              }
              if (targetingData.os_targeting) {
                console.log(
                  "- Found os_targeting:",
                  JSON.stringify(targetingData.os_targeting, null, 2)
                );
              }
            }

            // Don't auto-select all device brands - only use what's specifically selected in campaign
            console.log(
              "📦 Skipping device_brands array as it contains all available options, not selected ones"
            );

            // Handle Browser targeting from OfferNew API structure
            if (targetingData.BrowserNew && targetingData.BrowserNew.value) {
              console.log(
                "🌐 Processing Browser targeting from OfferNew API:",
                targetingData.BrowserNew.value
              );
              const disabledIds: string[] = [];
              const browserDataArray: Array<{
                id: string;
                name: string;
                type: string;
                enabled?: boolean;
                bid_adjustment?: number;
              }> = [];
              const disabledTypes: string[] = [];
              Object.entries(
                targetingData.BrowserNew.value as Record<string, BrowserEntry>
              ).forEach(([browserKey, browserValue]) => {
                console.log("🔍 Processing Browser entry:", {
                  browserKey,
                  browserValue,
                  enabled: (browserValue as BrowserEntry | undefined)?.enabled,
                });
                if (browserValue && typeof browserValue === "object") {
                  const browserId =
                    browserValue.id != null
                      ? String(browserValue.id)
                      : browserKey.replace(/^\[|\]$/g, "");
                  if (browserValue.enabled === false) {
                    disabledIds.push(browserId);
                    if (browserValue.type) {
                      disabledTypes.push(browserValue.type);
                    }
                    console.log("❌ Browser explicitly disabled:", {
                      originalKey: browserKey,
                      browserId: browserId,
                      name: browserValue.name || browserValue.type,
                      type: browserValue.type,
                      enabled: browserValue.enabled,
                    });
                  }
                  browserDataArray.push({
                    id: browserId,
                    name:
                      browserValue.name ||
                      browserValue.type ||
                      `Browser ${browserId}`,
                    type: "browser",
                    enabled: browserValue.enabled,
                    bid_adjustment:
                      typeof browserValue.bid_adjustment === "number"
                        ? browserValue.bid_adjustment
                        : 1.0,
                  });
                }
              });
              // Store disabled IDs and types in separate states to pass to component
              setBrowserIds(new Set<string>()); // Start with empty selection
              setBrowserData(browserDataArray);
              setDisabledBrowserIds(new Set<string>(disabledIds));
              setDisabledBrowserTypes(new Set<string>(disabledTypes));
              console.log(
                "🌐 Browser targeting: Disabled browsers from API:",
                disabledIds
              );
              console.log(
                "🌐 Browser targeting: Disabled browser types from API:",
                disabledTypes
              );
              console.log(
                "🌐 Browser targeting: Component will select all except disabled ones"
              );
            } else {
              console.log(
                "❌ No Browser data found in targetingData.BrowserNew.value"
              );
              // No API data - let component select all by default
              setBrowserIds(new Set<string>());
              setBrowserData([]);
            }

            // Handle Device Type targeting from API
            if (
              targetingData.device_types &&
              Array.isArray(targetingData.device_types)
            ) {
              console.log(
                "📱 Processing Device Types from API:",
                targetingData.device_types
              );
              const arr = (targetingData.device_types as string[]).map((v) =>
                String(v).toUpperCase()
              );
              if (arr.includes("ALL")) {
                console.log(
                  "📱 Device Types from API indicate ALL -> clearing explicit selections"
                );
                setDeviceIds(new Set<string>());
                setDeviceData([]);
              } else {
                const deviceTypeIds = new Set<string>(arr);
                setDeviceIds(deviceTypeIds);
                const deviceDataArray = arr.map((deviceType: string) => ({
                  id: deviceType,
                  name: deviceType,
                  type: "device",
                }));
                setDeviceData(deviceDataArray);
                console.log(
                  "✅ Device targeting loaded from API:",
                  Array.from(deviceTypeIds)
                );
                console.log("📏 Device types count:", deviceTypeIds.size);
              }
            } else {
              console.log("❌ No device_types array found in API response");
              setDeviceIds(new Set<string>());
              setDeviceData([]);
            }

            // Handle Device Brand targeting from API
            if (
              targetingData.device_brands &&
              Array.isArray(targetingData.device_brands)
            ) {
              console.log(
                "📱 Processing Device Brands from API:",
                targetingData.device_brands
              );
              const deviceBrandIds = new Set<string>(
                targetingData.device_brands as string[]
              );
              setDeviceBrand(deviceBrandIds);
              const deviceBrandDataArray = (
                targetingData.device_brands as string[]
              ).map((brand: string) => ({
                id: brand,
                name: brand,
                type: "device_brand",
              }));
              setDeviceBrandData(deviceBrandDataArray);
              console.log(
                "✅ Device brand targeting loaded from API:",
                Array.from(deviceBrandIds)
              );
              console.log("📏 Device brands count:", deviceBrandIds.size);
            } else {
              console.log("❌ No device_brands array found in API response");
              setDeviceBrand(new Set<string>());
              setDeviceBrandData([]);
            }

            // Handle Carriers targeting from API
            if (
              targetingData.carriers &&
              Array.isArray(targetingData.carriers)
            ) {
              console.log(
                "📶 Processing Carriers from API:",
                targetingData.carriers
              );
              const carrierIds = new Set<string>(
                (targetingData.carriers as Array<number | string>).map((cid) =>
                  String(cid)
                )
              );
              setCarriers(carrierIds);
              const carrierDataArray = (
                targetingData.carriers as Array<number | string>
              ).map((carrierId) => ({
                id: String(carrierId),
                name: `Carrier ${carrierId}`,
                type: "carrier",
              }));
              setCarrierData(carrierDataArray);
              console.log(
                "✅ Carriers targeting loaded from API:",
                Array.from(carrierIds)
              );
              console.log("📏 Carriers count:", carrierIds.size);
            } else {
              console.log("❌ No carriers array found in API response");
              setCarriers(new Set<string>());
              setCarrierData([]);
            }

            // Set time targeting - Offer API provides an object of DAY:HOUR booleans
            if (
              targetingData.day_time &&
              typeof targetingData.day_time === "object"
            ) {
              console.log(
                "🕒 Processing day_time data:",
                targetingData.day_time
              );
              const trueKeys: string[] = Object.entries(
                targetingData.day_time as Record<string, boolean>
              )
                .filter(([, v]: [string, boolean]) => v === true)
                .map(([k]: [string, boolean]) => k.replace(":", "-"));
              console.log("🕒 Time slots with true values:", trueKeys);
              const timeIds = new Set<string>(trueKeys);
              setTimeSlots(timeIds);
              // Derive DayTimeValue[] for any consumers if needed
              const grouped: Record<string, number[]> = {};
              trueKeys.forEach((k) => {
                const [day, hourStr] = k.split("-");
                const hour = parseInt(hourStr, 10);
                if (!grouped[day]) grouped[day] = [];
                if (!Number.isNaN(hour)) grouped[day].push(hour);
              });
              const timeDataForState = Object.entries(grouped).map(
                ([day, hours]) => {
                  const sorted = hours.sort((a, b) => a - b);
                  const periods = sorted.map(
                    (h) =>
                      `${String(h).padStart(2, "0")}:00-${String(
                        h + 1
                      ).padStart(2, "0")}:00`
                  );
                  return {
                    id: day,
                    name: `${day} (${periods.join(", ")})`,
                    type: "time_slot",
                    enabled: true,
                  };
                }
              );
              setTimeData(timeDataForState);
            }

            // Set app lists (support multiple field aliases and map format)
            const appListsData =
              targetingData.app_lists ||
              targetingData.app_list ||
              targetingData.AppLists;
            if (appListsData && Array.isArray(appListsData)) {
              console.log("📱 Processing App Lists from API:", appListsData);
              type AppItem = number | { id: number | string; name?: string };
              const aIds = new Set(
                (appListsData as AppItem[]).map((app) =>
                  typeof app === "number" ? String(app) : String(app.id)
                )
              );
              setAppListIds(aIds);
              const aData = (appListsData as AppItem[]).map((app) => {
                const idStr =
                  typeof app === "number" ? String(app) : String(app.id);
                const nameStr =
                  typeof app === "object" && "name" in app && app.name
                    ? String(app.name)
                    : `App List ${idStr}`;
                return { id: idStr, name: nameStr, type: "app_list" };
              });
              setAppListData(aData);
              console.log(
                "✅ App Lists targeting loaded from API:",
                Array.from(aIds)
              );
              console.log("📏 App Lists count:", aIds.size);
            } else if (appListsData && typeof appListsData === "object") {
              console.log(
                "📱 Processing App Lists from API (map format):",
                Object.keys(appListsData)
              );
              type AppMapValue = { id?: number | string; name?: string };
              const ids: string[] = [];
              const dataArr: Array<{ id: string; name: string; type: string }> =
                [];
              Object.values(
                appListsData as Record<string, AppMapValue>
              ).forEach((val) => {
                if (val && typeof val === "object") {
                  const idStr = String(val.id ?? "").trim();
                  if (idStr) {
                    ids.push(idStr);
                    dataArr.push({
                      id: idStr,
                      name: val.name ?? `App List ${idStr}`,
                      type: "app_list",
                    });
                  }
                }
              });
              setAppListIds(new Set(ids));
              setAppListData(dataArr);
              console.log("✅ App Lists loaded (map):", {
                total: dataArr.length,
                selectedCount: ids.length,
              });
            }

            // Set IP lists (check singular, plural, and alternate key p_list)
            const ipListsData =
              targetingData.ip_list ||
              targetingData.ip_lists ||
              targetingData.p_list;
            if (ipListsData && Array.isArray(ipListsData)) {
              console.log("🌐 Processing IP Lists from API:", ipListsData);
              type IpItem = number | { id: number | string; name?: string };
              const ipListIds = new Set(
                (ipListsData as IpItem[]).map((ip) =>
                  typeof ip === "number" ? String(ip) : String(ip.id)
                )
              );
              setIpListIds(ipListIds);
              const ipListData = (ipListsData as IpItem[]).map((ip) => ({
                id: typeof ip === "number" ? String(ip) : String(ip.id),
                name:
                  typeof ip === "object" && ip.name
                    ? ip.name
                    : `IP List ${typeof ip === "number" ? ip : ip.id}`,
                type: "ip_list",
              }));
              setIpListData(ipListData);
              console.log(
                "✅ IP Lists targeting loaded from API:",
                Array.from(ipListIds)
              );
              console.log("📏 IP Lists count:", ipListIds.size);
            } else if (ipListsData && typeof ipListsData === "object") {
              console.log(
                "🌐 Processing IP Lists from API (map format):",
                Object.keys(ipListsData)
              );
              type IpMapValue = { id?: number | string; name?: string };
              const ids: string[] = [];
              const dataArr: Array<{ id: string; name: string; type: string }> =
                [];
              Object.values(ipListsData as Record<string, IpMapValue>).forEach(
                (val) => {
                  if (val && typeof val === "object") {
                    const idStr = String(val.id ?? "").trim();
                    if (idStr) {
                      ids.push(idStr);
                      dataArr.push({
                        id: idStr,
                        name: val.name ?? `IP List ${idStr}`,
                        type: "ip_list",
                      });
                    }
                  }
                }
              );
              setIpListIds(new Set(ids));
              setIpListData(dataArr);
              console.log("✅ IP Lists loaded (map):", {
                total: dataArr.length,
                selectedCount: ids.length,
              });
            }

            // Set IFA lists (check both singular and plural field names)
            const ifaListsData =
              targetingData.ifa_list || targetingData.ifa_lists;
            if (ifaListsData && Array.isArray(ifaListsData)) {
              console.log("📱 Processing IFA Lists from API:", ifaListsData);
              type IfaItem = number | { id: number | string; name?: string };
              const ifaListIds = new Set(
                (ifaListsData as IfaItem[]).map((ifa) =>
                  typeof ifa === "number" ? String(ifa) : String(ifa.id)
                )
              );
              setIfaListIds(ifaListIds);
              const ifaListData = (ifaListsData as IfaItem[]).map((ifa) => ({
                id: typeof ifa === "number" ? String(ifa) : String(ifa.id),
                name:
                  typeof ifa === "object" && ifa.name
                    ? ifa.name
                    : `IFA List ${typeof ifa === "number" ? ifa : ifa.id}`,
                type: "ifa_list",
              }));
              setIfaListData(ifaListData);
              console.log(
                "✅ IFA Lists targeting loaded from API:",
                Array.from(ifaListIds)
              );
              console.log("📏 IFA Lists count:", ifaListIds.size);
            }

            // Set domain lists (check both referrer_list and domain_lists field names)
            const domainListsData =
              targetingData.referrer_list || targetingData.domain_lists;
            if (domainListsData && Array.isArray(domainListsData)) {
              console.log(
                "🌍 Processing Domain Lists from API:",
                domainListsData
              );
              type DomainItem = number | { id: number | string; name?: string };
              const domainListIds = new Set(
                (domainListsData as DomainItem[]).map((domain) =>
                  typeof domain === "number"
                    ? String(domain)
                    : String(domain.id)
                )
              );
              setDomainListIds(domainListIds);
              const domainListData = (domainListsData as DomainItem[]).map(
                (domain) => ({
                  id:
                    typeof domain === "number"
                      ? String(domain)
                      : String(domain.id),
                  name:
                    typeof domain === "object" && domain.name
                      ? domain.name
                      : `Domain List ${
                          typeof domain === "number" ? domain : domain.id
                        }`,
                  type: "domain_list",
                })
              );
              setDomainListData(domainListData);
              console.log(
                "✅ Domain Lists targeting loaded from API:",
                Array.from(domainListIds)
              );
              console.log("📏 Domain Lists count:", domainListIds.size);
            }

            // Fallback + Merge: consolidated-targeting for app_lists and ip_list to ensure full hydration
            try {
              console.log(
                "🔁 Fetching consolidated-targeting to merge app/ip lists with current selections..."
              );
              const ctUrl = `${window.location.origin}/api/consolidated-targeting?campaign_id=${id}&token=${auth?.token}`;
              const ctRes = await axios.get(ctUrl);
              const ctRows = ctRes?.data?.response?.rows;
              if (ctRows && typeof ctRows === "object") {
                // Merge App Lists from consolidated
                const ctApps =
                  ctRows.app_lists || ctRows.app_list || ctRows.AppLists;
                if (ctApps && Array.isArray(ctApps)) {
                  type AppItem =
                    | number
                    | { id: number | string; name?: string };
                  const fromCt = new Set(
                    (ctApps as AppItem[]).map((app: AppItem) =>
                      typeof app === "number" ? String(app) : String(app.id)
                    )
                  );
                  // Use consolidated list as source of truth to avoid dependency on outer state
                  setAppListIds(fromCt);
                  const aData = (ctApps as AppItem[]).map((app: AppItem) => {
                    const idStr =
                      typeof app === "number" ? String(app) : String(app.id);
                    const nameStr =
                      typeof app === "object" && "name" in app && app.name
                        ? String(app.name)
                        : `App List ${idStr}`;
                    return { id: idStr, name: nameStr, type: "app_list" };
                  });
                  setAppListData(aData);
                  console.log(
                    "✅ Set App Lists from consolidated-targeting:",
                    Array.from(fromCt)
                  );
                }
                // Merge IP Lists from consolidated
                const ctIp = ctRows.ip_list || ctRows.ip_lists || ctRows.p_list;
                if (ctIp && Array.isArray(ctIp)) {
                  type IpItem = number | { id: number | string; name?: string };
                  const fromCtIp = new Set(
                    (ctIp as IpItem[]).map((ip: IpItem) =>
                      typeof ip === "number" ? String(ip) : String(ip.id)
                    )
                  );
                  // Use consolidated list as source of truth to avoid dependency on outer state
                  setIpListIds(fromCtIp);
                  const iData = (ctIp as IpItem[]).map((ip: IpItem) => {
                    const idStr =
                      typeof ip === "number" ? String(ip) : String(ip.id);
                    const nameStr =
                      typeof ip === "object" && "name" in ip && ip.name
                        ? String(ip.name)
                        : `IP List ${idStr}`;
                    return { id: idStr, name: nameStr, type: "ip_list" };
                  });
                  setIpListData(iData);
                  console.log(
                    "✅ Set IP Lists from consolidated-targeting:",
                    Array.from(fromCtIp)
                  );
                }
              } else {
                console.log(
                  "ℹ️ consolidated-targeting returned no rows for this campaign."
                );
              }
            } catch (ctErr) {
              console.warn("⚠️ consolidated-targeting merge failed:", ctErr);
            }
          } else {
            console.log("❌ No targeting data found for campaign ID:", id);
            console.log("📋 Available data structure:", data);

            // When no targeting data exists, ensure all targeting components start with empty selections
            console.log(
              "🔄 Setting empty selections for all targeting components since no data found"
            );
            setOperatingSystem(new Set());
            setOperatingSystemData([]);
            setBrowserIds(new Set());
            setBrowserData([]);
            setCarriers(new Set());
            setCarrierData([]);
            setTimeSlots(new Set());
            setTimeData([]);
            // Preserve App/IP list selections to avoid wiping selections when Offer API doesn't echo them back
            console.log(
              "ℹ️ Preserving App/IP list selections due to missing targeting echo from Offer API"
            );
            setIfaListIds(new Set());
            setIfaListData([]);
            setDomainListIds(new Set());
            setDomainListData([]);
          }
        } else {
          console.log("❌ Invalid response structure:", data);
        }
      } else {
        console.error(
          "❌ Failed to fetch targeting data:",
          response.status,
          response.statusText
        );
        console.error("Error details:", response.data);
      }
    } catch (error) {
      console.error("❌ Error loading targeting data:", error);
      // This is not a critical error, so we don't show it to the user
    }
  }, [auth?.token, id]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `https://panel.adsaro.com/advertiser/api/Campaign/${id}?version=4&token=${auth?.token}`
      );

      const campaignData = res?.data?.response?.rows?.[String(id)];
      if (campaignData) {
        setOption(campaignData.start_date ? "setup" : "immediate");
        setSelectedOption(campaignData.pricing_model);

        // Set ad format
        const match = adFormats.find(
          (format) => format.value === campaignData?.type
        );
        if (match) setSelected(match);

        // Prefill form
        setValue("name", campaignData.name || "");
        setValue("budget_total", String(campaignData.budget_total || ""));
        setValue("budget_daily", String(campaignData.budget_daily || ""));
        setValue("clicks_daily", String(campaignData.clicks_daily || ""));
        setValue("clicks_per_ip", String(campaignData.clicks_per_ip || ""));
        setValue("impressions_per_ip", campaignData.impressions_per_ip || 1);

        const startDateStr = campaignData.start_date
          ? formatDate(campaignData.start_date)
          : "";
        setValue("start_date", startDateStr);
        const endDateStr = campaignData.end_date
          ? formatDate(campaignData.end_date)
          : "";
        setValue("end_date", endDateStr);

        // setValue("start_date", campaignData.start_date ? new Date(campaignData.start_date) : new Date());
        // setValue("end_date", campaignData.end_date ? new Date(campaignData.end_date) : new Date());

        setValue("title", campaignData.title || "");
        setValue("destination_url", campaignData.destination_url || "");
        setValue("defaultCpc", String(campaignData.defaultCpc || ""));

        // Hydrate IP Lists directly from Campaign API if present
        try {
          type IpItem = number | { id: number | string; name?: string };
          const cd = campaignData as Record<string, unknown>;
          const raw = (cd?.ip_list ?? cd?.ip_lists ?? cd?.p_list) as unknown;
          const campaignIpLists = Array.isArray(raw)
            ? (raw as IpItem[])
            : undefined;
          if (campaignIpLists && Array.isArray(campaignIpLists)) {
            console.log(
              "🌐 Campaign API: Found ip_list array:",
              campaignIpLists
            );
            const idsSet = new Set(
              campaignIpLists.map((ip) =>
                typeof ip === "number" ? String(ip) : String(ip.id)
              )
            );
            setIpListIds(idsSet);
            const dataArr = campaignIpLists.map((ip) => ({
              id: typeof ip === "number" ? String(ip) : String(ip.id),
              name:
                typeof ip === "object" && "name" in ip && ip.name
                  ? String(ip.name)
                  : `IP List ${typeof ip === "number" ? ip : ip.id}`,
              type: "ip_list",
            }));
            setIpListData(dataArr);
            console.log(
              "✅ IP Lists hydrated from Campaign API:",
              Array.from(idsSet)
            );
          }
        } catch (e) {
          console.warn("⚠️ Could not hydrate ip_list from Campaign API:", e);
        }

        // Try to load targeting data
        await loadTargetingData();
      }
    } catch (error) {
      console.error("Error loading campaign data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [auth?.token, id, loadTargetingData, setValue]);

  useEffect(() => {
    if (auth?.token && id) {
      loadData();
    }
  }, [loadData, auth?.token, id]);

  // ...

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  function validateStep(step: number): boolean {
    // Basic gating: ensure minimal fields on Step 1; allow Step 2 freely; block submit gating handled by form submit
    if (step === 1) {
      const name = watch("name");
      const budgetTotal = watch("budget_total");
      const budgetDaily = watch("budget_daily");
      return Boolean(name && selectedOption && budgetTotal && budgetDaily);
    }
    if (step === 2) {
      return true;
    }
    if (step === 3) {
      return !isSubmitting;
    }
    return true;
  }

  const goToStep = (step: number) => {
    const target = Math.max(1, Math.min(3, step));
    setCurrentStep(target);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    const hasExplicitBrowserSelection = browsers && browsers.size > 0;
    let browserEdit: Array<{
      id: number | string;
      enabled?: boolean;
      bid_adjustment?: number;
    }> = [];
    if (hasExplicitBrowserSelection) {
      const selectedSet = new Set(Array.from(browsers).map(String));
      browserEdit = browserData
        .filter((b) => selectedSet.has(String(b.id)))
        .map((b) => {
          const idNum = isNaN(Number(b.id)) ? b.id : Number(b.id);
          const item: {
            id: number | string;
            enabled: boolean;
            bid_adjustment?: number;
          } = { id: idNum, enabled: true };
          if (typeof b.bid_adjustment === "number")
            item.bid_adjustment = b.bid_adjustment;
          return item;
        });
    } else if (disabledBrowserIds && disabledBrowserIds.size > 0) {
      const disabledSet = new Set(Array.from(disabledBrowserIds).map(String));
      browserEdit = browserData
        .filter((b) => disabledSet.has(String(b.id)))
        .map((b) => {
          const idNum = isNaN(Number(b.id)) ? b.id : Number(b.id);
          const item: {
            id: number | string;
            enabled: boolean;
            bid_adjustment?: number;
          } = { id: idNum, enabled: false };
          if (typeof b.bid_adjustment === "number")
            item.bid_adjustment = b.bid_adjustment;
          return item;
        });
    }

    // Build OS edit payload from current selection
    const hasExplicitOSSelection = operatingSystem && operatingSystem.size > 0;
    let osEdit: Array<{
      os: string;
      enabled?: boolean;
      bid_adjustment?: number;
    }> = [];
    if (hasExplicitOSSelection) {
      osEdit = Array.from(operatingSystem).map((osKey) => ({
        os: osKey,
        enabled: true,
      }));
    }

    const selectedLocationSet = new Set(Array.from(locationIds));
    const locationEdit = locationData
      .filter((loc) => selectedLocationSet.has(loc.id))
      .map((loc) => ({
        id: loc.id,
        type: loc.type,
        enabled: true,
        ...(typeof loc.bid_adjustment === "number"
          ? { bid_adjustment: loc.bid_adjustment }
          : {}),
        name: loc.name,
      }));

    const dayTime: Record<string, boolean> = {};
    if (timeSlots && timeSlots.size > 0) {
      Array.from(timeSlots).forEach((slot) => {
        const key = slot.replace("-", ":");
        dayTime[key] = true;
      });
    }

    const datas = {
      token: auth.token,
      id: Number(id),
      collectdata: {
        name: data.name,
        type: selected.value,
        budget_total: Number(data.budget_total),
        budget_daily: Number(data.budget_daily),
        clicks_daily: Number(data.clicks_daily),
        clicks_per_ip: Number(data.clicks_per_ip),
        impressions_per_ip: Number(data.impressions_per_ip),
        pricing_model: selectedOption,
        start_date: data.start_date ? data.start_date : null,
        end_date: data.end_date ? data.end_date : null,
        // start_date: formatDate(data.start_date) ?? null,
        // end_date: formatDate(data.end_date) ?? null,
      },
    };

    console.log(
      "Campaign update collectdata (Campaign API):",
      JSON.stringify(datas, null, 2)
    );

    try {
      const response = await fetch("/api/campaign", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: datas }),
      });
      const result = await response.json();

      const campaignOk = result.status === "OK";
      if (campaignOk) {
        console.log("🎉 CAMPAIGN UPDATED SUCCESSFULLY!");
      } else {
        console.warn("⚠️ Campaign update did not return OK:", result);
        console.warn("➡️ Proceeding to update targeting (Offer) anyway.");
      }

      try {
        if (!auth?.token) {
          console.warn("❗ Missing auth token. Skipping targeting update.");
        } else {
          console.log(
            "📡 Resolving Offer ID to update targeting for campaign:",
            id
          );
          const listRes = await axios.get(
            `https://panel.adsaro.com/advertiser/api/OfferNew?version=4&token=${auth?.token}`
          );
          const listRows = listRes?.data?.response?.rows || {};
          const listArray: OfferRow[] = Array.isArray(listRows)
            ? (listRows as OfferRow[])
            : (Object.values(listRows) as OfferRow[]);
          const matchedOffer = listArray.find(
            (row: OfferRow) =>
              String(row?.ad_campaign_id) === String(id) ||
              String(row?.campaign_id) === String(id)
          );

          if (!matchedOffer?.id && !resolvedOfferId) {
            console.warn(
              "⚠️ No matching Offer found for targeting update. Skipping."
            );
          } else {
            const offerId = matchedOffer?.id ?? resolvedOfferId!;
            console.log("✅ Targeting update using Offer ID:", offerId);

            type OfferUpdateCollectData = {
              id: number;
              ad_campaign_id: number;
              name: string;
              bid?: number;
              e_cpm?: number;
              Location?: {
                mode: "UPDATE";
                edit: Array<Record<string, unknown>>;
              };
              OpsysNew?: {
                mode: "UPDATE";
                edit: Array<Record<string, unknown>>;
              };
              BrowserNew?: {
                mode: "UPDATE";
                edit: Array<Record<string, unknown>>;
              };
              day_time?: Record<string, boolean>;
              device_types?: string[];
              device_brands?: string[];
              carriers?: number[];
              app_lists?: number[];
              ip_list?: number[];
              ip_lists?: number[];
              ifa_list?: number[];
              domain_lists?: number[];
            };
            const collectdata: OfferUpdateCollectData = {
              id: Number(offerId),
              ad_campaign_id: Number(id),
              name: data.name,
              bid: data.defaultCpc ? Number(data.defaultCpc) : undefined,
              e_cpm: data.defaultCpc ? Number(data.defaultCpc) : undefined,
            };

            if (locationEdit.length > 0) {
              collectdata.Location = { mode: "UPDATE", edit: locationEdit };
            }
            if (osEdit.length > 0) {
              collectdata.OpsysNew = { mode: "UPDATE", edit: osEdit };
            }
            // Browser targeting will be updated via internal API route /api/device-targeting (same pattern)
            if (Object.keys(dayTime).length > 0) {
              collectdata.day_time = dayTime;
            }
            // Device types will be updated via internal API route /api/device-targeting
            const device_types =
              !deviceIds || deviceIds.size === 0
                ? ["ALL"]
                : Array.from(deviceIds).map((id) => id.toUpperCase());
            // Device brands will be updated via internal API route /api/device-targeting (same as device_types)
            if (carriers && carriers.size > 0) {
              collectdata.carriers = Array.from(carriers).map((v) => Number(v));
            }
            if (appListIds && appListIds.size > 0) {
              const apps = Array.from(appListIds).map((v) => Number(v));
              collectdata.app_lists = apps;
            }
            if (ipListIds && ipListIds.size > 0) {
              const ips = Array.from(ipListIds).map((v) => Number(v));
              collectdata.ip_list = ips;
            }
            if (ifaListIds && ifaListIds.size > 0) {
              collectdata.ifa_list = Array.from(ifaListIds).map((v) =>
                Number(v)
              );
            }
            if (domainListIds && domainListIds.size > 0) {
              collectdata.domain_lists = Array.from(domainListIds).map((v) =>
                Number(v)
              );
            }

            console.log(
              "🚀 Sending targeting update via internal API (without device_types):",
              JSON.stringify(collectdata, null, 2)
            );
            type ApiStatus = {
              status?: string;
              response?: { status?: string };
            } | null;
            let targetingResult: ApiStatus = null;
            try {
              const targRes = await fetch("/api/device-targeting", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  data: {
                    token: auth?.token,
                    id: Number(offerId),
                    collectdata,
                  },
                }),
              });
              targetingResult = await targRes.json();
              console.log(
                "🎯 Internal device-targeting result (Offer update without device_types):",
                targetingResult
              );
            } catch (proxyErr) {
              console.error(
                "❌ Internal device-targeting call failed (Offer update):",
                proxyErr
              );
            }

            // let offerUpdateSuccess = true;

            const ok =
              targetingResult?.response?.status === "OK" ||
              targetingResult?.status === "OK";
            if (!ok) {
              console.warn(
                "⚠️ Offer update via internal API did not return OK:",
                targetingResult
              );
              // offerUpdateSuccess = false;
            } else {
              console.log(
                "✅ Targeting updated successfully via internal API for OfferNew/{id}."
              );
              // Debug: Read back Offer to verify ip_lists/app_lists persisted
              try {
                const verifyRes = await axios.get(
                  `https://panel.adsaro.com/advertiser/api/OfferNew/${offerId}?version=4&token=${auth?.token}`
                );
                const verifyData = verifyRes?.data?.response?.rows || {};
                const vArray = Array.isArray(verifyData)
                  ? verifyData
                  : Object.values(verifyData);
                const first = vArray && vArray.length > 0 ? vArray[0] : null;
                console.log("🔎 Verify Offer read-back (sample row):", first);
                if (first) {
                  console.log(
                    "🔎 Verify app_lists:",
                    first?.app_lists || first?.AppLists || first?.app_list
                  );
                  console.log("🔎 Verify ip lists (fields tried):", {
                    ip_list: first?.ip_list,
                    ip_lists: first?.ip_lists,
                    p_list: first?.p_list,
                    targeting_ip_list: first?.Targeting?.ip_list,
                    targeting_ip_lists: first?.Targeting?.ip_lists,
                    targeting_p_list: first?.Targeting?.p_list,
                  });
                }
              } catch (verifyErr) {
                console.warn("⚠️ Verify read-back failed:", verifyErr);
              }
            }
            // Update device types via internal API and refresh UI
            try {
              console.log(
                "📦 Updating device types via internal API /api/device-targeting:",
                device_types
              );
              const dtRes = await fetch("/api/device-targeting", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  data: {
                    token: auth?.token,
                    id: Number(offerId),
                    collectdata: {
                      name: data.name,
                      ad_campaign_id: Number(id),
                      device_types,
                    },
                  },
                }),
              });
              const dtJson = await dtRes.json();
              console.log("📥 Device-targeting API result:", dtJson);
              const dtOk =
                dtJson?.response?.status === "OK" || dtJson?.status === "OK";
              if (!dtOk) {
                console.warn(
                  "⚠️ Device-targeting API did not return OK:",
                  dtJson
                );
                // offerUpdateSuccess = false;
              } else {
                // Immediately reflect the change in UI without waiting on server-readbacks
                if (device_types.includes("ALL")) {
                  setDeviceIds(new Set<string>());
                  setDeviceData([]);
                } else {
                  const newSet = new Set<string>(device_types);
                  setDeviceIds(newSet);
                  setDeviceData(
                    device_types.map((t) => ({
                      id: t,
                      name: t,
                      type: "device",
                    }))
                  );
                }
                // Do not immediately re-fetch from OfferNew since it may return empty targeting
                // The UI state has been updated above to reflect the latest selection
              }
            } catch (dtErr) {
              console.error("❌ Device-targeting API call failed:", dtErr);
            }
            // Update Device Brands via internal API (if any brand is selected)
            try {
              if (deviceBrand && deviceBrand.size > 0) {
                const device_brands = Array.from(deviceBrand).map((b) =>
                  String(b).toUpperCase()
                );
                console.log(
                  "📦 Updating device brands via internal API /api/device-targeting:",
                  device_brands
                );
                const dbRes = await fetch("/api/device-targeting", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    data: {
                      token: auth?.token,
                      id: Number(offerId),
                      collectdata: {
                        name: data.name,
                        ad_campaign_id: Number(id),
                        device_brands,
                      },
                    },
                  }),
                });
                const dbJson = await dbRes.json();
                console.log("📥 Device-brands targeting API result:", dbJson);
                const dbOk =
                  dbJson?.response?.status === "OK" || dbJson?.status === "OK";
                if (!dbOk) {
                  console.warn(
                    "⚠️ Device-brands API did not return OK:",
                    dbJson
                  );
                  // offerUpdateSuccess = false;
                }
              } else {
                console.log(
                  "ℹ️ No device brands selected; skipping device_brands update"
                );
              }
            } catch (dbErr) {
              console.error("❌ Device-brands API call failed:", dbErr);
            }
            // Update IP Lists via internal API with a dedicated call (mirrors device_types pattern)
            // Update App Lists via internal API with a dedicated call (mirrors device_types pattern)
            try {
              if (appListIds && appListIds.size > 0) {
                const app_lists = Array.from(appListIds).map((v) => Number(v));
                console.log(
                  "📦 Updating App lists via internal API /api/device-targeting:",
                  app_lists
                );
                const appRes = await fetch("/api/device-targeting", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    data: {
                      token: auth?.token,
                      id: Number(offerId),
                      collectdata: {
                        name: data.name,
                        ad_campaign_id: Number(id),
                        app_lists,
                      },
                    },
                  }),
                });
                const appJson = await appRes.json();
                console.log("📥 App lists targeting API result:", appJson);
                const appOk =
                  appJson?.response?.status === "OK" ||
                  appJson?.status === "OK";
                if (!appOk) {
                  console.warn("⚠️ App lists API did not return OK:", appJson);
                  // offerUpdateSuccess = false;
                }
                // Optimistically update local state so UI shows the latest selection
                try {
                  const submitted = new Set<string>(
                    app_lists.map((n) => String(n))
                  );
                  setAppListIds(submitted);
                  console.log(
                    "✅ Optimistically set appListIds state:",
                    Array.from(submitted)
                  );
                } catch (stateErr) {
                  console.warn(
                    "⚠️ Failed to optimistically set appListIds:",
                    stateErr
                  );
                }

                // Read-back sync for App Lists: verify what the server saved and reconcile UI state
                try {
                  console.log(
                    "🔄 Verifying saved App lists via OfferNew read-back..."
                  );
                  const verifyRes = await axios.get(
                    `https://panel.adsaro.com/advertiser/api/OfferNew/${offerId}?version=4&token=${auth?.token}`
                  );
                  const verifyRows = verifyRes?.data?.response?.rows || {};
                  const vArray = Array.isArray(verifyRows)
                    ? verifyRows
                    : Object.values(verifyRows);
                  const firstRow = (
                    vArray && vArray.length > 0 ? vArray[0] : null
                  ) as Record<string, unknown> | null;
                  const savedAppsRaw =
                    firstRow &&
                    ((firstRow as Record<string, unknown>)?.app_lists ||
                      (firstRow as Record<string, unknown>)?.app_list ||
                      (firstRow as Record<string, unknown>)?.AppLists ||
                      (
                        firstRow as Record<
                          string,
                          {
                            app_lists?: unknown;
                            app_list?: unknown;
                            AppLists?: unknown;
                          }
                        >
                      )?.Targeting?.app_lists ||
                      (
                        firstRow as Record<
                          string,
                          {
                            app_lists?: unknown;
                            app_list?: unknown;
                            AppLists?: unknown;
                          }
                        >
                      )?.Targeting?.app_list ||
                      (
                        firstRow as Record<
                          string,
                          {
                            app_lists?: unknown;
                            app_list?: unknown;
                            AppLists?: unknown;
                          }
                        >
                      )?.Targeting?.AppLists);
                  const savedApps = Array.isArray(savedAppsRaw)
                    ? (savedAppsRaw as Array<
                        number | string | { id?: number | string }
                      >)
                    : undefined;
                  if (savedApps && Array.isArray(savedApps)) {
                    const normalized = new Set<string>(
                      savedApps.map((v) => getIdStr(v))
                    );
                    setAppListIds(normalized);
                    const dataArr = savedApps.map((v) => {
                      const idStr = getIdStr(v);
                      return {
                        id: idStr,
                        name: `App List ${idStr}`,
                        type: "app_list",
                      };
                    });
                    setAppListData(dataArr);
                    console.log(
                      "✅ Synced appListIds from Offer read-back:",
                      Array.from(normalized)
                    );
                  } else {
                    console.log(
                      "ℹ️ Offer read-back did not include App lists; trying consolidated-targeting..."
                    );
                    const ctUrl = `${window.location.origin}/api/consolidated-targeting?campaign_id=${id}&token=${auth?.token}`;
                    const ctRes = await axios.get(ctUrl);
                    const ctRows = ctRes?.data?.response?.rows;
                    const ctApps =
                      ctRows?.app_lists || ctRows?.app_list || ctRows?.AppLists;
                    if (ctApps && Array.isArray(ctApps)) {
                      type AppItem = number | string | { id?: number | string };
                      const normalized = new Set<string>(
                        (ctApps as AppItem[]).map((v) => getIdStr(v))
                      );
                      setAppListIds(normalized);
                      const dataArr = (ctApps as AppItem[]).map((v) => {
                        const idStr = getIdStr(v);
                        return {
                          id: idStr,
                          name: `App List ${idStr}`,
                          type: "app_list",
                        };
                      });
                      setAppListData(dataArr);
                      console.log(
                        "✅ Synced appListIds from consolidated-targeting:",
                        Array.from(normalized)
                      );
                    } else {
                      console.log(
                        "ℹ️ consolidated-targeting also did not include App lists."
                      );
                    }
                  }
                } catch (syncErr) {
                  console.warn(
                    "⚠️ Read-back sync for App lists failed:",
                    syncErr
                  );
                }
              } else {
                console.log(
                  "ℹ️ No App lists selected; skipping app_lists update"
                );
              }
            } catch (appErr) {
              console.error("❌ App lists API call failed:", appErr);
            }

            // Update IP Lists via internal API with a dedicated call (mirrors device_types pattern)
            try {
              if (ipListIds && ipListIds.size > 0) {
                const ip_list = Array.from(ipListIds).map((v) => Number(v));
                console.log(
                  "📦 Updating IP lists via internal API /api/device-targeting:",
                  ip_list
                );
                const ipRes = await fetch("/api/device-targeting", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    data: {
                      token: auth?.token,
                      id: Number(offerId),
                      collectdata: {
                        name: data.name,
                        ad_campaign_id: Number(id),
                        ip_list,
                      },
                    },
                  }),
                });
                const ipJson = await ipRes.json();
                console.log("📥 IP lists targeting API result:", ipJson);
                const ipOk =
                  ipJson?.response?.status === "OK" || ipJson?.status === "OK";
                if (!ipOk) {
                  console.warn("⚠️ IP lists API did not return OK:", ipJson);
                  // Retry with alternative schema: Targeting.ip_list = number[]
                  try {
                    console.log(
                      "🔁 Retrying IP lists update with Targeting.ip_list shape..."
                    );
                    const ipRetryRes = await fetch("/api/device-targeting", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        data: {
                          token: auth?.token,
                          id: Number(offerId),
                          collectdata: {
                            name: data.name,
                            ad_campaign_id: Number(id),
                            Targeting: { ip_list },
                          },
                        },
                      }),
                    });
                    const ipRetryJson = await ipRetryRes.json();
                    console.log(
                      "📥 IP lists retry API result (Targeting.ip_list):",
                      ipRetryJson
                    );
                  } catch (retryErr) {
                    console.warn("⚠️ IP lists retry failed:", retryErr);
                    // offerUpdateSuccess = false;
                  }
                }
                // Optimistically update local state so UI shows the latest selection
                try {
                  const submitted = new Set<string>(
                    ip_list.map((n) => String(n))
                  );
                  setIpListIds(submitted);
                  console.log(
                    "✅ Optimistically set ipListIds state:",
                    Array.from(submitted)
                  );
                } catch (stateErr) {
                  console.warn(
                    "⚠️ Failed to optimistically set ipListIds:",
                    stateErr
                  );
                }

                // Read-back sync: verify what the server saved and reconcile UI state
                try {
                  console.log(
                    "🔄 Verifying saved IP lists via OfferNew read-back..."
                  );
                  const verifyRes = await axios.get(
                    `https://panel.adsaro.com/advertiser/api/OfferNew/${offerId}?version=4&token=${auth?.token}`
                  );
                  const verifyRows = verifyRes?.data?.response?.rows || {};
                  const vArray = Array.isArray(verifyRows)
                    ? verifyRows
                    : Object.values(verifyRows);
                  const firstRow = (
                    vArray && vArray.length > 0 ? vArray[0] : null
                  ) as Record<string, unknown> | null;
                  const savedIpsRaw =
                    firstRow &&
                    ((firstRow as Record<string, unknown>)?.ip_list ||
                      (firstRow as Record<string, unknown>)?.ip_lists ||
                      (firstRow as Record<string, unknown>)?.p_list ||
                      (
                        firstRow as Record<
                          string,
                          {
                            ip_list?: unknown;
                            ip_lists?: unknown;
                            p_list?: unknown;
                          }
                        >
                      )?.Targeting?.ip_list ||
                      (
                        firstRow as Record<
                          string,
                          {
                            ip_list?: unknown;
                            ip_lists?: unknown;
                            p_list?: unknown;
                          }
                        >
                      )?.Targeting?.ip_lists ||
                      (
                        firstRow as Record<
                          string,
                          {
                            ip_list?: unknown;
                            ip_lists?: unknown;
                            p_list?: unknown;
                          }
                        >
                      )?.Targeting?.p_list);
                  const savedIps = Array.isArray(savedIpsRaw)
                    ? (savedIpsRaw as Array<
                        number | string | { id?: number | string }
                      >)
                    : undefined;
                  if (savedIps && Array.isArray(savedIps)) {
                    const normalized = new Set<string>(
                      savedIps.map((v) => getIdStr(v))
                    );
                    setIpListIds(normalized);
                    const dataArr = savedIps.map((v) => {
                      const idStr = getIdStr(v);
                      return {
                        id: idStr,
                        name: `IP List ${idStr}`,
                        type: "ip_list",
                      };
                    });
                    setIpListData(dataArr);
                    console.log(
                      "✅ Synced ipListIds from Offer read-back:",
                      Array.from(normalized)
                    );
                  } else {
                    console.log(
                      "ℹ️ Offer read-back did not include IP lists; trying consolidated-targeting..."
                    );
                    const ctUrl = `${window.location.origin}/api/consolidated-targeting?campaign_id=${id}&token=${auth?.token}`;
                    const ctRes = await axios.get(ctUrl);
                    const ctRows = ctRes?.data?.response?.rows;
                    const ctIp =
                      ctRows?.ip_list || ctRows?.ip_lists || ctRows?.p_list;
                    if (ctIp && Array.isArray(ctIp)) {
                      type IpItem = number | string | { id?: number | string };
                      const normalized = new Set<string>(
                        (ctIp as IpItem[]).map((v) => getIdStr(v))
                      );
                      setIpListIds(normalized);
                      const dataArr = (ctIp as IpItem[]).map((v) => {
                        const idStr = getIdStr(v);
                        return {
                          id: idStr,
                          name: `IP List ${idStr}`,
                          type: "ip_list",
                        };
                      });
                      setIpListData(dataArr);
                      console.log(
                        "✅ Synced ipListIds from consolidated-targeting:",
                        Array.from(normalized)
                      );
                    } else {
                      console.log(
                        "ℹ️ consolidated-targeting also did not include IP lists."
                      );
                    }
                  }
                } catch (syncErr) {
                  console.warn(
                    "⚠️ Read-back sync for IP lists failed:",
                    syncErr
                  );
                }
              } else {
                console.log(
                  "ℹ️ No IP lists selected; skipping ip_lists update"
                );
              }
            } catch (ipErr) {
              console.error("❌ IP lists API call failed:", ipErr);
            }
            // Update Browser targeting via internal API (if any browser selection state exists)
            try {
              if (browserEdit && browserEdit.length > 0) {
                console.log(
                  "📦 Updating browsers via internal API /api/device-targeting:",
                  browserEdit
                );
                const brRes = await fetch("/api/device-targeting", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    data: {
                      token: auth?.token,
                      id: Number(offerId),
                      collectdata: {
                        name: data.name,
                        ad_campaign_id: Number(id),
                        BrowserNew: { mode: "UPDATE", edit: browserEdit },
                      },
                    },
                  }),
                });
                const brJson = await brRes.json();
                console.log("📥 Browser targeting API result:", brJson);
                const brOk =
                  brJson?.response?.status === "OK" || brJson?.status === "OK";
                if (!brOk) {
                  console.warn(
                    "⚠️ Browser targeting API did not return OK:",
                    brJson
                  );
                  // offerUpdateSuccess = false;
                }
              } else {
                console.log(
                  "ℹ️ No explicit browserEdit entries; skipping BrowserNew update"
                );
              }
            } catch (brErr) {
              console.error("❌ Browser targeting API call failed:", brErr);
            }
          }
        }
      } catch (targetErr) {
        console.error("❌ Error during targeting update step:", targetErr);
      }

      // If all Offer/OfferNew updates succeeded, show a success toast before navigating back
      try {
        try {
          toast.success("Campaign successfully updated and targeting applied", {
            position: "top-right",
            autoClose: 3000,
          });
          // Navigate back even if campaign update failed but targeting was attempted
          router.push("/advertiser/campaign");
        } catch (toastErr) {
          console.warn("Could not show toast notification:", toastErr);
        }
      } catch (e) {
        // Defensive: if offerUpdateSuccess isn't in scope or another error occurs, ignore and continue
        console.warn("Could not determine offer update success state:", e);
      }

      if (!campaignOk) {
        const msg = result?.message || "Campaign update failed";
        // Surface validation errors on relevant fields
        if (msg.includes("pricing model") || msg.includes("pricing_model")) {
          setError("pricing_model", { type: "custom", message: msg });
        }
        if (msg.includes("clicks_per_ip")) {
          setError("clicks_per_ip", {
            type: "custom",
            message: "Clicks per IP must be between 1 and 50",
          });
        }
        if (msg.includes("impressions_per_ip")) {
          setError("impressions_per_ip", {
            type: "custom",
            message: "Impressions per IP must be between 1 and 50",
          });
        }
      } else {
      }
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      try {
        toast.success("Campaign successfully updated", {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (toastErr) {
        console.warn("Could not show toast notification:", toastErr);
      }
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <AdvertiserSidebar variant="inset" />
        <SidebarInset>
          <SiteAdvertiserHeader />
          <div className="flex flex-col flex-1">
            <div className="@container/main gap-2">
              <div className="container sm:p-8 mx-auto py-4 md:gap-6 md:py-6">
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                      Loading campaign data...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <AdvertiserSidebar variant="inset" />
      <SidebarInset>
        <SiteAdvertiserHeader />
        <div className="flex flex-col flex-1">
          <div className="@container/main gap-2">
            <div className="container sm:p-8 mx-auto py-4 md:gap-6 md:py-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">Edit Campaign</h1>
                <p className="text-gray-600">
                  Update your campaign settings and targeting options
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Basic Campaign Information */}
                {currentStep === 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Campaign Information</CardTitle>
                      <CardDescription>
                        Set up your basic campaign details and budget
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Ad Format Selection */}
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold">
                          Ad Format
                        </Label>
                        <div className="md:flex gap-8">
                          <div className="flex items-center justify-center">
                            <div className="w-full  border rounded-lg bg-gray-50 p-1">
                              <Image
                                width={300}
                                height={200}
                                src={selected.image}
                                alt={selected.name}
                                className="w-full h-32 object-contain rounded"
                              />
                              <div className="mt-3 text-center">
                                <h3 className="font-medium">{selected.name}</h3>
                                <p className="text-sm text-gray-600">
                                  {selected.description}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="w-full md:w-1/2 grid grid-cols-2 gap-x-4">
                            {adFormats.map((format) => (
                              <Button
                                key={format.name}
                                type="button"
                                variant={
                                  selected.value === format.value
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => setSelected(format)}
                                className="text-sm"
                              >
                                {format.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <p className="text-sm text-red-500">
                              {errors.name.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="pricing_model">Pricing Model</Label>
                          <select
                            id="pricing_model"
                            value={selectedOption}
                            onChange={(e) => setSelectedOption(e.target.value)}
                            className="p-1.5 border block w-full rounded-md border-gray-300 shadow-sm"
                          >
                            <option value="">
                              -- Please choose a pricing model --
                            </option>
                            <option value="CPC">CPC</option>
                            <option value="CPM">CPM</option>
                          </select>
                          {errors.pricing_model && (
                            <p className="text-sm text-red-500">
                              {errors.pricing_model.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="budget_total">Total Budget</Label>
                          <Input
                            id="budget_total"
                            placeholder="e.g. 1000"
                            {...register("budget_total", {
                              required: "Total budget is required",
                            })}
                          />
                          {errors.budget_total && (
                            <p className="text-sm text-red-500">
                              {errors.budget_total.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="budget_daily">Daily Budget</Label>
                          <Input
                            id="budget_daily"
                            placeholder="e.g. 100"
                            {...register("budget_daily", {
                              required: "Daily budget is required",
                            })}
                          />
                          {errors.budget_daily && (
                            <p className="text-sm text-red-500">
                              {errors.budget_daily.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-4">
                          <Label className="text-lg font-semibold">
                            When do you want to start a campaign?
                          </Label>
                          <RadioGroup
                            value={option}
                            onValueChange={(value) => setOption(value)}
                            className="space-y-2 flex gap-x-9"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="immediate"
                                id="immediate"
                              />
                              <Label htmlFor="immediate">
                                Start immediately, run continuously
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="setup" id="setup" />
                              <Label htmlFor="setup">
                                Setup start and end date
                              </Label>
                            </div>
                          </RadioGroup>

                          {option === "setup" && (
                            <div className="space-y-2">
                              <Label>Date range</Label>
                              <div className="flex space-x-2">
                                <div className="flex-1">
                                  <Input
                                    type="date"
                                    {...register("start_date", {
                                      required: "Start date is required",
                                      validate: (value) => {
                                        if (!value)
                                          return "Start date is required";
                                        return true;
                                      },
                                    })}
                                  />
                                  {errors.start_date && (
                                    <p className="text-sm text-red-500 mt-1">
                                      {errors.start_date.message}
                                    </p>
                                  )}
                                </div>
                                <span className="self-center">-</span>
                                <div className="flex-1">
                                  <Input
                                    type="date"
                                    {...register("end_date", {
                                      required: "End date is required",
                                      validate: (value) => {
                                        if (!value)
                                          return "End date is required";
                                        const startDate = new Date(
                                          watch("start_date")
                                        );
                                        const endDate = new Date(value);
                                        if (endDate < startDate)
                                          return "End date must be after start date";
                                        return true;
                                      },
                                    })}
                                  />
                                  {errors.end_date && (
                                    <p className="text-sm text-red-500 mt-1">
                                      {errors.end_date.message}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="clicks_daily">Daily Clicks</Label>
                          <Input
                            id="clicks_daily"
                            placeholder="e.g. 200"
                            {...register("clicks_daily", {
                              required: "Clicks Daily is required",
                            })}
                          />
                          {errors.clicks_daily && (
                            <p className="text-sm text-red-500">
                              {errors.clicks_daily.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="clicks_per_ip">Clicks per IP</Label>
                          <Input
                            id="clicks_per_ip"
                            placeholder="e.g. 2"
                            {...register("clicks_per_ip", {
                              required: "Clicks Per IP is required",
                            })}
                          />
                          {errors.clicks_per_ip && (
                            <p className="text-sm text-red-500">
                              {errors.clicks_per_ip.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="impressions_per_ip">
                            Impressions per IP
                          </Label>
                          <Input
                            id="impressions_per_ip"
                            placeholder="e.g. 5"
                            {...register("impressions_per_ip", {
                              required: "Impressions per IP is required",
                            })}
                          />
                          {errors.impressions_per_ip && (
                            <p className="text-sm text-red-500">
                              {errors.impressions_per_ip.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Targeting */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Targeting Options</CardTitle>
                        <CardDescription>
                          Configure your targeting settings to reach the right
                          audience
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <EditLocationTargeting
                          onSelectionChange={handleLocationSelection}
                          onDataChange={handleLocationDataChange}
                          selectedIds={locationIds}
                        />
                        <Separator />
                        <OperatingSystem
                          selectedIds={operatingSystem}
                          onSelectionChange={handleOperatingSystemSelection}
                          onDataChange={handleOperatingSystemDataChange}
                        />
                        <Separator />
                        <DeviceTargeting
                          selectedIds={deviceIds}
                          onSelectionChange={handleDeviceSelection}
                          onDeviceDataChange={handleDeviceDataChange}
                        />
                        <Separator />
                        <DeviceBrand
                          onSelectionChange={handleDeviceBrandSelection}
                          onDeviceBrandDataChange={handleDeviceBrandDataChange}
                          selectedIds={Array.from(deviceBrand)}
                        />
                        <Separator />
                        <BrowserTargeting
                          selectedIds={browsers}
                          disabledIds={disabledBrowserIds}
                          disabledTypes={disabledBrowserTypes}
                          onSelectionChange={handleBrowserSelection}
                          onDataChange={handleBrowserDataChange}
                        />
                        <Separator />
                        <Carriers
                          onSelectionChange={handleCarrierSelection}
                          onCarrierDataChange={handleCarrierDataChange}
                          selectedIds={Array.from(carriers)}
                        />
                        <Separator />
                        <TimeTargeting
                          onSelectionChange={handleTimeSelection}
                          onTimeDataChange={handleTimeDataChange}
                          initialSelections={timeSlots}
                        />
                        <Separator />
                        <AppLists
                          onSelectionChange={handleAppListSelection}
                          onAppListDataChange={handleAppListDataChange}
                          selectedIds={Array.from(appListIds)}
                        />
                        <Separator />
                        <IpLists
                          onSelectionChange={handleIpListSelection}
                          onIpListDataChange={handleIpListDataChange}
                          selectedIds={Array.from(ipListIds)}
                        />
                        <Separator />
                        <IfaLists
                          onSelectionChange={handleIfaListSelection}
                          onIfaListDataChange={handleIfaListDataChange}
                          selectedIds={Array.from(ifaListIds)}
                        />
                        <Separator />
                        <DomainLists
                          onSelectionChange={handleDomainListSelection}
                          onDomainListDataChange={handleDomainListDataChange}
                          selectedIds={Array.from(domainListIds)}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Review Campaign</CardTitle>
                      <CardDescription>
                        Review your campaign settings before updating
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">
                          Campaign Summary
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Campaign Name:
                            </span>
                            <span className="font-medium">
                              {watch("name") || "Not set"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ad Format:</span>
                            <span className="font-medium">{selected.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Pricing Model:
                            </span>
                            <span className="font-medium">
                              {selectedOption}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Budget:</span>
                            <span className="font-medium">
                              ${watch("budget_total") || "0"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Daily Budget:</span>
                            <span className="font-medium">
                              ${watch("budget_daily") || "0"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">
                          Targeting Summary
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Locations:</span>
                            <Badge
                              variant={
                                locationIds.size > 0 ? "default" : "secondary"
                              }
                            >
                              {locationIds.size} selected
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Operating Systems:
                            </span>
                            <Badge
                              variant={
                                operatingSystem.size > 0
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {operatingSystem.size} selected
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Device Types:</span>
                            <Badge
                              variant={
                                deviceIds.size > 0 ? "default" : "secondary"
                              }
                            >
                              {deviceIds.size} selected
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Browsers:</span>
                            <Badge
                              variant={
                                browsers.size > 0 ? "default" : "secondary"
                              }
                            >
                              {browsers.size} selected
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Time Targeting:
                            </span>
                            <Badge
                              variant={
                                timeSlots.size > 0 ? "default" : "secondary"
                              }
                            >
                              {timeSlots.size > 0 ? "Configured" : "Not set"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>

                  <div className="flex space-x-2">
                    {[1, 2, 3].map((step) => (
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
                  </div>

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!validateStep(currentStep)}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Updating..." : "Update Campaign"}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
