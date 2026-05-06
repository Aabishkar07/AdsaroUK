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

import { useEffect, useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/context";
import axios from "axios";
import { ChevronDown, ChevronRight } from "lucide-react";

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
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 100; // adjust as needed

  const auth = useAuth();

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
        setExpandedTypes(new Set()); // collapsed by default
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
    if (onSelectionChange) {
      onSelectionChange(selectedDeviceIds);
    }

         // Call onDataChange with the selected browser data
     if (onDataChange) {
       const selectedBrowserData = Array.from(selectedDeviceIds).map(id => {
         // Find the browser data from the feed data
         const browser = feedData.find(item => item.id === id);
         
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

  const groupByType = (data: FeedData[]) =>
    data.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    }, {} as Record<string, FeedData[]>);

  // Pagination calculations
  const totalItems = feedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const itemsToDisplay = feedData.slice(startIndex, startIndex + itemsPerPage);

  // Group only the current page data
  const groupedData = groupByType(itemsToDisplay);

  // Selection state for the whole dataset (not only page)
  const allSelected = selectedDeviceIds.size === totalItems && totalItems > 0;
  const noneSelected = selectedDeviceIds.size === 0;
  const isIndeterminate = !allSelected && !noneSelected && totalItems > 0;

  // Refs for checkboxes to set indeterminate property
  const masterCheckboxRef = useRef<HTMLInputElement>(null);
  const typeCheckboxRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Update master checkbox indeterminate state on selection changes
  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  // Update each type checkbox indeterminate state on selection changes
  useEffect(() => {
    Object.entries(groupedData).forEach(([type]) => {
      const items = feedData.filter((item) => item.type === type);
      const allTypeSelected = items.every((item) =>
        selectedDeviceIds.has(item.id)
      );
      const someTypeSelected =
        items.some((item) => selectedDeviceIds.has(item.id)) && !allTypeSelected;

      const checkbox = typeCheckboxRefs.current[type];
      if (checkbox) {
        checkbox.indeterminate = someTypeSelected;
      }
    });
  }, [selectedDeviceIds, groupedData, feedData]);

  const handleMasterChange = () => {
    if (allSelected) {
      setSelectedDeviceIds(new Set());
    } else {
      setSelectedDeviceIds(new Set(feedData.map((item) => item.id)));
    }
  };

  const handleTypeCheckbox = (type: string) => {
    const items = feedData.filter((item) => item.type === type);
    const allTypeSelected = items.every((item) =>
      selectedDeviceIds.has(item.id)
    );
    setSelectedDeviceIds((prev) => {
      const updated = new Set(prev);
      if (allTypeSelected) {
        items.forEach((item) => updated.delete(item.id));
      } else {
        items.forEach((item) => updated.add(item.id));
      }
      return updated;
    });
  };
  const handleDeviceChange = (itemId: string) => {
    setSelectedDeviceIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(itemId)) {
        updated.delete(itemId);
      } else {
        updated.add(itemId);
      }
      return updated;
    });
  };

  const toggleType = (type: string) => {
    setExpandedTypes((prev) => {
      const updated = new Set(prev);
      if (updated.has(type)) {
        updated.delete(type);
      } else {
        updated.add(type);
      }
      return updated;
    });
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(1, prev - 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  const goToLastPage = () => setCurrentPage(totalPages);

  const handleRefresh = async () => {
    await fetchBrowsers();
    setCurrentPage(1);
  };

  return (
    <div className="space-y-2">
      <Label className="text-lg font-semibold block">Browser Targeting</Label>

      <div className="border border-gray-300 rounded-md w-full md:w-80 text-sm bg-white">
        {/* Global Header */}
        <div className="flex items-center py-2 px-3 border-b bg-gray-100 font-bold">
          <div className="w-[30px] flex items-center justify-center pr-2">
            {totalItems > 0 && (
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                checked={allSelected}
                ref={masterCheckboxRef}
                onChange={handleMasterChange}
              />
            )}
          </div>
          <div className="flex-grow">
            Browser Type ({selectedDeviceIds.size} selected)
          </div>
        </div>

        {/* Grouped Data */}
        {totalItems === 0 ? (
          <div className="py-2 px-3 text-gray-500 italic">
            No data available.
          </div>
        ) : (
          Object.entries(groupedData).map(([type, items]) => {
            const isExpanded = expandedTypes.has(type);
            const allTypeSelected = feedData
              .filter((item) => item.type === type)
              .every((item) => selectedDeviceIds.has(item.id));

            return (
              <div key={type} className="border-b">
                {/* Group Header */}
                <div
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                  onClick={() => toggleType(type)}
                >
                  <div className="flex items-center space-x-2">
                    <div className="text-gray-600 hover:text-black">
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600 rounded"
                      checked={allTypeSelected}
                      ref={(el) => {
                        // Fix: assign ref but do NOT return anything
                        typeCheckboxRefs.current[type] = el;
                      }}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleTypeCheckbox(type);
                      }}
                    />
                    <span className="font-semibold">{type}</span>
                  </div>
                </div>

                {/* Sub-items */}
                {isExpanded && (
                  <div className="pl-8 border-l bg-white">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center py-2 px-2 hover:bg-gray-50 border-t"
                      >
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-blue-600 rounded mr-2"
                          checked={selectedDeviceIds.has(item.id)}
                          onChange={() => handleDeviceChange(item.id)}
                        />
                        <div className="flex-grow">{item.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Pagination and Refresh Footer */}
        <div className="flex items-center py-2 px-3 border-t justify-between text-xs bg-gray-100">
          <div className="pr-3">
            {totalItems > 0
              ? `${startIndex + 1}-${Math.min(
                  startIndex + itemsToDisplay.length,
                  totalItems
                )} of ${totalItems}`
              : "0 of 0"}
          </div>
          <div className="flex gap-1">
            <div
              role="button"
              tabIndex={0}
              onClick={goToFirstPage}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && goToFirstPage()
              }
              className={`px-2 text-lg cursor-pointer select-none ${
                currentPage === 1
                  ? "text-gray-400 pointer-events-none"
                  : "text-black hover:bg-gray-200"
              }`}
              aria-label="First Page"
            >
              «
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={goToPreviousPage}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && goToPreviousPage()
              }
              className={`px-2 text-lg cursor-pointer select-none ${
                currentPage === 1
                  ? "text-gray-400 pointer-events-none"
                  : "text-black hover:bg-gray-200"
              }`}
              aria-label="Previous Page"
            >
              ‹
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={goToNextPage}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && goToNextPage()
              }
              className={`px-2 text-lg cursor-pointer select-none ${
                currentPage === totalPages || totalPages === 0
                  ? "text-gray-400 pointer-events-none"
                  : "text-black hover:bg-gray-200"
              }`}
              aria-label="Next Page"
            >
              ›
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={goToLastPage}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && goToLastPage()
              }
              className={`px-2 text-lg cursor-pointer select-none ${
                currentPage === totalPages || totalPages === 0
                  ? "text-gray-400 pointer-events-none"
                  : "text-black hover:bg-gray-200"
              }`}
              aria-label="Last Page"
            >
              »
            </div>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={handleRefresh}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && handleRefresh()
            }
            className={`ml-auto px-2 cursor-pointer select-none ${
              totalItems === 0
                ? "text-gray-400 pointer-events-none"
                : "text-black hover:bg-gray-200"
            }`}
            aria-label="Refresh"
          >
            ↻
          </div>
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