
"use client";

import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, X } from "lucide-react";

interface FeedData {
  countries?: string;
  id: string;
  name: string;
}

interface DeviceBrandProps {
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onDeviceBrandDataChange?: (deviceBrandData: Array<{id: string, name: string, type: string}>) => void;
  selectedIds?: string[]; // Device brands from API
}

const staticFeedData: FeedData[] = [
  { id: "UNKNOWN", name: "UNKNOWN" },
  { id: "AMAZON", name: "AMAZON" },
  { id: "APPLE", name: "APPLE" },
  { id: "ASUS", name: "ASUS" },
  { id: "BLACKBERRY", name: "BLACKBERRY" },
  { id: "GOOGLE", name: "GOOGLE" },
  { id: "HTC", name: "HTC" },
  { id: "HUAWEI", name: "HUAWEI" },
  { id: "INFINIX", name: "INFINIX" },
  { id: "ITEL", name: "ITEL" },
  { id: "LENOVO", name: "LENOVO" },
  { id: "LG", name: "LG" },
  { id: "MEIZU", name: "MEIZU" },
  { id: "MICROSOFT", name: "MICROSOFT" },
  { id: "MOTOROLA", name: "MOTOROLA" },
  { id: "NOKIA", name: "NOKIA" },
  { id: "ONEPLUS", name: "ONEPLUS" },
  { id: "OPPO", name: "OPPO" },
  { id: "PANASONIC", name: "PANASONIC" },
  { id: "PHILIPS", name: "PHILIPS" },
  { id: "ROKU", name: "ROKU" },
  { id: "SAMSUNG", name: "SAMSUNG" },
  { id: "SONY", name: "SONY" },
  { id: "TECNO", name: "TECNO" },
  { id: "VIVO", name: "VIVO" },
  { id: "XIAOMI", name: "XIAOMI" },
  { id: "ZTE", name: "ZTE" },
  { id: "COOLPAD", name: "COOLPAD" },
  { id: "REALME", name: "REALME" },
  { id: "META", name: "META" },
  { id: "VIZIO", name: "VIZIO" },
  { id: "BLU", name: "BLU" },
  { id: "TCL", name: "TCL" },
  { id: "TMOBILE", name: "TMOBILE" },
];

