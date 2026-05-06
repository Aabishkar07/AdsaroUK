"use client";

/**
 * Browser Targeting Component
 * 
 * This component handles browser targeting selection and provides browser data
 * with bid adjustments and enabled status for the consolidated targeting API.
 * 
 * Browser API Structure:
 * "BrowserNew": {
 *   "mode": "UPDATE",
 *   "edit": [
 *     {"id": 4, "bid_adjustment": 0.5},
 *     {"id": 5, "enabled": true},
 *     {"id": 6, "enabled": true, "bid_adjustment": 1.5}
 *   ]
 * }
 * 
 * Where:
 * - "id": Browser ID from the API
 * - "enabled": Boolean to enable/disable targeting for that browser
 * - "bid_adjustment": Numeric value for bid adjustment (0.5 = 50% reduction, 1.5 = 50% increase)
 */

import { useEffect, useMemo, useRef, useState } from "react";
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
  type: string;
}

interface DeviceTargetingProps {
  selectedIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onDataChange?: (browserData: Array<{id: string, name: string, type: string, bid_adjustment?: number, enabled?: boolean}>) => void;
  disabledIds?: Set<string>; // IDs that should be excluded from selection
  disabledTypes?: Set<string>; // Browser types that should be excluded from selection
}

export default function BrowserTargeting({
  selectedIds,
  onSelectionChange,
  onDataChange,
  disabledIds,
  disabledTypes,
}: DeviceTargetingProps) {
  const [feedData, setFeedData] = useState<FeedData[]>([]);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [typeOpen, setTypeOpen] = useState(true); // Open by default
  const [browserOpen, setBrowserOpen] = useState(false);
  const [typeQuery, setTypeQuery] = useState("");
  const [browserQuery, setBrowserQuery] = useState("");
  const [typeChipsExpanded, setTypeChipsExpanded] = useState(false);
  const [browserChipsExpanded, setBrowserChipsExpanded] = useState(false);

  const auth = useAuth();

  const allowedFeedData = useMemo(() => {
    const disabledIdSet = disabledIds || new Set<string>();
    const disabledTypeSet = disabledTypes || new Set<string>();
    return feedData.filter((b) => {
      if (disabledIdSet.has(b.id)) return false;
      if (disabledTypeSet.has(b.type)) return false;
      return true;
    });
  }, [feedData, disabledIds, disabledTypes]);

  const typeOptions = useMemo(() => {
    const types = new Set<string>();
    allowedFeedData.forEach((b) => types.add(b.type));
    return Array.from(types).sort((a, b) => a.localeCompare(b));
  }, [allowedFeedData]);

  const filteredTypeOptions = useMemo(() => {
    const q = typeQuery.trim().toLowerCase();
    if (!q) return typeOptions;
    return typeOptions.filter((t) => t.toLowerCase().includes(q));
  }, [typeOptions, typeQuery]);

  const browserOptions = useMemo(() => {
    if (selectedTypes.size === 0) return [];
    return allowedFeedData
      .filter((b) => selectedTypes.has(b.type))
      .filter((b) => {
        const q = browserQuery.trim().toLowerCase();
        if (!q) return true;
        return (
          b.name.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          b.type.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allowedFeedData, selectedTypes, browserQuery]);

  // Initialize with selectedIds from props (for edit mode)
  useEffect(() => {
    console.log("🌐 BrowserTargeting useEffect triggered:");
    console.log("  - selectedIds:", selectedIds ? Array.from(selectedIds) : "undefined");
    console.log("  - selectedIds.size:", selectedIds?.size);
    console.log("  - feedData.length:", feedData.length);
    console.log("  - disabledIds:", disabledIds ? Array.from(disabledIds) : "undefined");
    console.log("  - disabledTypes:", disabledTypes ? Array.from(disabledTypes) : "undefined");
    
    if (selectedIds && selectedIds.size > 0) {
      console.log("🌐 BrowserTargeting: Using provided selectedIds");
      setSelectedDeviceIds(new Set(selectedIds));
    } else if (feedData.length > 0 && (!selectedIds || selectedIds.size === 0)) {
      // For create/edit mode with no specific selection, select all browsers by default
      // BUT exclude any browsers that are explicitly disabled via disabledIds prop
      console.log("🌐 BrowserTargeting: Auto-selecting all browsers except disabled ones");
      const allBrowserIds = new Set(feedData.map(item => item.id));
      
      // Remove disabled browsers from the selection
      if (disabledIds && disabledIds.size > 0) {
        console.log("🌐 BrowserTargeting: Before exclusion - allBrowserIds:", Array.from(allBrowserIds));
        console.log("🌐 BrowserTargeting: Disabled IDs to exclude:", Array.from(disabledIds));
        
        // First try direct ID matching
        disabledIds.forEach(disabledId => {
          const hadId = allBrowserIds.has(disabledId);
          allBrowserIds.delete(disabledId);
          console.log(`🌐 BrowserTargeting: Removing ID "${disabledId}" - existed: ${hadId}`);
        });
        
        // Also remove browsers by type using dynamic disabled types from API
        if (disabledTypes && disabledTypes.size > 0) {
          feedData.forEach(browser => {
            if (disabledTypes.has(browser.type)) {
              const hadId = allBrowserIds.has(browser.id);
              allBrowserIds.delete(browser.id);
              console.log(`🌐 BrowserTargeting: Removing ${browser.type} browser ID "${browser.id}" - existed: ${hadId}`);
            }
          });
        }
        
        console.log("🌐 BrowserTargeting: After exclusion - allBrowserIds:", Array.from(allBrowserIds));
        console.log("🌐 BrowserTargeting: Excluded disabled browsers:", Array.from(disabledIds));
      } else {
        console.log("🌐 BrowserTargeting: No disabled browsers to exclude");
      }
      
      setSelectedDeviceIds(allBrowserIds);
      console.log("🌐 BrowserTargeting: Final selected browsers:", Array.from(allBrowserIds));
      console.log("🌐 BrowserTargeting: Total browsers available:", feedData.length);
      console.log("🌐 BrowserTargeting: Total browsers selected:", allBrowserIds.size);
    } else {
      console.log("🌐 BrowserTargeting: No action taken - waiting for feedData or selectedIds");
    }
  }, [selectedIds, feedData, disabledIds, disabledTypes]);

  const fetchBrowsers = async () => {
    if (!auth?.token) return;
    console.log("🌐 BrowserTargeting: Starting fetchBrowsers API call");
    try {
      const response = await axios.get(
        `https://panel.adsaro.com/advertiser/api/BrowserVersions/?version=4&token=${auth.token}`
      );
      const rowsObject = response?.data?.response?.rows;
      if (rowsObject) {
        const rowsArray = Object.values(rowsObject) as FeedData[];
        console.log("🌐 BrowserTargeting: Fetched browser data:", rowsArray.length, "browsers");
        console.log("🌐 BrowserTargeting: Sample browser IDs:", rowsArray.slice(0, 10).map(b => b.id));
        console.log("🌐 BrowserTargeting: All UNKNOWN browsers:", rowsArray.filter(b => b.type === 'UNKNOWN').map(b => ({id: b.id, name: b.name})));
        console.log("🌐 BrowserTargeting: All OTHER browsers:", rowsArray.filter(b => b.type === 'OTHER').map(b => ({id: b.id, name: b.name})));
        setFeedData(rowsArray);
        // Don't reset selectedDeviceIds here - let the useEffect handle selection logic
      } else {
        console.log("🌐 BrowserTargeting: No browser data in API response");
        setFeedData([]);
        // Don't reset selectedDeviceIds here either
      }
    } catch (error) {
      console.error("🌐 BrowserTargeting: Fetch error:", error);
      setFeedData([]);
      // Don't reset selectedDeviceIds on error either
    }
  };

  useEffect(() => {
    console.log("🌐 BrowserTargeting: fetchBrowsers useEffect triggered");
    fetchBrowsers();
  }, []);

  useEffect(() => {
    if (allowedFeedData.length === 0) return;
    setSelectedTypes((prev) => {
      if (prev.size > 0) return prev;
      const types = new Set<string>();
      allowedFeedData.forEach((b) => {
        if (selectedDeviceIds.has(b.id)) types.add(b.type);
      });
      return types;
    });
  }, [allowedFeedData, selectedDeviceIds]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedDeviceIds);
    }

    // Call onDataChange with the selected browser data
    if (onDataChange) {
      const selectedBrowserData = Array.from(selectedDeviceIds).map(id => {
        // Find the browser data from the feed data
        const browser = allowedFeedData.find(item => item.id === id);
        
        // Set default bid adjustments for common browsers (same pattern as OS)
        let bidAdjustment = 1.0; // default
        const enabled = true; // default

        if (browser?.type === 'CHROME') {
          bidAdjustment = 0.8; // 20% reduction
        } else if (browser?.type === 'FIREFOX') {
          bidAdjustment = 1.2; // 20% increase
        } else if (browser?.type === 'SAFARI') {
          bidAdjustment = 1.5; // 50% increase
        } else if (browser?.type === 'EDGE') {
          bidAdjustment = 0.9; // 10% reduction
        } else if (browser?.type === 'OPERA') {
          bidAdjustment = 1.1; // 10% increase
        }

        return {
          id: id,
          name: browser?.name || id,
          type: browser?.type || 'UNKNOWN',
          bid_adjustment: bidAdjustment,
          enabled: enabled
        };
      });

      onDataChange(selectedBrowserData);
    }
  }, [selectedDeviceIds, onSelectionChange, onDataChange, feedData]);

  const totalItems = allowedFeedData.length;
  const allSelected = selectedDeviceIds.size === totalItems && totalItems > 0;
  const noneSelected = selectedDeviceIds.size === 0;
  const isIndeterminate = !allSelected && !noneSelected && totalItems > 0;

  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleMasterChange = () => {
    if (allSelected) {
      setSelectedDeviceIds(new Set());
      setSelectedTypes(new Set());
      return;
    }
    const next = new Set(allowedFeedData.map((b) => b.id));
    setSelectedDeviceIds(next);
    setSelectedTypes(new Set(typeOptions));
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prevTypes) => {
      const nextTypes = new Set(prevTypes);
      if (nextTypes.has(type)) {
        nextTypes.delete(type);
      } else {
        nextTypes.add(type);
      }

      setSelectedDeviceIds((prevIds) => {
        const nextIds = new Set(prevIds);
        const typeItems = allowedFeedData.filter((b) => b.type === type);
        const allTypeSelected = typeItems.every((b) => nextIds.has(b.id));
        if (allTypeSelected) {
          typeItems.forEach((b) => nextIds.delete(b.id));
        } else {
          typeItems.forEach((b) => nextIds.add(b.id));
        }
        return nextIds;
      });

      return nextTypes;
    });
  };

  const toggleBrowser = (id: string) => {
    const browser = allowedFeedData.find((b) => b.id === id);
    if (!browser) return;
    setSelectedDeviceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      next.add(browser.type);
      return next;
    });
  };

  const removeChip = (kind: "type" | "browser", id: string) => {
    if (kind === "type") {
      setSelectedTypes((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setSelectedDeviceIds((prev) => {
        const next = new Set(prev);
        allowedFeedData
          .filter((b) => b.type === id)
          .forEach((b) => next.delete(b.id));
        return next;
      });
      return;
    }
    setSelectedDeviceIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {/* <Label className="text-lg font-semibold block">Browser Targeting</Label> */}

      <div className="rounded-md border border-gray-300 bg-blue-50 p-3 w-full text-sm space-y-3 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {totalItems > 0 && (
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 rounded accent-blue-600"
                checked={allSelected}
                ref={masterCheckboxRef}
                onChange={handleMasterChange}
              />
            )}
            <div className="font-semibold text-gray-900">Browsers</div>
          </div>
          <div className="text-xs text-gray-600">
            {selectedDeviceIds.size} selected
          </div>
        </div>

        <div>
          <Label className="text-sm">Browser Types</Label>
          <div className="mt-1 rounded-md border border-gray-300 bg-white">
            <button
              type="button"
              onClick={() => setTypeOpen((v) => !v)}
              className="flex w-full items-center justify-between px-3 py-2 text-left"
            >
              <div className="text-sm text-gray-900">
                {selectedTypes.size > 0
                  ? `${selectedTypes.size} selected`
                  : "Select browser types"}
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {selectedTypes.size > 0 && (
              <div className="flex flex-wrap gap-2 px-3 pb-2">
                {Array.from(selectedTypes)
                  .slice(0, typeChipsExpanded ? undefined : 3)
                  .map((t) => (
                    <div
                      key={t}
                      className="flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-xs text-white"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => removeChip("type", t)}
                        className="rounded-full bg-white/20 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                {selectedTypes.size > 3 && (
                  <button
                    type="button"
                    onClick={() => setTypeChipsExpanded((v) => !v)}
                    className="text-xs text-blue-700 hover:underline"
                  >
                    {typeChipsExpanded
                      ? "Show less"
                      : `View all (+${selectedTypes.size - 3})`}
                  </button>
                )}
              </div>
            )}

            {typeOpen && (
              <div className="border-t border-gray-200 p-3">
                <div className="relative mb-2">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    value={typeQuery}
                    onChange={(e) => setTypeQuery(e.target.value)}
                    className="pl-8"
                    placeholder="Search browser types..."
                  />
                </div>
                <div className="max-h-56 overflow-auto">
                  {filteredTypeOptions.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-500">No results</div>
                  ) : (
                    filteredTypeOptions.map((t) => {
                      const checked = selectedTypes.has(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleType(t)}
                          className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-gray-50"
                        >
                          <div className="text-gray-900">{t}</div>
                          <input type="checkbox" checked={checked} readOnly />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <Label className="text-sm">Browsers</Label>
          <div className="mt-1 rounded-md border border-gray-300 bg-white">
            <button
              type="button"
              disabled={selectedTypes.size === 0}
              onClick={() => setBrowserOpen((v) => !v)}
              className="flex w-full items-center justify-between px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="text-sm text-gray-900">
                {selectedTypes.size === 0
                  ? "Select browser types first"
                  : `${Array.from(selectedDeviceIds).length} selected`}
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {selectedDeviceIds.size > 0 && (
              <div className="flex flex-wrap gap-2 px-3 pb-2">
                {Array.from(selectedDeviceIds)
                  .slice(0, browserChipsExpanded ? undefined : 3)
                  .map((id) => {
                    const item = allowedFeedData.find((x) => x.id === id);
                    if (!item) return null;
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-xs text-white"
                      >
                        <span>{item.name}</span>
                        <button
                          type="button"
                          onClick={() => removeChip("browser", id)}
                          className="rounded-full bg-white/20 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                {selectedDeviceIds.size > 3 && (
                  <button
                    type="button"
                    onClick={() => setBrowserChipsExpanded((v) => !v)}
                    className="text-xs text-blue-700 hover:underline"
                  >
                    {browserChipsExpanded
                      ? "Show less"
                      : `View all (+${selectedDeviceIds.size - 3})`}
                  </button>
                )}
              </div>
            )}

            {browserOpen && (
              <div className="border-t border-gray-200 p-3">
                <div className="relative mb-2">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    value={browserQuery}
                    onChange={(e) => setBrowserQuery(e.target.value)}
                    className="pl-8"
                    placeholder="Search browsers..."
                  />
                </div>
                <div className="max-h-56 overflow-auto">
                  {browserOptions.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-500">No results</div>
                  ) : (
                    browserOptions.map((b) => {
                      const checked = selectedDeviceIds.has(b.id);
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => toggleBrowser(b.id)}
                          className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-gray-50"
                        >
                          <div className="text-gray-900">{b.name}</div>
                          <input type="checkbox" checked={checked} readOnly />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedDeviceIds(new Set());
              setSelectedTypes(new Set());
            }}
          >
            Clear All
          </Button>
        </div>
      </div>

      {selectedDeviceIds.size === 0 && totalItems > 0 && (
        <p className="text-sm text-yellow-600 mt-1">
          Note: No browsers selected. Your campaign may not receive traffic.
        </p>
      )}
    </div>
  );
}