"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface CampaignItem {
  id: string;
  name: string;
  type?: string;
  pricing_model?: string;
}

interface BannerSize {
  id: number | string;
  width: number;
  height: number;
}

interface CreateCreativeFormProps {
  onSuccess?: () => void;
  navigateOnSuccess?: boolean;
}

export default function CreateCreativeForm({
  onSuccess,
  navigateOnSuccess = true,
}: CreateCreativeFormProps) {
  const { token } = useAuth();

  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [campaignTotal, setCampaignTotal] = useState<number>(0);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [offerId, setOfferId] = useState<string>("");
  const [loadingOfferId, setLoadingOfferId] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // form state
  // const [campaignType, setCampaignType] = useState<
  //   "CPC" | "CPV" | "NATIVE" | "DISPLAY" | "PUSH" | "FLOATING_PUSH" | "CALENDAR_PUSH" | "VIDEO" | ""
  // >("");

  const [campaignType, setCampaignType] = useState<
  "CPC" | "NATIVE" | "DISPLAY" | "PUSH" | "VIDEO" | ""
>("");

  
  const [adCampaignId, setAdCampaignId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [destUrl, setDestUrl] = useState("");
  const [display, setDisplay] = useState("");
  const [cta, setCta] = useState("");
  const [sponsored, setSponsored] = useState("");
  // const [enabled, setEnabled] = useState(true);

  const [showAllPopMacros, setShowAllPopMacros] = useState(false);

  // new: creative type and html text / banner size
  const [adType, setAdType] = useState<"IMAGE" | "HTML">("IMAGE");
  const [htmlText, setHtmlText] = useState<string>("");
  const [bannerSizeId, setBannerSizeId] = useState<string>("");

  const [bannerList, setBannerList] = useState<BannerSize[]>([]);
  const [bannerSearch, setBannerSearch] = useState<string>("");

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImageSize, setMainImageSize] = useState<{ w: number; h: number } | null>(null);

  const [iconImageFile, setIconImageFile] = useState<File | null>(null);
  const [iconImageSize, setIconImageSize] = useState<{ w: number; h: number } | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoMeta, setVideoMeta] = useState<{ w: number; h: number; bitrate: number; duration: number } | null>(null);

  // const endpoint = useMemo(() => `/api/offerad`, []);
  const offerNewEndpoint = useMemo(() => `/api/offernew/ad`, []);

  const loadBannerSize = async () => {
    try {
      const baseUrl =
        "https://panel.adsaro.com/admin/api/CpmBannerSize/?version=5&userToken=l95U5k9sQhhlLEal";
      const limit = 100;
      let start = 0;
      let allRows: BannerSize[] = [];
      let keepGoing = true;

      while (keepGoing) {
        const url = `${baseUrl}&range=${start}-${start + limit - 1}`;
        const response = await axios.get(url);
        const rows = response.data?.response?.rows;
        const bannerArray = rows ? (Object.values(rows) as BannerSize[]) : [];

        if (bannerArray.length === 0) {
          keepGoing = false;
          break;
        }

        allRows = [...allRows, ...bannerArray];
        start += limit;
      }

      setBannerList(allRows);
    } catch (error) {
      console.error("Failed to load Banner:", error);
    }
  };

  useEffect(() => {
    loadBannerSize();
  }, []);

  const bannerSizeOptions = useMemo(() => {
    const byId = new Map<string, BannerSize>();
    bannerList.forEach((b) => {
      byId.set(String(b.id), b);
    });

    return Array.from(byId.values())
      .sort((a, b) => {
        const aw = Number(a.width);
        const bw = Number(b.width);
        if (aw !== bw) return aw - bw;
        return Number(a.height) - Number(b.height);
      });
  }, [bannerList]);

  const normalizedBannerQuery = useMemo(
    () => bannerSearch.toLowerCase().replace(/[×x]/g, "x").replace(/\s+/g, ""),
    [bannerSearch]
  );

  const filteredBannerSizeOptions = useMemo(() => {
    if (!normalizedBannerQuery) return bannerSizeOptions;
    return bannerSizeOptions.filter((b) =>
      `${b.width}x${b.height}`.toLowerCase().includes(normalizedBannerQuery)
    );
  }, [bannerSizeOptions, normalizedBannerQuery]);

  // Helper to convert a File to base64 (without data URL prefix)
  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data URL prefix if present
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // const campaignTypes = useMemo(
  //   () => ["CPC", "CPV", "NATIVE", "DISPLAY", "PUSH", "FLOATING_PUSH", "CALENDAR_PUSH", "VIDEO"],
  //   []
  // );

