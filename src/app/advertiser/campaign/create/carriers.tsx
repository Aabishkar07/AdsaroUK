
"use client";

import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/context";
import axios from "axios";
import { ChevronDown, Search, X } from "lucide-react";

interface FeedData {
  countries: string;
  id: string;
  name: string;
}

interface CarriersProps {
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onCarrierDataChange?: (carrierData: Array<{id: string, name: string, type: string}>) => void;
  selectedIds?: string[]; // Carrier IDs from API
}

export default function Carriers({ onSelectionChange, onCarrierDataChange, selectedIds }: CarriersProps) {
  const [feedData, setFeedData] = useState<FeedData[]>([]);
  const [selectedCarrierIds, setSelectedCarrierIds] = useState<Set<string>>(
    new Set()
  );
  const [open, setOpen] = useState(true); // Open by default
  const [query, setQuery] = useState("");
  const [chipsExpanded, setChipsExpanded] = useState(false);

  const auth = useAuth();
  const masterCheckboxRef = useRef<HTMLInputElement | null>(null);
  const initializedRef = useRef(false);

  const fetchCarriers = async () => {
    if (!auth?.token) return;
    try {
      const response = await axios.get(
        `https://panel.adsaro.com/advertiser/api/Carriers/?version=4&token=${auth.token}`
      );
      const rowsObject = response?.data?.response?.rows;
      if (rowsObject) {
        const rowsArray = Object.values(rowsObject) as FeedData[];
        setFeedData(rowsArray);
        // Default-select all in create mode (no selectedIds). Preserve edit mode.
        if (!initializedRef.current) {
          if (selectedIds && selectedIds.length > 0) {
            // Edit mode will be handled by the separate initialization effect
          } else {
            // Create mode: select all carriers by default
            setSelectedCarrierIds(new Set(rowsArray.map((item) => item.id)));
          }
        }
      } else {
        console.error("Unexpected API structure:", response.data);
        setFeedData([]);
        setSelectedCarrierIds(new Set());
      }
    } catch (error) {
      console.error("Failed to fetch carriers:", error);
      setFeedData([]);
      setSelectedCarrierIds(new Set());
    }
  };

  useEffect(() => {
    fetchCarriers();
  }, []);

  // Initialize with selectedIds from API (only once)
  useEffect(() => {
    if (!initializedRef.current && selectedIds && selectedIds.length > 0) {
      console.log("📶 Carriers: Initial setup with selectedIds from API");
      setSelectedCarrierIds(new Set(selectedIds));
      initializedRef.current = true;
    }
  }, [selectedIds]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedCarrierIds);
    }
  }, [selectedCarrierIds, onSelectionChange]);

  useEffect(() => {
    if (onCarrierDataChange) {
      // Convert selected carrier IDs to the expected data format
      const carrierData = Array.from(selectedCarrierIds).map(id => {
        const carrier = feedData.find(item => item.id === id);
        return {
          id: id,
          name: carrier?.name || id,
          type: "carrier"
        };
      });
      onCarrierDataChange(carrierData);
    }
  }, [selectedCarrierIds, onCarrierDataChange, feedData]);
  const totalItems = feedData.length;

  const handleCarrierChange = (itemId: string) => {
    setSelectedCarrierIds((prev) => {
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
    setSelectedCarrierIds((prevSelected) => {
      if (prevSelected.size === totalItems && totalItems > 0) {
        return new Set();
      } else {
        return new Set(feedData.map((item) => item.id));
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedCarrierIds(new Set(feedData.map((item) => item.id)));
  };

  const handleClearAll = () => {
    setSelectedCarrierIds(new Set());
  };

  const allLoadedItemsSelected =
    selectedCarrierIds.size === totalItems && totalItems > 0;
  const noneLoadedItemsSelected = selectedCarrierIds.size === 0;
  const isIndeterminate =
    !allLoadedItemsSelected && !noneLoadedItemsSelected && totalItems > 0;

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  return (
    <div className="space-y-2">
      {/* <Label className="text-lg font-semibold block">Carriers</Label> */}

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
            <div className="font-semibold text-gray-900">Carriers</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-600">
              {selectedCarrierIds.size} selected
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
          <Label className="text-sm">Carrier List</Label>
          <div className="mt-1 rounded-md border border-gray-300 bg-white">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex w-full items-center justify-between px-3 py-2 text-left"
            >
              <div className="text-sm text-gray-900">
                {selectedCarrierIds.size > 0
                  ? `${selectedCarrierIds.size} selected`
                  : "Select carriers"}
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {selectedCarrierIds.size > 0 && (
              <div className="flex flex-wrap gap-2 px-3 pb-2">
                {Array.from(selectedCarrierIds)
                  .slice(0, chipsExpanded ? undefined : 3)
                  .map((id) => {
                    const item = feedData.find((x) => x.id === id);
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
                {selectedCarrierIds.size > 3 && (
                  <button
                    type="button"
                    onClick={() => setChipsExpanded((v) => !v)}
                    className="text-xs text-blue-700 hover:underline"
                  >
                    {chipsExpanded
                      ? "Show less"
                      : `View all (+${selectedCarrierIds.size - 3})`}
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
                    placeholder="Search carriers..."
                  />
                </div>
                <div className="max-h-56 overflow-auto">
                  {feedData
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
                          checked={selectedCarrierIds.has(item.id)}
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

      {selectedCarrierIds.size === 0 && totalItems > 0 && (
        <p className="text-sm text-yellow-600 mt-1">
          Note: No Carriers selected
        </p>
      )}

      {/* Debug: Show selected carrier data */}
      {/* {selectedCarrierIds.size > 0 && (
        <div className="p-2 bg-teal-50 rounded-md text-xs">
          <div className="font-medium text-teal-800 mb-1">
            Debug: Carrier Data ({selectedCarrierIds.size} carriers)
          </div>
          <div className="text-teal-700">
            {Array.from(selectedCarrierIds).map(id => {
              const carrier = feedData.find(item => item.id === id);
              return `${id}:${carrier?.name || id}`;
            }).join(", ")}
          </div>
        </div>
      )} */}
    </div>
  );
}
