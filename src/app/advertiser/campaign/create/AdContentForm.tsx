"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "@/context/context";
import axios from "axios";

// Interface for form data
interface AdContentFormData {
  title: string;
  display?: string;
  dest_url?: string;
  description?: string;
  call_to_action?: string;
  destination_url?: string;
  sponsor_name?: string;
  icon_image?: FileList;
  main_image?: FileList;
  video?: FileList;
  banner_size?: string;
  banner_type?: string;
  html_text?: string;
  ad_domain?: string;
  type: string | null;
}

// Interface for saved ad content that matches campaign page format
// Matches the adCreateLite structure from campaign create page
type MediaImage = {
  width: number;
  height: number;
  type: "MAIN" | "ICON" | string;
  image: string;
};

type MediaVideo = {
  width?: number;
  height?: number;
  bitrate?: number;
  duration?: number;
  type?: "MP4" | "AVI" | "WEBM" | "QUICKTIME" | "MPEG";
  video?: string;
  filename?: string;
};

interface SavedAdContent {
  title: string;
  desc: string | null;
  display: string | null;
  dest_url: string | null;
  // call_to_action: string | null;
  sponsored: string | null;
  enabled: boolean;
  type: string | null;
  target_window: string;
  bannersize_id: number | null;
  html_text: string | null;
  // images: Array<{
  //   width: number;
  //   height: number;
  //   type: string;
  //   image: string;
  //   filename: string;
  // }>;
  images: MediaImage[];
  videos: MediaVideo[];
  // Additional fields that might be needed
  ad_domain?: string;
  destination_url?: string;
  cta?: string;
  // sponsor_name?: string;
  banner_type?: string;
  banner_size?: string;
  // description?: string;
}
interface BannerSize {
  id: number;
  width: number;
  height: number;
}
interface AdContentFormProps {
  autoOpen?: boolean;
  campaignType: string;
  onSave?: (
    data: SavedAdContent[] | SavedAdContent,
    meta?: { action: "save" | "delete" }
  ) => void; // Optional callback for when content is saved to localStorage
}