const campaignTypes = useMemo(
  () => ["CPC", "PUSH", "NATIVE", "DISPLAY", "VIDEO"],
  []
);


  const campaignTypeLabel = (t: string): string => {
    if (t === "CPC") return "POP";
    if (t === "DISPLAY") return "Display";
    return t;
  };

  const filteredCampaigns = useMemo(() => {
    if (!campaignType) return [];
    return campaigns.filter((c) => String(c.type ?? "").toUpperCase() === campaignType);
  }, [campaigns, campaignType]);

  const selectedCampaign = useMemo(() => {
    if (!adCampaignId) return null;
    return campaigns.find((c) => String(c.id) === String(adCampaignId)) ?? null;
  }, [campaigns, adCampaignId]);

  const POP_MACROS = useMemo(
    () => [
      "{keyword} matched keyword. i.e. 'best deals', RON keyword will return '*'",
      "{query} Publisher request keyword. i.e. 'best deals'",
      "{browser} Browser",
      "{os} Operation system",
      "{os_type} Operating System w/o version",
      "{device_type} Device Type, i.e. Desktop, Mobile",
      "{device_brand} Device Brand",
      "{device_model} Device Model",
      "{date} date in ISO format (i.e. 2019-12-23)",
      "{month} month name (i.e. December)",
      "{day_of_month} day of month number (i.e. 23)",
      "{day_of_week} day of week name (i.e. Monday)",
      "{month:ln} localized month name. ln - is a two-letter language code, i.e. 'pl'",
      "{day_of_week:ln} localized day of week name. ln - is a two-letter language code, i.e. 'pl'",
      "{country_name:ln} localized country name. ln - is a two-letter language code, i.e. 'pl'",
      "{city:ln} localized city name. ln - is a two-letter language code, i.e. 'pl'",
      "{City:ln} localized title-cased city name. ln - is a two-letter language code, i.e. 'pl'",
    ],
    [],
  );

  const PUSH_VIDEO_MACROS = useMemo(
    () => [
      "{aa} Required for Event Tracking",
      "{banner} Ad ID",
      "{bid} Bid price",
      "{browser} Browser",
      "{campaign} Campaign ID",
      "{carrier} Visitor's ISP",
      "{city} city name. i.e. 'cabot'",
      "{conversion} Conversion tracking",
      "{country} 2-letter ISO country code. i.e. 'us'",
      "{device_brand} Device Brand",
      "{device_model} Device Model",
      "{device_type} Device Type, i.e. Desktop, Mobile",
      "{event_city} Event city",
      "{event_country} Two-letter event country (ISO 3166-2)",
      "{event_lat} Event latitude",
      "{event_long} Event longitude",
      "{event_state} Event region",
      "{event_zip} Event postal code",
      "{ga} Required for Google Analytics statistics",
      "{ip} User IP",
      "{keyword} matched keyword. i.e. 'best deals', RON keyword will return '*'",
      "{offer} Offer ID",
      "{original_subid} Not limited subID",
      "{os} Operation system",
      "{os_type} Operating System w/o version",
      "{pubfeed} Publisher Feed ID",
      "{publisher} Publisher id",
      "{pubpoint} Publisher point id",
      "{pubzone} Publisher zone id",
      "{query} Publisher request keyword. i.e. 'best deals'",
      "{referrer} Referrer URL (urlencoded)",
      "{referrer_domain} Referrer domain",
      "{referrer_hash} Referrer URL hash",
      "{remfeed} Remote Feed ID",
      "{request_id} ID of the request that originated the click",
      "{search_ip} Search user IP",
      "{search_referrer_domain} Search referrer domain",
      "{source} Traffic source macro",
      "{source_original_subid} Not limited source subid",
      "{source_subid} Source subid",
      "{state} state ISO code. i.e. 'ar'",
      "{subid} Publisher Feed subID",
      "{tagid} Tag Id",
      "{timestamp} Timestamp (Unix epoch time)",
      "{user_agent} User agent",
      "{zip} zip code. i.e. '72023'",
      "{zone} pub zone id",
    ],
    [],
  );

  const DISPLAY_NATIVE_MACROS = useMemo(
    () => [
      "{cachebuster} random number",
      "{url} referrer URL (urlencoded)",
      "{campaign} Campaign ID",
      "{banner} Ad ID",
      "{domain} referrer domain (urlencoded)",
      "{site_id} Site id",
      "{app_id} Application id",
      "{app_bundle} Application bundle",
      "{app_domain} app domain (urlencoded)",
      "{app_store_url} app store url (urlencoded)",
      "{country} 2-letter ISO country code. i.e. 'us'",
      "{carrier} Visitor's ISP",
      "{city} city name. i.e. 'cabot'",
      "{offer} Offer ID",
      "{zip} zip code. i.e. '72023'",
      "{long} longitude of the user",
      "{lat} latitude of the user",
      "{ip} User IP",
      "{ifa} Device identifier for advertisers",
      "{device_type} Device Type, i.e. Desktop, Mobile",
      "{os} Operation system",
      "{browser} Browser",
      "{user_agent} User agent",
      "{query} Publisher request keyword. i.e. 'best deals'",
      "{pub_id} publisher id",
      "{subid} Publisher Feed subID",
      "{source} Traffic source macro",
      "{gdpr} 0=GDPR does not apply 1=GDPR applies",
      "{user_consent} user consent string",
      "{timestamp} Timestamp (Unix epoch time)",
    ],
    [],
  );

  const macrosForCampaignType = useMemo((): string[] => {
    if (campaignType === "CPC") return POP_MACROS;
    if (campaignType === "PUSH" || campaignType === "VIDEO") return PUSH_VIDEO_MACROS;
    if (campaignType === "DISPLAY" || campaignType === "NATIVE") return DISPLAY_NATIVE_MACROS;
    return [];
  }, [campaignType, POP_MACROS, PUSH_VIDEO_MACROS, DISPLAY_NATIVE_MACROS]);

  const macroHintContent = useMemo(() => {
    if (campaignType !== "CPC") return macrosForCampaignType;
    const shortCount = 4;
    return showAllPopMacros ? macrosForCampaignType : macrosForCampaignType.slice(0, shortCount);
  }, [campaignType, macrosForCampaignType, showAllPopMacros]);

  const isHtmlThirdParty = useMemo(() => {
    const t = (htmlText || "").toLowerCase();
    return t.includes("<script") || t.includes("<iframe");
  }, [htmlText]);

  const deriveDomainFromUrl = (url: string) => {
    try {
      const u = new URL(url);
      const host = u.hostname || "";
      return host.replace(/^www\./i, "");
    } catch {
      return "";
    }
  };

  useEffect(() => {
    // Keep underlying creative type aligned to the selected campaign type
    // - DISPLAY: user can choose IMAGE/HTML
    // - CPC: always HTML (text)
    // - Others: always IMAGE
    if (campaignType === "CPC") setAdType("HTML");
    else if (campaignType && campaignType !== "DISPLAY") setAdType("IMAGE");

    // Reset irrelevant fields when switching type
    setTitle("");
    setDesc("");
    setDestUrl("");
    setDisplay("");
    setCta("");
    setSponsored("");
    setHtmlText("");
    setBannerSizeId("");
    handleMainImage(null);
    handleIconImage(null);
    setVideoFile(null);
    setVideoMeta(null);
  }, [campaignType]);

  useEffect(() => {
    // Rule: destination URL must be blank if 3rd-party JS or iFrame is used
    if (campaignType === "CPC" && isHtmlThirdParty && destUrl) {
      setDestUrl("");
    }
  }, [campaignType, isHtmlThirdParty, destUrl]);

  useEffect(() => {
    if (!destUrl) return;
    if (display) return;
    const derived = deriveDomainFromUrl(destUrl);
    if (derived) setDisplay(derived);
  }, [destUrl, display]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!token) return;
      try {
        setLoadingCampaigns(true);
        const resp = await axios.get(`https://panel.adsaro.com/advertiser/api/Campaign/?version=4&token=${token}`);
        const rawRows = (resp.data?.rows ?? resp.data?.response?.rows ?? {}) as Record<string, any>;
        const total = Number(resp.data?.total ?? resp.data?.response?.total ?? 0);
        const rows = Object.values(rawRows || {}) as Array<{
          id: number | string;
          name?: string;
          pricing_model?: string;
          type?: string;
        }>;
        // const list: CampaignItem[] = rows.map((r) => ({
        //   id: String(r.id),
        //   name: r.name ?? String(r.id),
        //   type: r.type,
        //   pricing_model: r.pricing_model,
        // }));

const allowedTypes = ["CPC", "PUSH", "NATIVE", "DISPLAY", "VIDEO"];

const list: CampaignItem[] = rows
  .filter((r) => allowedTypes.includes(String(r.type).toUpperCase()))
  .map((r) => ({
    id: String(r.id),
    name: r.name ?? String(r.id),
    type: r.type,
    pricing_model: r.pricing_model,
  }));

        setCampaigns(list);
        setCampaignTotal(Number.isFinite(total) ? total : list.length);
      } catch (e) {
        console.error("Failed to load campaigns", e);
        toast.error("Failed to load campaigns");
      } finally {
        setLoadingCampaigns(false);
      }
    };
    fetchCampaigns();
  }, [token]);

  useEffect(() => {
    // If campaign type changes, clear selected campaign if it no longer matches
    if (!campaignType) {
      setAdCampaignId("");
      return;
    }
    if (!adCampaignId) return;
    const selected = campaigns.find((c) => String(c.id) === String(adCampaignId));
    const selectedType = String(selected?.type ?? "").toUpperCase();
    const ok = selectedType === campaignType;
    if (selected && !ok) {
      setAdCampaignId("");
    }
  }, [campaignType, adCampaignId, campaigns]);

  // Fetch OfferNew list to resolve offers_feed_id for the selected campaign
  useEffect(() => {
    const fetchOfferId = async () => {
      if (!adCampaignId) {
        setOfferId("");
        return;
      }
      try {
        setLoadingOfferId(true);
        const resp = await axios.get(
          `https://panel.adsaro.com/advertiser/api/OfferNew/?version=4&token=${token}`
        );
        const rows = Object.values(resp.data?.response?.rows || {}) as Array<{
          id: number | string;
          ad_campaign_id: number | string;
        }>;
        console.log("🎯 OfferNew response:", rows);
        console.log("🎯 adCampaignId:", adCampaignId);
        // Try to locate the offer for this campaign
        const match = rows.find((r) => String(r.ad_campaign_id) === String(adCampaignId));
        console.log("🎯 match:", match);
        if (match?.id) {
          setOfferId(String(match.id));
        } else {
          setOfferId("");
        }
      } catch (e) {
        console.error("Failed to resolve offer id from OfferNew", e);
        setOfferId("");
      } finally {
        setLoadingOfferId(false);
      }
    };
    fetchOfferId();
  }, [adCampaignId, token]);

  const resolveOfferIdForCampaign = async (campaignId: string) => {
    if (!token) return "";
    try {
      setLoadingOfferId(true);
      const resp = await axios.get(`https://panel.adsaro.com/advertiser/api/OfferNew/?version=4&token=${token}`);
      const rows = Object.values(resp.data?.response?.rows || {}) as Array<{
        id: number | string;
        ad_campaign_id: number | string;
      }>;
      const match = rows.find((r) => String(r.ad_campaign_id) === String(campaignId));
      return match?.id != null ? String(match.id) : "";
    } catch (e) {
      console.error("Failed to resolve offer id from OfferNew", e);
      return "";
    } finally {
      setLoadingOfferId(false);
    }
  };

  // Helpers to read image dimensions
  const handleMainImage = (file: File | null) => {
    setMainImageFile(file);
    if (file) {
      const img = new Image();
      img.onload = () => setMainImageSize({ w: img.width, h: img.height });
      img.src = URL.createObjectURL(file);
    } else {
      setMainImageSize(null);
    }
  };
  const handleIconImage = (file: File | null) => {
    setIconImageFile(file);
    if (file) {
      const img = new Image();
      img.onload = () => setIconImageSize({ w: img.width, h: img.height });
      img.src = URL.createObjectURL(file);
    } else {
      setIconImageSize(null);
    }
  };

  const onSubmit = async () => {
    if (submitting) return;
    if (!adCampaignId) {
      toast.error("Please select a campaign");
      return;
    }

    if (!campaignType) {
      toast.error("Please select a campaign type");
      return;
    }

    if (campaignType === "CPC") {
      if (!title || !desc || !destUrl) {
        toast.error("Please fill Campaign Title, Description and Destination URL");
        return;
      }
    }

    // if (campaignType && campaignType !== "CPC" && campaignType !== "DISPLAY" && campaignType !== "VIDEO") {
    if (campaignType === "PUSH" || campaignType === "NATIVE") {
      if (!mainImageFile || !mainImageSize) {
        toast.error("Please upload the Resource file");
        return;
      }
      if (!destUrl) {
        toast.error("Destination URL is required");
        return;
      }
      const derivedDisplay = display || deriveDomainFromUrl(destUrl);
      if (!derivedDisplay) {
        toast.error("Validation error: display=May not be empty");
        return;
      }
    }

    if (campaignType === "DISPLAY") {
      if (adType === "HTML") {
        if (!title || !desc || !display) {
          toast.error("Please fill Campaign Title, Description and Ad Domain");
          return;
        }
        if (!htmlText) {
          toast.error("HTML is required");
          return;
        }
        if (!isHtmlThirdParty && !destUrl) {
          toast.error("Destination URL is required (unless HTML contains 3rd-party JS/iFrame)");
          return;
        }
      } else {
        if (!mainImageFile || !mainImageSize) {
          toast.error("Please upload the Resource file");
          return;
        }
        if (!destUrl) {
          toast.error("Destination URL is required");
          return;
        }
        const derivedDisplay = display || deriveDomainFromUrl(destUrl);
        if (!derivedDisplay) {
          toast.error("Validation error: display=May not be empty");
          return;
        }
      }
    }

    if (campaignType === "VIDEO") {
      if (!videoFile) {
        toast.error("Please upload/select a video file");
        return;
      }
      if (!destUrl || !display) {
        toast.error("Destination URL and Ad Domain are required");
        return;
      }
    }

    try {
      setSubmitting(true);

      // Ensure we have offerId to target OfferNew/Ad/{offer_id}
      let effectiveOfferId = offerId;
      if (!effectiveOfferId) {
        effectiveOfferId = await resolveOfferIdForCampaign(adCampaignId);
        setOfferId(effectiveOfferId);
      }
      if (!effectiveOfferId) {
        toast.error("No offer found for selected campaign");
        return;
      }

      // Prepare base64 images if provided
      const images: Array<{ width: number; height: number; image: string }> = [];
      if (mainImageFile && mainImageSize) {
        const base64 = await fileToBase64(mainImageFile);
        // Using base64 as a fallback for image content; if server requires file_id, provide it here instead
        images.push({ width: mainImageSize.w, height: mainImageSize.h, image: base64 });
      }
      if (iconImageFile && iconImageSize) {
        const base64 = await fileToBase64(iconImageFile);
        images.push({ width: iconImageSize.w, height: iconImageSize.h, image: base64 });
      }

      // Build payload for OfferNew/Ad/{offer_id}
      const resolvedDisplay = display || deriveDomainFromUrl(destUrl);
      const resolvedHtmlText =
        campaignType === "CPC" && !htmlText
          ? `<a href="${destUrl}">${title}</a><div>${desc}</div>`
          : htmlText;
      const payload = {
        mode: "UPDATE",
        create: [
          {
            type: adType,
            title: title || selectedCampaign?.name || "",
            desc: desc || "",
            dest_url: destUrl || "",
            display: resolvedDisplay || "",
            position: [] as number[],
            bannersize_id: Number(bannerSizeId) || 12,
            target_window: "NEW",
            // If HTML, send html_text, otherwise send images
            ...(adType === "HTML" ? { html_text: resolvedHtmlText } : { images }),
          },
        ],
      };

      // Post to our proxy: /api/offernew/ad/[offerId]
      const res = await axios.post(`${offerNewEndpoint}/${effectiveOfferId}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data?.status === "OK") {
        toast.success("Creative added successfully");
        if (navigateOnSuccess) {
          router.push("/advertiser/creative");
        } else if (onSuccess) {
          onSuccess();
        }
        // reset
        setTitle("");
        setDesc("");
        setDestUrl("");
        setDisplay("");
        setCta("");
        setSponsored("");
        handleMainImage(null);
        handleIconImage(null);
        setVideoFile(null);
        setVideoMeta(null);
      } else {
        toast.error("Failed to add creative");
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } | string }; message?: string };
      console.error("Create creative error", err?.response ?? e);
      const serverMsg = (typeof err?.response?.data === "string" ? err.response.data : err?.response?.data?.message) || err?.message;
      toast.error(serverMsg || "Failed to add creative");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        {/* <CardTitle>Add Creative</CardTitle> */}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campaign Count */}
        <div className="text-sm text-muted-foreground">
          Total Campaigns: <span className="font-medium text-foreground">{campaignTotal}</span>
        </div>

        {/* Campaign Type */}
        <div className="grid gap-2">
          <Label>Campaign Type</Label>
          {/* <Select
            value={campaignType}
            onValueChange={(v) =>
              setCampaignType(
                v as "CPC" | "CPV" | "NATIVE" | "DISPLAY" | "PUSH" | "FLOATING_PUSH" | "CALENDAR_PUSH" | "VIDEO" | ""
              )
            }
          > */}

  <Select
            value={campaignType}
            onValueChange={(v) =>
              // setCampaignType(
              //   v as "CPC" | "CPV" | "NATIVE" | "DISPLAY" | "PUSH" | "FLOATING_PUSH" | "CALENDAR_PUSH" | "VIDEO" | ""
              // )
              setCampaignType(
  v as "CPC" | "NATIVE" | "DISPLAY" | "PUSH" | "VIDEO" | ""
)

            }
          >

            <SelectTrigger className="w-full">
              <SelectValue placeholder={loadingCampaigns ? "Loading..." : "Select campaign type"} />
            </SelectTrigger>
            <SelectContent>
              {campaignTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {campaignTypeLabel(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Campaign */}
        {campaignType ? (
          <div className="grid gap-2">
            <Label>Campaign</Label>
            <Select value={adCampaignId} onValueChange={setAdCampaignId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingCampaigns ? "Loading..." : "Select campaign"} />
              </SelectTrigger>
              <SelectContent>
                {filteredCampaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} (#{c.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {/* CPC */}
        {campaignType === "CPC" ? (
          <div className="space-y-6">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title" />
              {/* {macroHintContent.length > 0 ? (
                <div className="text-xs text-muted-foreground">
                  Macros:
                  <div className="mt-1 space-y-1">
                    {macroHintContent.map((m) => (
                      <div key={m}>{m}</div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <button
                      type="button"
                      className="underline"
                      onClick={() => setShowAllPopMacros((v) => !v)}
                    >
                      {showAllPopMacros ? "Hide" : "Show more"}
                    </button>
                  </div>
                </div>
              ) : null} */}
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Enter description" />
            </div>
            <div className="grid gap-2">
              <Label>Destination URL</Label>
              <Input value={destUrl} onChange={(e) => setDestUrl(e.target.value)} placeholder="https://example.com" />
            </div>
          </div>
        ) : null}

        {/* Generic Image types (CPV/NATIVE/PUSH/FLOATING_PUSH/CALENDAR_PUSH) */}
        {campaignType && campaignType !== "CPC" && campaignType !== "DISPLAY" && campaignType !== "VIDEO" ? (
          <div className="space-y-6">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Input value={campaignType} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Resource file</Label>
              <Input type="file" accept="image/*" onChange={(e) => handleMainImage(e.target.files?.[0] || null)} />
              {mainImageSize && <div className="text-xs text-muted-foreground">{mainImageSize.w}x{mainImageSize.h}</div>}
            </div>
            <div className="grid gap-2">
              <Label>Banner Size</Label>
              <Select value={bannerSizeId} onValueChange={setBannerSizeId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an option here" />
                </SelectTrigger>
                <SelectContent>
                  <div
                    className="p-2"
                    onKeyDownCapture={(e) => e.stopPropagation()}
                    onPointerDownCapture={(e) => e.stopPropagation()}
                  >
                    <Input
                      value={bannerSearch}
                      onChange={(e) => setBannerSearch(e.target.value)}
                      placeholder="Search size (e.g. 300x250)"
                    />
                  </div>
                  {filteredBannerSizeOptions.length > 0 ? (
                    filteredBannerSizeOptions.map((b) => (
                      <SelectItem key={String(b.id)} value={String(b.id)}>
                        {b.width}x{b.height}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__loading" disabled>
                      {bannerSizeOptions.length > 0 ? "No matches" : "Loading..."}
                    </SelectItem>
                  )}
                  <SelectItem value="12">Default</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Destination URL</Label>
              <Input value={destUrl} onChange={(e) => setDestUrl(e.target.value)} placeholder="https://example.com" />
              {macrosForCampaignType.length > 0 ? (
                <div className="text-xs text-muted-foreground">
                  Macros:
                  <div className="mt-1 space-y-1">
                    {macrosForCampaignType.map((m) => (
                      <div key={m}>{m}</div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* DISPLAY */}
        {campaignType === "DISPLAY" ? (
          <div className="space-y-6">
            <div className="grid gap-2">
              <Label>Creative Type</Label>
              <Select value={adType} onValueChange={(v) => setAdType(v as "IMAGE" | "HTML")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select creative type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMAGE">Image</SelectItem>
                  <SelectItem value="HTML">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {adType === "HTML" ? (
              <>
                <div className="grid gap-2">
                  <Label>Campaign Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter campaign title" />
                  {macrosForCampaignType.length > 0 ? (
                    <div className="text-xs text-muted-foreground">
                      Macros:
                      <div className="mt-1 space-y-1">
                        {macrosForCampaignType.map((m) => (
                          <div key={m}>{m}</div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Enter description" />
                  {macrosForCampaignType.length > 0 ? (
                    <div className="text-xs text-muted-foreground">
                      Macros:
                      <div className="mt-1 space-y-1">
                        {macrosForCampaignType.map((m) => (
                          <div key={m}>{m}</div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label>Destination URL</Label>
                  <Input
                    value={destUrl}
                    disabled={isHtmlThirdParty}
                    onChange={(e) => setDestUrl(e.target.value)}
                    placeholder={isHtmlThirdParty ? "Disabled (3rd-party JS/iFrame detected)" : "https://example.com"}
                  />
                  {macrosForCampaignType.length > 0 ? (
                    <div className="text-xs text-muted-foreground">
                      Macros:
                      <div className="mt-1 space-y-1">
                        {macrosForCampaignType.map((m) => (
                          <div key={m}>{m}</div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label>Ad Domain</Label>
                  <Input value={display} onChange={(e) => setDisplay(e.target.value)} placeholder="example.com" />
                  {macrosForCampaignType.length > 0 ? (
                    <div className="text-xs text-muted-foreground">
                      Macros:
                      <div className="mt-1 space-y-1">
                        {macrosForCampaignType.map((m) => (
                          <div key={m}>{m}</div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label>HTML</Label>
                  <Textarea placeholder="<div>...</div>" value={htmlText} onChange={(e) => setHtmlText(e.target.value)} />
                  {macrosForCampaignType.length > 0 ? (
                    <div className="text-xs text-muted-foreground">
                      Macros:
                      <div className="mt-1 space-y-1">
                        {macrosForCampaignType.map((m) => (
                          <div key={m}>{m}</div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label>Banner Size</Label>
                  <Select value={bannerSizeId} onValueChange={setBannerSizeId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select banner size" />
                    </SelectTrigger>
                    <SelectContent>
                      <div
                        className="p-2"
                        onKeyDownCapture={(e) => e.stopPropagation()}
                        onPointerDownCapture={(e) => e.stopPropagation()}
                      >
                        <Input
                          value={bannerSearch}
                          onChange={(e) => setBannerSearch(e.target.value)}
                          placeholder="Search size (e.g. 300x250)"
                        />
                      </div>
                      {filteredBannerSizeOptions.length > 0 ? (
                        filteredBannerSizeOptions.map((b) => (
                          <SelectItem key={String(b.id)} value={String(b.id)}>
                            {b.width}x{b.height}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__loading" disabled>
                          {bannerSizeOptions.length > 0 ? "No matches" : "Loading..."}
                        </SelectItem>
                      )}
                      <SelectItem value="12">Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label>Resource file</Label>
                  <Input type="file" accept="image/*" onChange={(e) => handleMainImage(e.target.files?.[0] || null)} />
                  {mainImageSize && <div className="text-xs text-muted-foreground">{mainImageSize.w}x{mainImageSize.h}</div>}
                </div>
                <div className="grid gap-2">
                  <Label>Banner Size</Label>
                  <Select value={bannerSizeId} onValueChange={setBannerSizeId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an option here" />
                    </SelectTrigger>
                    <SelectContent>
                      <div
                        className="p-2"
                        onKeyDownCapture={(e) => e.stopPropagation()}
                        onPointerDownCapture={(e) => e.stopPropagation()}
                      >
                        <Input
                          value={bannerSearch}
                          onChange={(e) => setBannerSearch(e.target.value)}
                          placeholder="Search size (e.g. 300x250)"
                        />
                      </div>
                      {filteredBannerSizeOptions.length > 0 ? (
                        filteredBannerSizeOptions.map((b) => (
                          <SelectItem key={String(b.id)} value={String(b.id)}>
                            {b.width}x{b.height}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__loading" disabled>
                          {bannerSizeOptions.length > 0 ? "No matches" : "Loading..."}
                        </SelectItem>
                      )}
                      <SelectItem value="12">Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Destination URL</Label>
                  <Input value={destUrl} onChange={(e) => setDestUrl(e.target.value)} placeholder="https://example.com" />
                  {/* {macrosForCampaignType.length > 0 ? (
                    <div className="text-xs text-muted-foreground">
                      Macros:
                      <div className="mt-1 space-y-1">
                        {macrosForCampaignType.map((m) => (
                          <div key={m}>{m}</div>
                        ))}
                      </div>
                    </div>
                  ) : null} */}
                </div>
              </>
            )}
          </div>
        ) : null}

        {/* VIDEO */}
        {campaignType === "VIDEO" ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Video Upload / Select</Label>
              <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Width"
                  type="number"
                  onChange={(e) =>
                    setVideoMeta({ ...(videoMeta || { w: 0, h: 0, bitrate: 0, duration: 0 }), w: Number(e.target.value) })
                  }
                />
                <Input
                  placeholder="Height"
                  type="number"
                  onChange={(e) =>
                    setVideoMeta({ ...(videoMeta || { w: 0, h: 0, bitrate: 0, duration: 0 }), h: Number(e.target.value) })
                  }
                />
                <Input
                  placeholder="Bitrate"
                  type="number"
                  onChange={(e) =>
                    setVideoMeta({ ...(videoMeta || { w: 0, h: 0, bitrate: 0, duration: 0 }), bitrate: Number(e.target.value) })
                  }
                />
                <Input
                  placeholder="Duration (sec)"
                  type="number"
                  onChange={(e) =>
                    setVideoMeta({
                      ...(videoMeta || { w: 0, h: 0, bitrate: 0, duration: 0 }),
                      duration: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Destination URL</Label>
              <Input value={destUrl} onChange={(e) => setDestUrl(e.target.value)} placeholder="https://example.com" />
              {macrosForCampaignType.length > 0 ? (
                <div className="text-xs text-muted-foreground">
                  Supported macros:
                  <div className="mt-1 space-y-1">
                    {macrosForCampaignType.map((m) => (
                      <div key={m}>{m}</div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label>Ad Domain</Label>
              <Input value={display} onChange={(e) => setDisplay(e.target.value)} placeholder="example.com" />
              {macrosForCampaignType.length > 0 ? (
                <div className="text-xs text-muted-foreground">
                  Supported macros:
                  <div className="mt-1 space-y-1">
                    {macrosForCampaignType.map((m) => (
                      <div key={m}>{m}</div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button onClick={onSubmit} disabled={submitting || loadingOfferId}>
            {loadingOfferId ? "Resolving " : submitting ? "Creating..." : "Create Creative"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
