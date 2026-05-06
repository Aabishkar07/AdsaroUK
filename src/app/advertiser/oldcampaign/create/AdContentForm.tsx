"use client";

import { useState, useEffect, useCallback } from "react";
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
  video?: string;
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
  onSave?: (data: SavedAdContent[] | SavedAdContent) => void; // Optional callback for when content is saved to localStorage
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
  const [bannerList, setBannerList] = useState<BannerSize[]>([]);

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<AdContentFormData>();

  const loadBannerSize = async () => {
    try {
      const url = `https://panel.adsaro.com/admin/api/CpmBannerSize/?version=4&userToken=1wDtEkEz2ykyOdyx`;
      const response = await axios.get(url);
      const rows = response.data?.response?.rows;

      if (rows && typeof rows === "object") {
        const bannerArray = Object.values(rows) as BannerSize[];
        setBannerList(bannerArray);
      } else {
        console.warn("Invalid data format:", rows);
      }
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
      setIsOpen(true);
    }
  }, [autoOpen, campaignType]);

  // moved into useCallback above

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
  // const fileToBase64 = (file: File): Promise<string> => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = () => resolve(reader.result as string);
  //     reader.onerror = reject;
  //     reader.readAsDataURL(file);
  //   });
  // };

  // Normalize base64 string
  // const normalizeBase64 = (input: string) => {
  //   if (!input) return input;
  //   let s = input.replace(/\s+/g, ""); // remove whitespace/newlines
  //   if (s.startsWith('"') && s.endsWith('"')) {
  //     s = s.slice(1, -1);
  //   }
  //   const mod = s.length % 4;
  //   if (mod > 0) {
  //     s += "=".repeat(4 - mod);
  //   }
  //   return s;
  // };

  // Handle image preview and validation
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "MAIN" | "ICON"
  ) => {
    setImageError(null);
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setImageError(
        "Please upload a valid image file (JPEG, PNG, GIF, or WebP)"
      );
      return;
    }

    // Validate file size (max 64MB per Files Service)
    const maxSize = 64 * 1024 * 1024; // 64MB
    if (file.size > maxSize) {
      setImageError("Image size should be less than 64MB");
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
      // Build ImageValue-like entries per returned File ID
      const newEntries = (fileIds || []).map((fid) => {
        let encoded = "";
        try {
          encoded = window.btoa(fid);
        } catch (e) {
          console.error("Failed to encode file ID:", e);
        }
        // const imageJson = JSON.stringify({ image: encoded });
        return {
          width: dimensions.width,
          height: dimensions.height,
          type,
          image: encoded,
        };
      });
      // Update per-type meta arrays (replace for this type)
      if (type === "MAIN") {
        console.log("mainnnnnewEntries", newEntries);
        setMainImageMeta(newEntries);
        try {
          localStorage.setItem(
            `mainImageMeta_${campaignType}`,
            JSON.stringify(newEntries)
          );
        } catch {
          console.log("Failed to save mainImageMeta to localStorage");
        }
      } else {
        setIconImageMeta(newEntries);
        try {
          localStorage.setItem(
            `iconImageMeta_${campaignType}`,
            JSON.stringify(newEntries)
          );
        } catch {
          console.log("Failed to save iconImageMeta to localStorage");
        }
      }
      // Update combined collection used for payload (replace entries of this type)
      const combinedImages = (() => {
        const filtered = allImages.filter((img) => img.type !== type);
        return [...filtered, ...newEntries];
      })();
      setAllImages(combinedImages);
      try {
        localStorage.setItem(
          `images_${campaignType}`,
          JSON.stringify(combinedImages)
        );
      } catch (e) {
        console.log("😶‍🌫️😶‍🌫️😶‍🌫️😶‍🌫️😶‍🌫️😶‍🌫️😶‍🌫️Failed to save images to localStorage", e);
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
      setImageError(
        "Failed to upload image. Please try again or use a smaller file."
      );
    }
  };

  const clearImage = (type: "MAIN" | "ICON") => {
    if (type === "MAIN") {
      setMainImagePreview(null);
      setMainImageMeta([]);
      // Reset the file input
      const mainImageInput = document.getElementById(
        "main_image"
      ) as HTMLInputElement;
      if (mainImageInput) mainImageInput.value = "";
    } else {
      setIconImagePreview(null);
      setIconImageMeta([]);
      // Reset the file input
      const iconImageInput = document.getElementById(
        "icon_image"
      ) as HTMLInputElement;
      if (iconImageInput) iconImageInput.value = "";
    }
  };

  // Build images array
  const buildImages = async () => {
    // Use the prepared ImageValue objects from handleImageUpload
    if (allImages && allImages.length > 0) return allImages;
    // Fallback to meta arrays if present
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
    console.log("popopopopopopopop", mainImageMeta);
    try {
      const imagesFinal = await buildImages();
      // Dedupe same image entries (by type + image id)
      const seen = new Set<string>();
      const imagesFinalDedup = (imagesFinal || []).filter((img) => {
        const key = `${img.type}:${img.image}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      // Guard: for IMAGE/NATIVE, require at least one image
      // const mustHaveImages =
      //   (data.type ?? "IMAGE").toUpperCase() === "IMAGE" ||
      //   (data.type ?? "").toUpperCase() === "NATIVE";
      console.log("onSubmit allImages", allImages);
      console.log("onSubmit mainImageMeta", mainImageMeta);
      console.log("onSubmit iconImageMeta", iconImageMeta);
      console.log("onSubmit imagesFinalDedup", imagesFinalDedup);
      // if (mustHaveImages && imagesFinalDedup.length === 0) {
      //   toast.error("Please upload at least one MAIN image before saving.");
      //   return;
      // }

      let adType = campaignType.toUpperCase();
      if (campaignType === "DISPLAY" && data.banner_type) {
        adType = data.banner_type;
      }

      const newAdContent: SavedAdContent = {
        title: data.title || adType,
        desc: data.description || null,
        display: data.ad_domain || null,
        dest_url: data.dest_url || null,
        sponsored: data.sponsor_name || null,
        enabled: true,
        type: data.type ?? "IMAGE",
        target_window: "NEW",
        bannersize_id: data.banner_size ? Number(data.banner_size) : null,
        html_text: data.html_text || null,
        images: imagesFinalDedup,
        videos: [],
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

      localStorage.setItem(
        `adContents_${campaignType}`,
        JSON.stringify(updatedContents)
      );
      console.log("updatedContents999999999999999999", updatedContents);
      setSavedContents(updatedContents);
      // Persist final images as well for quick reuse/debug
      try {
        localStorage.setItem(
          `images_${campaignType}`,
          JSON.stringify(imagesFinalDedup)
        );
      } catch {}
      if (onSave) onSave(updatedContents);

      reset();
      setEditingIndex(null);
      setMainImagePreview(null);
      setIconImagePreview(null);
      setIsOpen(false);
      toast.success(
        `Ad content ${
          editingIndex !== null ? "updated" : "saved"
        } successfully!`
      );
    } catch (error) {
      console.error("Error saving ad content:", error);
      toast.error("Error saving ad content");
    }
  };

  const handleEdit = (index: number) => {
    const content = savedContents[index];
    if (!content) return;

    // Set form values
    reset({
      title: content.title,
      description: content.desc || "",
      ad_domain: content.display || "",
      destination_url: content.dest_url || "",
      call_to_action: content.cta || "",
      sponsor_name: content.sponsored || "",
      banner_size: content.bannersize_id?.toString() || "",
      banner_type: content.banner_type || "",
      html_text: content.html_text || "",
    });

    // Set image previews if available
    if (content.images && content.images.length > 0) {
      const mainImage = content.images[0]; // First image is main image
      if (mainImage && mainImage.image) {
        // Only set preview if stored value looks like a data URL
        if (mainImage.image && mainImage.image.startsWith("data:")) {
          setMainImagePreview(mainImage.image);
        } else {
          setMainImagePreview(null);
        }
      }

      // If there's a second image, treat it as icon
      if (content.images[1] && content.images[1].image) {
        if (content.images[1].image.startsWith("data:")) {
          setIconImagePreview(content.images[1].image);
        } else {
          setIconImagePreview(null);
        }
      }
    }

    setEditingIndex(index);
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
      onSave(updated);
    }

    toast.success("Ad content deleted");
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
      case "NATIVE":
        return (
          <>
            <div>
              <Label htmlFor="title">Ad Title</Label>
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
              <Label htmlFor="display">Ad Domain</Label>
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
              <Label htmlFor="banner_size">Banner Size</Label>
              <select
                id="banner_size"
                {...register("banner_size")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              >
                <option value="">Select Size</option>
                {bannerList.length > 0 ? (
                  bannerList.map((banners) => (
                    <option key={banners.id} value={banners.id}>
                      {banners.width}×{banners.height}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading...</option>
                )}
              </select>
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
              <Label htmlFor="display">Display Network</Label>
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
                Recommended size: 1200x628px, Max size: 64MB
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
                Recommended size: 1200x628px, Max size: 64MB
              </p>
            </div>
          </>
        );

      case "PUSH":
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
              <Label htmlFor="banner_size">Banner Size</Label>
              <select
                id="banner_size"
                {...register("banner_size")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              >
                <option value="">Select Size</option>
                {bannerList.length > 0 ? (
                  bannerList.map((banners) => (
                    <option key={banners.id} value={banners.id}>
                      {banners.width}×{banners.height}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading...</option>
                )}
              </select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
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
                Recommended size: 1200x628px, Max size: 64MB
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
                placeholder="Enter ad domain (e.g., AdKernel)"
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
              <Label htmlFor="banner_size">Banner Size</Label>
              <select
                id="banner_size"
                {...register("banner_size")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              >
                <option value="">Select Size</option>
                {bannerList.length > 0 ? (
                  bannerList.map((banners) => (
                    <option key={banners.id} value={banners.id}>
                      {banners.width}×{banners.height}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading...</option>
                )}
              </select>
            </div>
            <div>
              <Label>Type</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="html_type"
                    value="HTML"
                    {...register("type")}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="html_type">HTML</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="image_type"
                    value="IMAGE"
                    {...register("type")}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="image_type">Image</Label>
                </div>
              </div>
            </div>
            {watch("type") === "HTML" && (
              <div>
                <Label htmlFor="html_text">HTML Text</Label>
                <Textarea
                  id="html_text"
                  placeholder="Enter your HTML code here..."
                  className="min-h-24"
                  {...register("html_text")}
                />
              </div>
            )}
            {watch("type") === "IMAGE" && (
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
                  Recommended size: 1200x628px, Max size: 64MB
                </p>
              </div>
            )}
          </>
        );

      case "CPC":
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
              <Label htmlFor="banner_size">Banner Size</Label>
              <select
                id="banner_size"
                {...register("banner_size")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              >
                <option value="">Select Size</option>
                {bannerList.length > 0 ? (
                  bannerList.map((banners) => (
                    <option key={banners.id} value={banners.id}>
                      {banners.width}×{banners.height}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading...</option>
                )}
              </select>
            </div>
          </>
        );

      case "FLOATING_PUSH":
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
              <Label htmlFor="banner_size">Banner Size</Label>
              <select
                id="banner_size"
                {...register("banner_size")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              >
                <option value="">Select Size</option>
                {bannerList.length > 0 ? (
                  bannerList.map((banners) => (
                    <option key={banners.id} value={banners.id}>
                      {banners.width}×{banners.height}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading...</option>
                )}{" "}
                <option value="1">320x50</option>
                <option value="2">728x90</option>
                <option value="3">300x250</option>
                <option value="5">320x480</option>
              </select>
            </div>
            <div>
              <Label htmlFor="icon_image">Upload Icon Image</Label>
              <Input
                id="icon_image"
                type="file"
                accept="image/*"
                {...register("icon_image")}
              />
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
              <select
                id="banner_size"
                {...register("banner_size")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              >
                <option value="">Select Size</option>
                {bannerList.length > 0 ? (
                  bannerList.map((banners) => (
                    <option key={banners.id} value={banners.id}>
                      {banners.width}×{banners.height}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading...</option>
                )}
              </select>
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

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {/* {!autoOpen && ( */}
        <DialogTrigger asChild>
          <Button variant="outline">Add Ad Content</Button>
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
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                // Prevent parent form submission by handling locally
                handleSubmit(onSubmit)();
              }}
            >
              {editingIndex !== null ? "Update" : "Save"} Ad Content
            </Button>
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
