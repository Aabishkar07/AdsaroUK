"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/context";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";

interface OfferAdItem {
  id: number;
  headline?: string;
  dest_url?: string;
  display_url?: string;
  is_active?: boolean;
  type?: string;
  desc?: string;
  cta?: string;
  sponsored?: string;
  bannersize_id?: number;
  html_text?: string;
}

interface BannerSize {
  id: number | string;
  width: number;
  height: number;
}

export default function EditCreativeForm() {
  const { token } = useAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [destUrl, setDestUrl] = useState("");
  const [display, setDisplay] = useState("");
  const [desc, setDesc] = useState("");
  const [cta, setCta] = useState("");
  const [sponsored, setSponsored] = useState("");
  const [enabled, setEnabled] = useState(true);

  // new: creative type, html text, banner size
  const [adType, setAdType] = useState<"IMAGE" | "HTML">("IMAGE");
  const [htmlText, setHtmlText] = useState<string>("");
  const [bannerSizeId, setBannerSizeId] = useState<string>("");

  const [bannerList, setBannerList] = useState<BannerSize[]>([]);
  const [bannerSearch, setBannerSearch] = useState<string>("");

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

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImageSize, setMainImageSize] = useState<{ w: number; h: number } | null>(null);
  const [iconImageFile, setIconImageFile] = useState<File | null>(null);
  const [iconImageSize, setIconImageSize] = useState<{ w: number; h: number } | null>(null);

  const endpointBase = useMemo(() => `/api/offerad/${id}`, [id]);

  // helpers for images
  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

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
    if (!token) {
      toast.error("Missing token");
      return;
    }
    try {
      setSaving(true);
      // Prepare optional images array if provided (assuming API supports it; harmless if ignored)
      const images: Array<{ width: number; height: number; image: string }> = [];
      if (mainImageFile && mainImageSize) {
        const base64 = await fileToBase64(mainImageFile);
        images.push({ width: mainImageSize.w, height: mainImageSize.h, image: base64 });
      }
      if (iconImageFile && iconImageSize) {
        const base64 = await fileToBase64(iconImageFile);
        images.push({ width: iconImageSize.w, height: iconImageSize.h, image: base64 });
      }
      // For OfferAd/{id} updates, the API expects direct fields (no mode wrapper)
      const payload = {
        id: Number(id),
        headline: title,
        dest_url: destUrl,
        display_url: display,
        desc: desc,
        cta,
        sponsored,
        type: adType,
        bannersize_id: Number(bannerSizeId) || 12,
        ...(adType === "HTML" ? { html_text: htmlText } : { images }),
        is_active: enabled,
      };

      const res = await axios.post(`${endpointBase}?version=4&token=${token}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data?.status === "OK") {
        toast.success("Creative updated successfully");
        router.push("/advertiser/creative");
      } else {
        const serverMsg = res?.data?.message || "Update failed";
        toast.error(serverMsg);
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } | string }; message?: string };
      console.error("Update creative error", err?.response ?? e);
      const serverMsg = (typeof err?.response?.data === "string" ? err.response.data : err?.response?.data?.message) || err?.message;
      toast.error(serverMsg || "Failed to update creative");
    } finally {
      setSaving(false);
    }
  };

  const fetchExisting = async () => {
    if (!token || !id) return;
    try {
      setLoading(true);
      const resp = await axios.get(`${endpointBase}?version=4&token=${token}`);
      const rows = Object.values(resp.data?.response?.rows || {}) as OfferAdItem[];
      // Some endpoints return an object for a single item, fallback
      const item: OfferAdItem | undefined = rows?.[0] ?? (resp.data?.response as OfferAdItem | undefined);

      if (item) {
        setTitle(item.headline || "");
        setDestUrl(item.dest_url || "");
        setDisplay(item.display_url || "");
        setDesc(item.desc || "");
        setCta(item.cta || "");
        setSponsored(item.sponsored || "");
        setEnabled(Boolean(item.is_active));
        setAdType(item.type === "HTML" ? "HTML" : "IMAGE");
        setHtmlText(item.html_text || "");
        if (item.bannersize_id) setBannerSizeId(String(item.bannersize_id));
      }
    } catch (e) {
      console.error("Failed to load creative", e);
      toast.error("Failed to load creative data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExisting();
  }, [token, id, endpointBase]);

  useEffect(() => {
    loadBannerSize();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Creative #{id}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Type */}
        <div className="grid gap-2">
          <Label>Type</Label>
          <Select value={adType} onValueChange={(v: string) => setAdType(v as "IMAGE" | "HTML")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IMAGE">Image</SelectItem>
              <SelectItem value="HTML">HTML</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" disabled={loading} />
        </div>

        <div className="grid gap-2">
          <Label>Destination URL</Label>
          <Input value={destUrl} onChange={(e) => setDestUrl(e.target.value)} placeholder="https://example.com" disabled={loading} />
        </div>

        <div className="grid gap-2">
          <Label>Ad domain</Label>
          <Input value={display} onChange={(e) => setDisplay(e.target.value)} placeholder="example.com" disabled={loading} />
        </div>

        <div className="grid gap-2">
          <Label>Description</Label>
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" />
        </div>

        <div className="grid gap-2">
          <Label>Call to Action</Label>
          <Input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Learn more" />
        </div>

        <div className="grid gap-2">
          <Label>Sponsored by/Advertiser Name</Label>
          <Input value={sponsored} onChange={(e) => setSponsored(e.target.value)} placeholder="Company Name" />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="enabled" checked={enabled} onCheckedChange={(v) => setEnabled(Boolean(v))} />
          <Label htmlFor="enabled">Enabled</Label>
        </div>

        {/* Conditional fields based on type */}
        {adType === "HTML" ? (
          <div className="grid gap-2">
            <Label>Html text</Label>
            <Textarea placeholder="<h1>Example</h1>" value={htmlText} onChange={(e) => setHtmlText(e.target.value)} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Resource file</Label>
              <Input type="file" accept="image/*" onChange={(e) => handleMainImage(e.target.files?.[0] || null)} />
              {mainImageSize && (
                <div className="text-xs text-muted-foreground">{mainImageSize.w}x{mainImageSize.h}</div>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Upload Icon Image</Label>
              <Input type="file" accept="image/*" onChange={(e) => handleIconImage(e.target.files?.[0] || null)} />
              {iconImageSize && (
                <div className="text-xs text-muted-foreground">{iconImageSize.w}x{iconImageSize.h}</div>
              )}
            </div>
          </div>
        )}

        {/* Banner size - shown for all */}
        <div className="grid gap-2">
          <Label>Banner size</Label>
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

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.back()} disabled={saving}>Cancel</Button>
          <Button onClick={onSubmit} disabled={saving || loading}>{saving ? "Saving..." : "Save Changes"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