export default function DeviceBrand({ onSelectionChange, onDeviceBrandDataChange, selectedIds }: DeviceBrandProps) {
  const [selectedDeviceBrand, setselectedDeviceBrand] = useState<Set<string>>(new Set<string>());
  const [open, setOpen] = useState(true); // Open by default
  const [query, setQuery] = useState("");
  const [chipsExpanded, setChipsExpanded] = useState(false);

  const masterCheckboxRef = useRef<HTMLInputElement | null>(null);
  const initializedRef = useRef(false);

  const feedData = staticFeedData;
  const totalItems = feedData.length;

  // Initialize with selectedIds from API (only once)
  useEffect(() => {
    if (!initializedRef.current) {
      if (selectedIds && selectedIds.length > 0) {
        console.log("🏷️ DeviceBrand: Initial setup with selectedIds from API");
        setselectedDeviceBrand(new Set(selectedIds));
      } else {
        // Create mode: select all device brands by default
        const allIds = new Set(staticFeedData.map((item) => item.id));
        console.log("🏷️ DeviceBrand: Create mode - selecting all device brands by default", Array.from(allIds));
        setselectedDeviceBrand(allIds);
      }
      initializedRef.current = true;
    }
  }, [selectedIds]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedDeviceBrand);
    }
  }, [selectedDeviceBrand, onSelectionChange]);

  useEffect(() => {
    if (onDeviceBrandDataChange) {
      // Convert selected device brand IDs to the expected data format
      const deviceBrandData = Array.from(selectedDeviceBrand).map(id => {
        const deviceBrand = staticFeedData.find(item => item.id === id);
        return {
          id: id,
          name: deviceBrand?.name || id,
          type: "device_brand"
        };
      });
      onDeviceBrandDataChange(deviceBrandData);
    }
  }, [selectedDeviceBrand, onDeviceBrandDataChange]);

  const handleCarrierChange = (itemId: string) => {
    setselectedDeviceBrand((prev) => {
      const updated = new Set(prev);
      if (updated.has(itemId)) {
        updated.delete(itemId);
      } else {
        updated.add(itemId);
      }
      return updated;
    });
  };

  const handleMasterChange = () => {
    setselectedDeviceBrand((prevSelected) => {
      if (prevSelected.size === totalItems && totalItems > 0) {
        return new Set();
      } else {
        return new Set(feedData.map((item) => item.id));
      }
    });
  };

  const handleSelectAll = () => {
    setselectedDeviceBrand(new Set(feedData.map((item) => item.id)));
  };

  const handleClearAll = () => {
    setselectedDeviceBrand(new Set());
  };

  const allLoadedItemsSelected =
    selectedDeviceBrand.size === totalItems && totalItems > 0;
  const noneLoadedItemsSelected = selectedDeviceBrand.size === 0;
  const isIndeterminate =
    !allLoadedItemsSelected && !noneLoadedItemsSelected && totalItems > 0;

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  return (
    <div className="space-y-2">
      {/* <Label className="text-lg font-semibold block">Device Brand</Label> */}

      <div className="rounded-md border border-gray-300 bg-blue-50 p-3 w-full text-sm space-y-3 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {totalItems > 0 && (
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 rounded accent-blue-600"
                checked={allLoadedItemsSelected}
                ref={masterCheckboxRef}
                onChange={handleMasterChange}
              />
            )}
            <div className="font-semibold text-gray-900">Device Brand</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-600">
              {selectedDeviceBrand.size} selected
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleSelectAll}
            >
              Select All
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleClearAll}
            >
              Clear
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-sm">Brands</Label>
          <div className="mt-1 rounded-md border border-gray-300 bg-white">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex w-full items-center justify-between px-3 py-2 text-left"
            >
              <div className="text-sm text-gray-900">
                {selectedDeviceBrand.size > 0
                  ? `${selectedDeviceBrand.size} selected`
                  : "Select device brands"}
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {selectedDeviceBrand.size > 0 && (
              <div className="flex flex-wrap gap-2 px-3 pb-2">
                {Array.from(selectedDeviceBrand)
                  .slice(0, chipsExpanded ? undefined : 3)
                  .map((id) => {
                    const item = staticFeedData.find((x) => x.id === id);
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-xs text-white"
                      >
                        <span>{item?.name || id}</span>
                        <button
                          type="button"
                          onClick={() => handleCarrierChange(id)}
                          className="rounded-full bg-white/20 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                {selectedDeviceBrand.size > 3 && (
                  <button
                    type="button"
                    onClick={() => setChipsExpanded((v) => !v)}
                    className="text-xs text-blue-700 hover:underline"
                  >
                    {chipsExpanded
                      ? "Show less"
                      : `View all (+${selectedDeviceBrand.size - 3})`}
                  </button>
                )}
              </div>
            )}

            {open && (
              <div className="border-t border-gray-200 p-3">
                <div className="relative mb-2">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-8"
                    placeholder="Search brands..."
                  />
                </div>
                <div className="max-h-56 overflow-auto">
                  {staticFeedData
                    .filter((x) =>
                      x.name.toLowerCase().includes(query.toLowerCase()) ||
                      x.id.toLowerCase().includes(query.toLowerCase())
                    )
                    .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleCarrierChange(item.id)}
                        className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-gray-50"
                      >
                        <div className="text-gray-900">{item.name}</div>
                        <input
                          type="checkbox"
                          checked={selectedDeviceBrand.has(item.id)}
                          readOnly
                        />
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {selectedDeviceBrand.size === 0 && totalItems > 0 && (
        <p className="text-sm text-yellow-600 mt-1">
          Note: No Carriers selected
        </p>
      )}
    </div>
  );
}