export function AdContentForm({
  autoOpen = false,
  campaignType,
  onSave,
}: AdContentFormProps) {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [savedContents, setSavedContents] = useState<SavedAdContent[]>([]);
  const [allImages, setAllImages] = useState<
    Array<{
      width: number;
      height: number;
      type: "MAIN" | "ICON";
      image: string;
    }>
  >([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [iconImagePreview, setIconImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [mainImageUploading, setMainImageUploading] = useState(false);
  const [iconImageUploading, setIconImageUploading] = useState(false);
  const [mainImageUploadDone, setMainImageUploadDone] = useState(false);
  const [iconImageUploadDone, setIconImageUploadDone] = useState(false);

  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadDone, setVideoUploadDone] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoMeta, setVideoMeta] = useState<MediaVideo[]>([]);

  const mainUploadDoneTimeoutRef = useRef<number | null>(null);
  const iconUploadDoneTimeoutRef = useRef<number | null>(null);
  const videoUploadDoneTimeoutRef = useRef<number | null>(null);

  const [bannerList, setBannerList] = useState<BannerSize[]>([]);
  const [bannerSearch, setBannerSearch] = useState("");
  const [mainImageMeta, setMainImageMeta] = useState<
    Array<{
      image: string;
      type: "MAIN" | "ICON";
      width: number;
      height: number;
    }>
  >([]);
  const [iconImageMeta, setIconImageMeta] = useState<
    Array<{
      image: string;
      type: "MAIN" | "ICON";
      width: number;
      height: number;
    }>
  >([]);
  
  // Native ads only banner sizes
  const nativeBannerSizes = [
    "20x20", "50x26", "50x50", "75x75", "76x76", "80x80", "96x96", "100x70",
    "120x90", "125x125", "128x128", "130x68", "150x100", "150x150", "160x600",
    "170x90", "192x192", "193x53", "200x104", "200x200", "240x240", "250x150",
    "250x250", "256x256", "300x100", "300x140", "300x158", "300x200", "300x250",
    "300x300", "300x600", "320x50", "320x140", "320x480", "328x328", "344x194",
    "350x350", "360x180", "360x240", "368x184", "400x200", "400x209", "400x250",
    "400x300", "400x400", "420x150", "480x320", "492x328", "500x250", "540x300",
    "580x60", "600x314", "600x337", "600x400", "620x410", "640x360", "650x50",
    "660x346", "720x480", "728x90", "728x180", "990x505", "1000x600", "1080x1920",
    "1200x627", "1200x628", "1200x672", "1280x720"
  ];
  
  const normalized = (s: string) =>
    s.toLowerCase().replace(/[×x]/g, "x").replace(/\s+/g, "");
  
  const filteredBanners = useMemo(() => {
    // For NATIVE ads, filter to only show native-compatible sizes
    let filteredList = bannerList;
    if (campaignType === "NATIVE") {
      filteredList = bannerList.filter((b) => {
        const sizeStr = `${b.width}x${b.height}`;
        return nativeBannerSizes.includes(sizeStr);
      });
      console.log('🎨 Native ads: Filtered to', filteredList.length, 'native-compatible sizes');
    }
    
    // Apply search filter
    const q = normalized(bannerSearch);
    if (!q) return filteredList;
    return filteredList.filter((b) =>
      `${b.width}x${b.height}`.toLowerCase().includes(q)
    );
  }, [bannerSearch, bannerList, campaignType, nativeBannerSizes]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AdContentFormData>();

  useEffect(() => {
    return () => {
      if (mainUploadDoneTimeoutRef.current != null) {
        window.clearTimeout(mainUploadDoneTimeoutRef.current);
        mainUploadDoneTimeoutRef.current = null;
      }
      if (iconUploadDoneTimeoutRef.current != null) {
        window.clearTimeout(iconUploadDoneTimeoutRef.current);
        iconUploadDoneTimeoutRef.current = null;
      }
      if (videoUploadDoneTimeoutRef.current != null) {
        window.clearTimeout(videoUploadDoneTimeoutRef.current);
        videoUploadDoneTimeoutRef.current = null;
      }
    };
  }, []);

  const loadBannerSize = async () => {
    try {
      const baseUrl = `https://panel.adsaro.com/admin/api/CpmBannerSize/?version=5&userToken=l95U5k9sQhhlLEal`;
      const limit = 100;
      let start = 0;
      let allRows: BannerSize[] = [];
      let keepGoing = true;

      while (keepGoing) {
        const url = `${baseUrl}&range=${start}-${start + limit - 1}`;
        const response = await axios.get(url);
        const rows = response.data?.response?.rows;

        // convert object → array
        const bannerArray = rows ? (Object.values(rows) as BannerSize[]) : [];

        if (bannerArray.length === 0) {
          keepGoing = false; // no more data
          break;
        }

        allRows = [...allRows, ...bannerArray];

        start += limit; // next range
      }

      console.log("allRows", allRows);
      const unique = Array.from(
        new Map(allRows.map((b) => [String(b.id), b])).values()
      );
      setBannerList(unique);
    } catch (error) {
      console.error("Failed to load Banner:", error);
    }
  };

  // Load saved contents when component mounts or campaign type changes
  const loadSavedContents = useCallback(() => {
    // Clear form when loading new contents
    reset();
    const saved = localStorage.getItem(`adContents_${campaignType}`);
    if (!saved) {
      setSavedContents([]);
      return;
    }
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setSavedContents(parsed as SavedAdContent[]);
      } else {
        setSavedContents([]);
      }
    } catch {
      setSavedContents([]);
    }
  }, [campaignType, reset]);

  useEffect(() => {
    loadSavedContents();
  }, [loadSavedContents]);

  useEffect(() => {
    loadBannerSize();
  }, []);

  // React to autoOpen changes (e.g., when entering the page/step)
  useEffect(() => {
    if (autoOpen) {
      reset();
      setEditingIndex(null);
      setMainImagePreview(null);
      setIconImagePreview(null);
      setMainImageMeta([]);
      setIconImageMeta([]);
      setAllImages([]);
      if (videoPreviewUrl) {
        try {
          URL.revokeObjectURL(videoPreviewUrl);
        } catch {}
      }
      setVideoPreviewUrl(null);
      setVideoMeta([]);
      setVideoUploading(false);
      setVideoUploadDone(false);
      setVideoError(null);
      setIsOpen(true);
    }
  }, [autoOpen, campaignType]);

  const auth = useAuth();
  const mytoken = auth?.token;

  // Helper to upload a file and return File ID (UploadValue)
  const uploadFileAndGetId = async (file: File): Promise<string[]> => {
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/files", {
        method: "POST",
        body: form,
        // Do NOT set Content-Type for multipart; browser will set boundary
        headers: mytoken ? { Authorization: `Bearer ${mytoken}` } : undefined,
      });
      // Some services return plain text ID, others JSON
      const text = await res.text();
      console.log("iummmggggggggggggggggggg", text);
      // Try JSON first (handle multiple possible shapes)

      try {
        const json = JSON.parse(text);
        const created =
          json?.response?.created ??
          json?.created ??
          json?.id ??
          json?.file_id ??
          json?.result ??
          json?.data;
        type UploadIdShape =
          | {
              id?: string | number;
              file_id?: string | number;
              result?: string | number;
              data?: string | number;
            }
          | string
          | number
          | null
          | undefined;

        const extractId = (x: UploadIdShape): string => {
          if (x == null) return "";
          if (typeof x === "string" || typeof x === "number") return String(x);
          const val = x.id ?? x.file_id ?? x.result ?? x.data;
          return val != null ? String(val) : "";
        };

        let ids: string[] = [];
        if (Array.isArray(created)) {
          ids = (created as UploadIdShape[])
            .map((c) => extractId(c))
            .filter((s) => s && s.length > 0);
        } else if (created != null) {
          const single = extractId(created as UploadIdShape);
          if (single && single.length > 0) ids = [single];
        }
        console.log("imagesssssssssids", ids);

        if (ids.length > 0) {
          return ids;
        }
      } catch (e) {
        console.error("Upload failed", e);
        // not JSON, fallback to plain text
      }
      if (text && text.trim().length > 0) {
        const id = text.trim();
        return [id];
      }
      throw new Error("Invalid upload response");
    } catch (e) {
      console.error("Upload failed", e);
      throw e;
    }
  };

  // Helper to read file as data URL
  // const readFileAsDataURL = (file: File): Promise<string> => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = () => resolve(reader.result as string);
  //     reader.onerror = reject;
  //     reader.readAsDataURL(file);
  //   });
  // };

  // Helper to get image dimensions
  const getImageDimensions = (
    file: File
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src); // Clean up
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(img.src); // Clean up on error too
        reject(err);
      };
      img.src = URL.createObjectURL(file);
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

  // Helper to get video metadata
  const getVideoMetadata = (
    file: File
  ): Promise<{ width: number; height: number; duration: number }> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        const width = Number(video.videoWidth || 0);
        const height = Number(video.videoHeight || 0);
        const duration = Number(video.duration || 0);
        try {
          URL.revokeObjectURL(url);
        } catch {}
        resolve({ width, height, duration });
      };
      video.onerror = (e) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
        reject(e);
      };
      video.src = url;
    });
  };

  // Normalize base64 string
  const normalizeBase64 = (input: string) => {
    if (!input) return input;
    let s = input.replace(/\s+/g, "");
    if (s.startsWith('"') && s.endsWith('"')) {
      s = s.slice(1, -1);
    }
    const mod = s.length % 4;
    if (mod > 0) {
      s += "=".repeat(4 - mod);
    }
    return s;
  };

  // Handle image preview and validation
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "MAIN" | "ICON"
  ) => {
    setImageError(null);
    const file = e.target.files?.[0];

    if (!file) return;

    const start = Date.now();
    const minDelayMs = campaignType === "DISPLAY" ? 7000 : 3000;
    if (type === "MAIN") {
      setMainImageUploading(true);
      setMainImageUploadDone(false);
    } else {
      setIconImageUploading(true);
      setIconImageUploadDone(false);
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setImageError(
        "Please upload a valid image file (JPEG, PNG, GIF, or WebP)"
      );
      return;
    }

    // Validate file size (max 1MB per backend API validation)
    const maxSize = 1024 * 1024; // 1MB (1024KB)
    if (file.size > maxSize) {
      setImageError(`Image size must be less than or equal to 1024KB. Current size: ${(file.size / 1024).toFixed(1)}KB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "MAIN") {
        setMainImagePreview(reader.result as string);
      } else {
        setIconImagePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);

    try {
      const dimensions = await getImageDimensions(file);
      const fileIds = await uploadFileAndGetId(file);

      const base64 = await fileToBase64(file);
      const rawBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
      const imageBase64 = normalizeBase64(rawBase64);

      const newEntries = (fileIds || []).map((fid) => {
        const parsed = JSON.parse(fid);
        void parsed;
        // Use chosen banner size width and height for MAIN images instead of actual image dimensions
        let bannerWidth = dimensions.width;
        let bannerHeight = dimensions.height;
        if (type === "MAIN") {
          const selectedBannerId = watch("banner_size");
          if (selectedBannerId) {
            const selectedBanner = bannerList.find((b) => b.id === Number(selectedBannerId));
            if (selectedBanner) {
              bannerWidth = selectedBanner.width;
              bannerHeight = selectedBanner.height;
            }
          }
        }
        // const imageJson = JSON.stringify({ image: encoded });
        return {
          width: bannerWidth,
          height: bannerHeight,
          type,
          image: imageBase64,
        };
      });
      // Update per-type meta arrays (replace for this type)
      if (type === "MAIN") {
        console.log("mainnnnnewEntries", newEntries);
        setMainImageMeta(newEntries);
      } else {
        setIconImageMeta(newEntries);
      }
      // Update combined collection used for payload (replace entries of this type)
      const combinedImages = (() => {
        const filtered = allImages.filter((img) => img.type !== type);
        return [...filtered, ...newEntries];
      })();
      setAllImages(combinedImages);

      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minDelayMs - elapsed);
      await new Promise((r) => window.setTimeout(r, remaining));

      // Persist to localStorage only after the loader delay finishes
      try {
        if (type === "MAIN") {
          localStorage.setItem(
            `mainImageMeta_${campaignType}`,
            JSON.stringify(newEntries)
          );
        } else {
          localStorage.setItem(
            `iconImageMeta_${campaignType}`,
            JSON.stringify(newEntries)
          );
        }
      } catch {
        console.log("Failed to save image meta to localStorage");
      }

      try {
        localStorage.setItem(
          `images_${campaignType}`,
          JSON.stringify(combinedImages)
        );
      } catch (e) {
        console.log(
          "😶‍🌫️😶‍🌫️😶‍🌫️😶‍🌫️😶‍🌫️😶‍🌫️😶‍🌫️Failed to save images to localStorage",
          e
        );
      }

      if (type === "MAIN") {
        setMainImageUploading(false);
        setMainImageUploadDone(true);

        if (mainUploadDoneTimeoutRef.current != null) {
          window.clearTimeout(mainUploadDoneTimeoutRef.current);
        }
        mainUploadDoneTimeoutRef.current = window.setTimeout(() => {
          setMainImageUploadDone(false);
          mainUploadDoneTimeoutRef.current = null;
        }, 3000);
      } else {
        setIconImageUploading(false);
        setIconImageUploadDone(true);

        if (iconUploadDoneTimeoutRef.current != null) {
          window.clearTimeout(iconUploadDoneTimeoutRef.current);
        }
        iconUploadDoneTimeoutRef.current = window.setTimeout(() => {
          setIconImageUploadDone(false);
          iconUploadDoneTimeoutRef.current = null;
        }, 3000);
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
      setImageError(
        "Failed to upload image. Please try again or use a smaller file."
      );

      if (type === "MAIN") {
        setMainImageUploading(false);
        setMainImageUploadDone(false);
      } else {
        setIconImageUploading(false);
        setIconImageUploadDone(false);
      }
    }
  };

  const clearImage = (type: "MAIN" | "ICON") => {
    if (type === "MAIN") {
      setMainImagePreview(null);
      setMainImageMeta([]);
      setMainImageUploading(false);
      setMainImageUploadDone(false);
      if (mainUploadDoneTimeoutRef.current != null) {
        window.clearTimeout(mainUploadDoneTimeoutRef.current);
        mainUploadDoneTimeoutRef.current = null;
      }
      // Reset the file input
      const mainImageInput = document.getElementById(
        "main_image"
      ) as HTMLInputElement;
      if (mainImageInput) mainImageInput.value = "";
    } else {
      setIconImagePreview(null);
      setIconImageMeta([]);
      setIconImageUploading(false);
      setIconImageUploadDone(false);
      if (iconUploadDoneTimeoutRef.current != null) {
        window.clearTimeout(iconUploadDoneTimeoutRef.current);
        iconUploadDoneTimeoutRef.current = null;
      }
      // Reset the file input
      const iconImageInput = document.getElementById("icon_image") as HTMLInputElement;
      if (iconImageInput) iconImageInput.value = "";
    }
  };

  const clearVideo = (opts?: { preserveStorage?: boolean }) => {
    if (videoPreviewUrl) {
      try {
        URL.revokeObjectURL(videoPreviewUrl);
      } catch {}
    }

    setVideoPreviewUrl(null);
    setVideoMeta([]);
    setVideoUploading(false);
    setVideoUploadDone(false);
    setVideoError(null);
    if (videoUploadDoneTimeoutRef.current != null) {
      window.clearTimeout(videoUploadDoneTimeoutRef.current);
      videoUploadDoneTimeoutRef.current = null;
    }
    if (!opts?.preserveStorage) {
      try {
        localStorage.removeItem(`videos_${campaignType}`);
      } catch {}
    }

    const input = document.getElementById("video") as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const start = Date.now();
    const minDelayMs = 3000;

    setVideoUploading(true);
    setVideoUploadDone(false);

    if (videoPreviewUrl) {
      try {
        URL.revokeObjectURL(videoPreviewUrl);
      } catch {}
    }
    setVideoPreviewUrl(URL.createObjectURL(file));

    const validVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
    if (!validVideoTypes.includes(file.type)) {
      setVideoError("Please upload a valid video file (MP4, WebM, or OGG)");
      setVideoUploading(false);
      return;
    }

    const maxSize = 64 * 1024 * 1024;
    if (file.size > maxSize) {
      setVideoError("Video size should be less than 64MB");
      setVideoUploading(false);
      return;
    }

    try {
      const { width, height, duration } = await getVideoMetadata(file);
      const fileIds = await uploadFileAndGetId(file);

      const extRaw = file.name.split(".").pop()?.toUpperCase() || "MP4";
      const extMap = (ext: string): MediaVideo["type"] => {
        if (["MP4", "AVI", "WEBM", "MPEG", "QUICKTIME"].includes(ext))
          return ext as MediaVideo["type"];
        if (ext === "MOV") return "QUICKTIME";
        if (ext === "MPG") return "MPEG";
        return "MP4";
      };
      const type = extMap(extRaw);

      const newVideos: MediaVideo[] = (fileIds || [])
        .map((fid) => {
          const id = typeof fid === "string" ? fid : String(fid);
          return {
            width,
            height,
            bitrate: 0,
            duration: Math.round(duration),
            type,
            filename: file.name,
            video: id,
          };
        })
        .filter((v) => Boolean(v.video));

      setVideoMeta(newVideos);

      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minDelayMs - elapsed);
      await new Promise((r) => window.setTimeout(r, remaining));

      try {
        localStorage.setItem(`videos_${campaignType}`, JSON.stringify(newVideos));
      } catch {}

      setVideoUploading(false);
      setVideoUploadDone(true);

      if (videoUploadDoneTimeoutRef.current != null) {
        window.clearTimeout(videoUploadDoneTimeoutRef.current);
      }
      videoUploadDoneTimeoutRef.current = window.setTimeout(() => {
        setVideoUploadDone(false);
        videoUploadDoneTimeoutRef.current = null;
      }, 3000);
    } catch (err) {
      console.error("Failed to upload video:", err);
      setVideoError("Failed to upload video. Please try again.");
      setVideoUploading(false);
      setVideoUploadDone(false);
    }
  };

  const buildImages = async () => {
    if (allImages && allImages.length > 0) return allImages;
    const combined: Array<{
      width: number;
      height: number;
      type: "MAIN" | "ICON";
      image: string;
    }> = [];
    if (Array.isArray(mainImageMeta) && mainImageMeta.length > 0)
      combined.push(...mainImageMeta);
    if (Array.isArray(iconImageMeta) && iconImageMeta.length > 0)
      combined.push(...iconImageMeta);
    return combined;
  };

  const onSubmit = async (data: AdContentFormData) => {
    try {
      const imagesFinal = await buildImages();
      const seen = new Set<string>();
      const imagesFinalDedup = (imagesFinal || []).filter((img) => {
        const key = `${img.type}:${img.image}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      let adType = campaignType.toUpperCase();
      if (campaignType === "DISPLAY" && data.banner_type) {
        adType = data.banner_type;
      }

      const resolveBannerSizeId = (): number | null => {
        if (data.banner_size) return Number(data.banner_size);
        if (campaignType !== "VIDEO") return null;
        const v =
          Array.isArray(videoMeta) && videoMeta.length > 0 ? videoMeta[0] : undefined;
        const vw = typeof v?.width === "number" ? v.width : undefined;
        const vh = typeof v?.height === "number" ? v.height : undefined;
        if (vw != null && vh != null && Array.isArray(bannerList) && bannerList.length > 0) {
          const match = bannerList.find((b) => b.width === vw && b.height === vh);
          if (match) return match.id;
        }
        if (Array.isArray(bannerList) && bannerList.length > 0) return bannerList[0].id;
        return 1;
      };

      const fallbackVideos = (() => {
        if (campaignType !== "VIDEO") return [] as MediaVideo[];
        if (Array.isArray(videoMeta) && videoMeta.length > 0) return videoMeta;
        try {
          const raw = localStorage.getItem(`videos_${campaignType}`);
          const parsed = raw ? JSON.parse(raw) : [];
          return Array.isArray(parsed) ? (parsed as MediaVideo[]) : [];
        } catch {
          return [] as MediaVideo[];
        }
      })();

      const newAdContent: SavedAdContent = {
        title: data.title || adType,
        desc: data.description || null,
        display: data.ad_domain || null,
        dest_url: data.dest_url || null,
        sponsored: data.sponsor_name || null,
        enabled: true,
        type: campaignType === "VIDEO" ? "VIDEO" : data.type ?? "IMAGE",
        target_window: "NEW",
        bannersize_id: resolveBannerSizeId(),
        html_text: data.html_text || null,
        images: imagesFinalDedup,
        videos: campaignType === "VIDEO" ? fallbackVideos : [],
        cta: data.call_to_action,
        banner_type: data.banner_type,
      };

      const currentContents = JSON.parse(
        localStorage.getItem(`adContents_${campaignType}`) || "[]"
      );

      let updatedContents;
      if (editingIndex !== null) {
        updatedContents = [...currentContents];
        updatedContents[editingIndex] = newAdContent;
      } else {
        updatedContents = [...currentContents, newAdContent];
      }

      // Store ad content WITHOUT images to avoid localStorage quota exceeded error
      // Images are stored separately in sessionStorage (which has larger quota)
      try {
        const adContentsWithoutImages = updatedContents.map((content) => ({
          ...content,
          images: [], // Don't store images in localStorage
          videos: [], // Don't store videos in localStorage
        }));
        localStorage.setItem(`adContents_${campaignType}`, JSON.stringify(adContentsWithoutImages));
        
        // Store images separately in sessionStorage (has larger quota, typically 10MB+)
        // Clear old images first
        sessionStorage.removeItem(`images_${campaignType}`);
        sessionStorage.removeItem(`videos_${campaignType}`);
        
        if (imagesFinalDedup && imagesFinalDedup.length > 0) {
          sessionStorage.setItem(`images_${campaignType}`, JSON.stringify(imagesFinalDedup));
          console.log(`Stored ${imagesFinalDedup.length} images in sessionStorage`);
        }
        
        if (newAdContent.videos && newAdContent.videos.length > 0) {
          sessionStorage.setItem(`videos_${campaignType}`, JSON.stringify(newAdContent.videos));
          console.log(`Stored ${newAdContent.videos.length} videos in sessionStorage`);
        }
        
        setSavedContents(updatedContents);
      } catch (storageError) {
        console.error("Storage error:", storageError);
        toast.error("Failed to save ad content due to storage limitations. Please try reducing image sizes.", { autoClose: 5000 });
        throw storageError; // Re-throw to prevent UI from closing
      }
      
      if (onSave) onSave(updatedContents, { action: "save" });

      reset();
      setEditingIndex(null);
      setMainImagePreview(null);
      setIconImagePreview(null);
      setMainImageMeta([]);
      setIconImageMeta([]);
      setAllImages([]);
      clearVideo({ preserveStorage: true });
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving ad content:", error);
      toast.error("Error saving ad content", { autoClose: 4000 });
    }
  };

  const handleEdit = (index: number) => {
    const content = savedContents[index];
    if (!content) return;

    // Set form values
    reset({
      title: content.title ?? "",
      description: content.desc ?? "",
      ad_domain: content.display ?? "",
      dest_url: content.dest_url ?? "",
      call_to_action: content.cta ?? "",
      sponsor_name: content.sponsored ?? "",
      banner_size:
        content.bannersize_id != null ? String(content.bannersize_id) : "",
      banner_type: content.banner_type ?? "",
      html_text: content.html_text ?? "",
    });

    // Retrieve images from sessionStorage instead of content object
    try {
      const storedImagesRaw = sessionStorage.getItem(`images_${campaignType}`);
      if (storedImagesRaw) {
        const storedImages = JSON.parse(storedImagesRaw);
        if (Array.isArray(storedImages) && storedImages.length > 0) {
          const mainImage = storedImages.find((img: any) => img.type === "MAIN");
          const iconImage = storedImages.find((img: any) => img.type === "ICON");
          
          if (mainImage && mainImage.image) {
            // Convert base64 back to data URL for preview
            const dataUrl = mainImage.image.startsWith("data:") 
              ? mainImage.image 
              : `data:image/png;base64,${mainImage.image}`;
            setMainImagePreview(dataUrl);
            setMainImageMeta([mainImage]);
          }
          
          if (iconImage && iconImage.image) {
            const dataUrl = iconImage.image.startsWith("data:") 
              ? iconImage.image 
              : `data:image/png;base64,${iconImage.image}`;
            setIconImagePreview(dataUrl);
            setIconImageMeta([iconImage]);
          }
          
          setAllImages(storedImages);
        }
      }
    } catch (err) {
      console.warn("Failed to retrieve images from sessionStorage:", err);
    }

    if (videoPreviewUrl) {
      try {
        URL.revokeObjectURL(videoPreviewUrl);
      } catch {}
    }

    // Retrieve videos from sessionStorage
    try {
      const storedVideosRaw = sessionStorage.getItem(`videos_${campaignType}`);
      if (storedVideosRaw) {
        const storedVideos = JSON.parse(storedVideosRaw);
        setVideoMeta(Array.isArray(storedVideos) ? storedVideos : []);
      }
    } catch (err) {
      console.warn("Failed to retrieve videos from sessionStorage:", err);
    }

    setVideoPreviewUrl(null);
    setVideoError(null);
    setVideoUploading(false);
    setVideoUploadDone(false);

    setEditingIndex(index);
    setIsOpen(true);
  };

  const handleAddNew = () => {
    reset();
    setEditingIndex(null);
    setMainImagePreview(null);
    setIconImagePreview(null);
    setMainImageMeta([]);
    setIconImageMeta([]);
    setAllImages([]);
    clearVideo();
    setIsOpen(true);
  };

  const handleDelete = (index: number) => {
    const updated = [...savedContents];
    updated.splice(index, 1);

    // Update localStorage
    localStorage.setItem(`adContents_${campaignType}`, JSON.stringify(updated));
    setSavedContents(updated);

    // Notify parent with updated contents
    if (onSave) {
      onSave(updated, { action: "delete" });
    }

    toast.success("Ad content deleted", { toastId: "ad-content-deleted" });
  };

  const renderSavedContents = () => (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-medium">Saved Ad Contents</h3>

      {savedContents.length === 0 ? (
        <p className="text-gray-500">No saved ad contents yet.</p>
      ) : (
        <div className="space-y-3">
          {savedContents.map((content, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 flex justify-between items-start"
            >
              <div>
                <h4 className="font-medium">{content.title || "No title"}</h4>
                {content.desc && (
                  <p className="text-sm text-gray-600">{content.desc}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {content.type}
                  </span>
                  {content.display && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {content.display}
                    </span>
                  )}
                  {content.dest_url && (
                    <a
                      href={content.dest_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded hover:underline"
                    >
                      View URL
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(index)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(index)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render fields based on campaignType
  function renderFields() {
    switch (campaignType) {
      case "VIDEO":
        return (
          <>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register("title", { required: "Title is required" })}
                placeholder="Enter ad title"
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="ad_domain">Ad Domain</Label>
              <Input
                id="ad_domain"
                {...register("ad_domain", {
                  required: "Display network is required",
                })}
                placeholder="Enter ad domain"
              />
              {errors.ad_domain && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.ad_domain.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="dest_url">Destination URL</Label>
              <Input
                id="dest_url"
                {...register("dest_url", {
                  required: "Destination URL is required",
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message:
                      "Please enter a valid URL starting with http:// or https://",
                  },
                })}
                placeholder="https://example.com"
              />
              {errors.dest_url && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.dest_url.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter ad description"
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="call_to_action">Call to Action</Label>
              <Input
                id="call_to_action"
                {...register("call_to_action")}
                placeholder="e.g., Learn More"
              />
            </div>

            <div>
              <Label htmlFor="sponsor_name">Sponsor Name</Label>
              <Input
                id="sponsor_name"
                {...register("sponsor_name")}
                placeholder="Your Brand Name"
              />
            </div>

            {videoError && (
              <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                {videoError}
              </div>
            )}

            <div>
              <Label>Video</Label>
              <div className="mt-1 flex items-center">
                <label
                  htmlFor="video"
                  className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Choose File
                  <input
                    id="video"
                    type="file"
                    accept="video/*"
                    className="sr-only"
                    {...register("video", {
                      onChange: (e) => handleVideoUpload(e),
                    })}
                  />
                </label>

                {videoUploading && (
                  <span className="ml-3 text-sm text-gray-600">Uploading...</span>
                )}
                {!videoUploading && videoUploadDone && (
                  <span className="ml-3 text-sm text-green-600">Upload completed</span>
                )}

                {(videoPreviewUrl || (videoMeta && videoMeta.length > 0)) && (
                  <div className="ml-4 flex items-center gap-2">
                    <span className="text-xs text-gray-600">
                      {videoMeta && videoMeta.length > 0
                        ? "Video attached"
                        : "Video selected"}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => clearVideo()}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {videoPreviewUrl && (
                <div className="mt-3">
                  <video
                    src={videoPreviewUrl || undefined}
                    controls
                    className="w-full max-w-md rounded border"
                  />
                </div>
              )}
            </div>
          </>
        );
      case "PUSH":
      case "FLOATING_PUSH":
        return (
          <>
            <div>
              <Label htmlFor="title">
                Ad Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register("title", { required: "Title is required" })}
                placeholder="Enter ad title"
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="display">
                Ad Domain <span className="text-red-500">*</span>
              </Label>
              <Input
                id="display"
                {...register("ad_domain", {
                  required: "Display network is required",
                })}
                placeholder="Enter display network (e.g., AdKernel)"
              />
              {errors.ad_domain && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.ad_domain.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="dest_url">
                Destination URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dest_url"
                {...register("dest_url", {
                  required: "Destination URL is required",
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message:
                      "Please enter a valid URL starting with http:// or https://",
                  },
                })}
                placeholder="https://example.com"
              />
              {errors.dest_url && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.dest_url.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="banner_size">
                Banner Size <span className="text-red-500">*</span>
              </Label>
              <input
                type="hidden"
                {...register("banner_size", {
                  required: "Banner size is required",
                })}
              />
              <Select
                value={watch("banner_size") ?? ""}
                onValueChange={(v) =>
                  setValue("banner_size", v, { shouldValidate: true, shouldDirty: true })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Size" />
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
                  {bannerList.length > 0 ? (
                    filteredBanners.length > 0 ? (
                      filteredBanners.map((b) => (
                        <SelectItem key={String(b.id)} value={String(b.id)}>
                          {b.width}×{b.height}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__no_matches" disabled>
                        No matches
                      </SelectItem>
                    )
                  ) : (
                    <SelectItem value="__loading" disabled>
                      Loading...
                    </SelectItem>
                  )}
                  <SelectItem value="12">Default</SelectItem>
                </SelectContent>
              </Select>
              {errors.banner_size && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.banner_size.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                {...register("description", {
                  required: "Description is required",
                })}
                placeholder="Enter ad description"
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label>Main Image</Label>
              <div className="mt-1 flex items-center">
                <label
                  htmlFor="main_image"
                  className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Choose File
                  <input
                    id="main_image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    {...register("main_image", {
                      onChange: (e) => handleImageUpload(e, "MAIN"),
                    })}
                  />
                </label>

                {mainImageUploading && (
                  <span className="ml-3 text-sm text-gray-600">Uploading...</span>
                )}
                {!mainImageUploading && mainImageUploadDone && (
                  <span className="ml-3 text-sm text-green-600">Upload completed</span>
                )}
                {mainImagePreview && (
                  <div className="ml-4 relative">
                    <img
                      src={mainImagePreview}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded"
                    />

                    <button
                      type="button"
                      onClick={() => clearImage("MAIN")}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Recommended size: 1200x628px, Max size: 1MB (1024KB)
              </p>
            </div>

            <div>
              <Label>Icon</Label>
              <div className="mt-1 flex items-center">
                <label
                  htmlFor="icon_image"
                  className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Choose File
                  <input
                    id="icon_image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    {...register("icon_image", {
                      onChange: (e) => handleImageUpload(e, "ICON"),
                    })}
                  />
                </label>
                {iconImageUploading && (
                  <span className="ml-3 text-sm text-gray-600">Uploading...</span>
                )}
                {!iconImageUploading && iconImageUploadDone && (
                  <span className="ml-3 text-sm text-green-600">Upload completed</span>
                )}
                {iconImagePreview && (
                  <div className="ml-4 relative">
                    <img
                      src={iconImagePreview}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded"
                    />

                    <button
                      type="button"
                      onClick={() => clearImage("ICON")}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Recommended size: 1200x628px, Max size: 1MB (1024KB)
              </p>
            </div>
          </>
        );

      case "CPC":
        return (
          <>
            <div>
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register("title", { required: "Title is required" })}
                placeholder="Enter ad title"
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="ad_domain">Ad Domain</Label>
              <Input
                id="ad_domain"
                {...register("ad_domain")}
                placeholder="Enter display network (e.g., AdKernel)"
              />
            </div>

            <div>
              <Label htmlFor="dest_url">
                Destination URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dest_url"
                {...register("dest_url", {
                  required: "Destination URL is required",
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message:
                      "Please enter a valid URL starting with http:// or https://",
                  },
                })}
                placeholder="https://example.com"
              />
              {errors.dest_url && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.dest_url.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter ad description"
              />
            </div>
          </>
        );

      case "NATIVE":
        return (
          <>
            <div>
              <Label htmlFor="title">Ad Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                {...register("title", { required: "Title is required" })}
                placeholder="Enter ad title"
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="">
              <Label htmlFor="type">Ad Type</Label>
              <Input
                id="type"
                {...register("type")}
                value={"NATIVE"}
                disabled
                placeholder="Enter ad type"
              />
            </div>

            <div>
              <Label htmlFor="display">Ad Domain <span className="text-red-500">*</span></Label>
              <Input
                id="display"
                {...register("ad_domain", {
                  required: "Display network is required",
                })}
                placeholder="Enter display network (e.g., AdKernel)"
              />
              {errors.ad_domain && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.ad_domain.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="dest_url">Destination URL <span className="text-red-500">*</span></Label>
              <Input
                id="dest_url"
                {...register("dest_url", {
                  required: "Destination URL is required",
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message:
                      "Please enter a valid URL starting with http:// or https://",
                  },
                })}
                placeholder="https://example.com"
              />
              {errors.dest_url && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.dest_url.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Description </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter ad description"
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="banner_size">Banner Size <span className="text-red-500">*</span></Label>
              <input type="hidden" {...register("banner_size")} />
              <Select
                value={watch("banner_size") ?? ""}
                onValueChange={(v) =>
                  setValue("banner_size", v, { shouldValidate: true, shouldDirty: true })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Size" />
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
                  {bannerList.length > 0 ? (
                    filteredBanners.length > 0 ? (
                      filteredBanners.map((b) => (
                        <SelectItem key={String(b.id)} value={String(b.id)}>
                          {b.width}×{b.height}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__no_matches" disabled>
                        No matches
                      </SelectItem>
                    )
                  ) : (
                    <SelectItem value="__loading" disabled>
                      Loading...
                    </SelectItem>
                  )}
                  <SelectItem value="12">Default</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="call_to_action">Call to Action</Label>
              <Input
                id="call_to_action"
                {...register("call_to_action")}
                placeholder="e.g., Learn More"
              />
            </div>
            <div>
              <Label htmlFor="sponsor_name">Sponsor Name</Label>
              <Input
                id="sponsor_name"
                {...register("sponsor_name")}
                placeholder="Your Brand Name"
              />
            </div>

            <div>
              <Label htmlFor="display">Display Network <span className="text-red-500">*</span></Label>
              <Input
                id="display"
                {...register("display", {
                  required: "Display network is required",
                })}
                placeholder="Enter display network (e.g., AdKernel)"
              />
              {errors.display && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.display.message}
                </p>
              )}
            </div>

            <div>
              <Label>Main Image</Label>
              <div className="mt-1 flex items-center">
                <label
                  htmlFor="main_image"
                  className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Choose File
                  <input
                    id="main_image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    {...register("main_image", {
                      onChange: (e) => handleImageUpload(e, "MAIN"),
                    })}
                  />
                </label>

                {mainImageUploading && (
                  <span className="ml-3 text-sm text-gray-600">Uploading...</span>
                )}
                {!mainImageUploading && mainImageUploadDone && (
                  <span className="ml-3 text-sm text-green-600">Upload completed</span>
                )}
                {mainImagePreview && (
                  <div className="ml-4 relative">
                    <img
                      src={mainImagePreview}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded"
                    />

                    <button
                      type="button"
                      onClick={() => clearImage("MAIN")}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Recommended size: 1200x628px, Max size: 1MB (1024KB)
              </p>
            </div>
            <div>
              <Label>Icon</Label>
              <div className="mt-1 flex items-center">
                <label
                  htmlFor="icon_image"
                  className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Choose File
                  <input
                    id="icon_image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    {...register("icon_image", {
                      onChange: (e) => handleImageUpload(e, "ICON"),
                    })}
                  />
                </label>
                {iconImageUploading && (
                  <span className="ml-3 text-sm text-gray-600">Uploading...</span>
                )}
                {!iconImageUploading && iconImageUploadDone && (
                  <span className="ml-3 text-sm text-green-600">Upload completed</span>
                )}
                {iconImagePreview && (
                  <div className="ml-4 relative">
                    <img
                      src={iconImagePreview}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded"
                    />

                    <button
                      type="button"
                      onClick={() => clearImage("ICON")}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Recommended size: 1200x628px, Max size: 1MB (1024KB)
              </p>
            </div>
          </>
        );

      case "DISPLAY":
        return (
          <>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register("title", { required: "Title is required" })}
                placeholder="Enter ad title"
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="ad_domain">Ad Domain</Label>
              <Input
                id="ad_domain"
                {...register("ad_domain", {
                  required: "Display network is required",
                })}
                placeholder="Enter display network (e.g., AdKernel)"
              />
              {errors.ad_domain && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.ad_domain.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="dest_url">Destination URL</Label>
              <Input
                id="dest_url"
                {...register("dest_url", {
                  required: "Destination URL is required",
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message:
                      "Please enter a valid URL starting with http:// or https://",
                  },
                })}
                placeholder="https://example.com"
              />
              {errors.dest_url && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.dest_url.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="banner_size">Banner Size <span className="text-red-500">*</span></Label>
              <input type="hidden" {...register("banner_size")} />
              <Select
                value={watch("banner_size") ?? ""}
                onValueChange={(v) =>
                  setValue("banner_size", v, { shouldValidate: true, shouldDirty: true })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Size" />
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
                  {bannerList.length > 0 ? (
                    filteredBanners.length > 0 ? (
                      filteredBanners.map((b) => (
                        <SelectItem key={String(b.id)} value={String(b.id)}>
                          {b.width}×{b.height}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__no_matches" disabled>
                        No matches
                      </SelectItem>
                    )
                  ) : (
                    <SelectItem value="__loading" disabled>
                      Loading...
                    </SelectItem>
                  )}
                  <SelectItem value="12">Default</SelectItem>
                </SelectContent>
              </Select>
              {errors.banner_size && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.banner_size.message}
                </p>
              )}
            </div>

            <div>
              <Label>Main Image <span className="text-red-500">*</span></Label>
              <div className="mt-1 flex items-center">
                <label
                  htmlFor="main_image"
                  className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Choose File
                  <input
                    id="main_image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    {...register("main_image", {
                      onChange: (e) => handleImageUpload(e, "MAIN"),
                    })}
                  />
                </label>

                {mainImageUploading && (
                  <span className="ml-3 text-sm text-gray-600">Uploading...</span>
                )}
                {!mainImageUploading && mainImageUploadDone && (
                  <span className="ml-3 text-sm text-green-600">Upload completed</span>
                )}
                {mainImagePreview && (
                  <div className="ml-4 relative">
                    <img
                      src={mainImagePreview}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded"
                    />

                    <button
                      type="button"
                      onClick={() => clearImage("MAIN")}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Recommended size: 1200x628px, Max size: 1MB (1024KB)
              </p>
            </div>

            <div>
              <Label htmlFor="icon_image">Icon Image</Label>
              <div className="mt-1 flex items-center">
                <label
                  htmlFor="icon_image"
                  className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Choose File
                  <input
                    id="icon_image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    {...register("icon_image", {
                      onChange: (e) => handleImageUpload(e, "ICON"),
                    })}
                  />
                </label>
                {iconImageUploading && (
                  <span className="ml-3 text-sm text-gray-600">Uploading...</span>
                )}
                {!iconImageUploading && iconImageUploadDone && (
                  <span className="ml-3 text-sm text-green-600">Upload completed</span>
                )}
                {iconImagePreview && (
                  <div className="ml-4 relative">
                    <img
                      src={iconImagePreview}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded"
                    />

                    <button
                      type="button"
                      onClick={() => clearImage("ICON")}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Recommended size: 128x128px, Max size: 1MB (1024KB)
              </p>
            </div>
          </>
        );

      case "INTERSTITIAL":
        return (
          <>
            <div>
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                {...register("title", { required: "Title is required" })}
                placeholder="Enter ad title"
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="ad_domain">Ad Domain <span className="text-red-500">*</span></Label>
              <Input
                id="ad_domain"
                {...register("ad_domain", {
                  required: "Ad domain is required",
                })}
                placeholder="Enter ad domain (e.g., example.com)"
              />
              {errors.ad_domain && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.ad_domain.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="dest_url">Destination URL <span className="text-red-500">*</span></Label>
              <Input
                id="dest_url"
                {...register("dest_url", {
                  required: "Destination URL is required",
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message:
                      "Please enter a valid URL starting with http:// or https://",
                  },
                })}
                placeholder="https://example.com"
              />
              {errors.dest_url && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.dest_url.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="banner_size">Banner Size <span className="text-red-500">*</span></Label>
              <input type="hidden" {...register("banner_size")} />
              <Select
                value={watch("banner_size") ?? ""}
                onValueChange={(v) =>
                  setValue("banner_size", v, { shouldValidate: true, shouldDirty: true })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Size" />
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
                  {bannerList.length > 0 ? (
                    filteredBanners.length > 0 ? (
                      filteredBanners.map((b) => (
                        <SelectItem key={String(b.id)} value={String(b.id)}>
                          {b.width}×{b.height}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__no_matches" disabled>
                        No matches
                      </SelectItem>
                    )
                  ) : (
                    <SelectItem value="__loading" disabled>
                      Loading...
                    </SelectItem>
                  )}
                  <SelectItem value="12">Default</SelectItem>
                </SelectContent>
              </Select>
              {errors.banner_size && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.banner_size.message}
                </p>
              )}
            </div>

            <div>
              <Label>Main Image <span className="text-red-500">*</span></Label>
              <div className="mt-1 flex items-center">
                <label
                  htmlFor="main_image"
                  className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Choose File
                  <input
                    id="main_image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    {...register("main_image", {
                      onChange: (e) => handleImageUpload(e, "MAIN"),
                    })}
                  />
                </label>

                {mainImageUploading && (
                  <span className="ml-3 text-sm text-gray-600">Uploading...</span>
                )}
                {!mainImageUploading && mainImageUploadDone && (
                  <span className="ml-3 text-sm text-green-600">Upload completed</span>
                )}
                {mainImagePreview && (
                  <div className="ml-4 relative">
                    <img
                      src={mainImagePreview}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded"
                    />

                    <button
                      type="button"
                      onClick={() => clearImage("MAIN")}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Recommended size: 1200x628px, Max size: 1MB (1024KB)
              </p>
            </div>
          </>
        );

      default:
        return (
          <>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register("title", { required: "Title is required" })}
                placeholder="Enter ad title"
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="banner_size">Banner Size</Label>
              <input type="hidden" {...register("banner_size")} />
              <Select
                value={watch("banner_size") ?? ""}
                onValueChange={(v) =>
                  setValue("banner_size", v, { shouldValidate: true, shouldDirty: true })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Size" />
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
                  {bannerList.length > 0 ? (
                    filteredBanners.length > 0 ? (
                      filteredBanners.map((b) => (
                        <SelectItem key={String(b.id)} value={String(b.id)}>
                          {b.width}×{b.height}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__no_matches" disabled>
                        No matches
                      </SelectItem>
                    )
                  ) : (
                    <SelectItem value="__loading" disabled>
                      Loading...
                    </SelectItem>
                  )}
                  <SelectItem value="12">Default</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ad_domain">Ad Domain</Label>
              <Input
                id="ad_domain"
                {...register("ad_domain", {
                  required: "Display network is required",
                })}
                placeholder="Enter display network (e.g., AdKernel)"
              />
              {errors.ad_domain && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.ad_domain.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="dest_url">Destination URL</Label>
              <Input
                id="dest_url"
                {...register("dest_url", {
                  required: "Destination URL is required",
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message:
                      "Please enter a valid URL starting with http:// or https://",
                  },
                })}
                placeholder="https://example.com"
              />
              {errors.dest_url && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.dest_url.message}
                </p>
              )}
            </div>
          </>
        );
    }
  }

  const isAnyImageUploading = mainImageUploading || iconImageUploading;
  const isAnyUploading = isAnyImageUploading || videoUploading;

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {/* {!autoOpen && ( */}
        <DialogTrigger asChild>
          <Button variant="outline" onClick={handleAddNew}>
            Add Ad Content
          </Button>
        </DialogTrigger>
        {/* )} */}
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>
              Create {campaignType.replace("_", " ")} Content
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-4 overflow-y-auto max-h-[65vh] space-y-4">
            {/* Campaign type-specific instructions */}
            <div className="text-sm text-gray-600">
              {campaignType === "NATIVE" && (
                <p>
                  Create native ad content that matches the look and feel of the
                  platform.
                </p>
              )}
              {campaignType === "PUSH" && (
                <p>
                  Create push notification content that&apos;s engaging and
                  concise.
                </p>
              )}
              {campaignType === "DISPLAY" && (
                <p>
                  Create display banner content with clear messaging and
                  visuals.
                </p>
              )}
              {campaignType === "FLOATING_PUSH" && (
                <p>
                  Create in-page push content that grabs attention without being
                  intrusive.
                </p>
              )}
              {campaignType === "CPC" && (
                <p>Create pop-under content that provides value to users.</p>
              )}
              {campaignType === "VIDEO" && (
                <p>
                  Create video content that engages and informs your audience.
                </p>
              )}
            </div>
            {imageError && (
              <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                {imageError}
              </div>
            )}
            {renderFields()}
            {renderSavedContents()}
          </div>
          <div className=" bg-background border-t p-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setEditingIndex(null);
                setMainImagePreview(null);
                setIconImagePreview(null);
                setMainImageMeta([]);
                setIconImageMeta([]);
                setAllImages([]);
                clearVideo();
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>
            {isAnyUploading ? (
              <Button type="button" className="bg-blue-600 hover:bg-blue-700" disabled>
                Uploading...
              </Button>
            ) : (
              <Button
                type="button"
                className="bg-[#6a6bcf] hover:bg-blue-700"
                onClick={() => {
                  // Prevent parent form submission by handling locally
                  handleSubmit(onSubmit)();
                }}
              >
                {editingIndex !== null ? "Update" : "Save"} Ad Content
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Table to display saved contents */}
      {savedContents.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Saved Ad Contents</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Display Network
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Call to Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {savedContents.map((content, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {content.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {content.display}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {content.dest_url}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {content.desc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {content.cta}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {content.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(index)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(index)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}