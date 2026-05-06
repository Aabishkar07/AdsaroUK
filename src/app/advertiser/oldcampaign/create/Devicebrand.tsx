
"use client";

import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const masterCheckboxRef = useRef<HTMLInputElement | null>(null);
  const initializedRef = useRef(false);

  const feedData = staticFeedData;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const itemsToDisplay = feedData.slice(startIndex, startIndex + itemsPerPage);
  const totalItems = feedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

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

  const goToFirstPage = () => currentPage !== 1 && setCurrentPage(1);
  const goToPreviousPage = () =>
    currentPage > 1 && setCurrentPage((prev) => prev - 1);
  const goToNextPage = () =>
    currentPage < totalPages && setCurrentPage((prev) => prev + 1);
  const goToLastPage = () =>
    currentPage !== totalPages && setCurrentPage(totalPages);

  const handleRefresh = () => {
    setselectedDeviceBrand(new Set(feedData.map((item) => item.id)));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-2">
      <Label className="text-lg font-semibold block">Device Brand</Label>

      <div className="border border-gray-300 rounded-md w-full  text-sm bg-white">
        {/* Header */}
        <div className="flex items-center py-2 px-3 border-b bg-gray-100 font-bold">
          <div className="flex items-center justify-center pr-2">
            {totalItems > 0 && (
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                checked={allLoadedItemsSelected}
                ref={masterCheckboxRef}
                onChange={handleMasterChange}
              />
            )}
          </div>
          <div className="flex-grow">
            Device Brand ({selectedDeviceBrand.size} selected)
          </div>
        </div>

        {/* Data Rows */}
        {totalItems === 0 ? (
          <div className="py-2 px-3 text-gray-500 italic">
            No data available.
          </div>
        ) : (
          itemsToDisplay.map((item) => (
            <div
              key={item.id}
              className="flex items-center py-2 px-3 border-b hover:bg-gray-100"
            >
              <div className="w-[30px] flex items-center justify-center pr-2">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600 rounded"
                  checked={selectedDeviceBrand.has(item.id)}
                  onChange={() => handleCarrierChange(item.id)}
                />
              </div>
              <div className="flex-grow">{item.name}</div>
            </div>
          ))
        )}

        {/* Footer */}
        <div className="flex items-center py-2 px-3 border-t justify-between text-xs bg-gray-100">
          <div className="pr-3">
            {totalItems > 0
              ? `${startIndex + 1}-${Math.min(
                  startIndex + itemsToDisplay.length,
                  totalItems
                )} of ${totalItems}`
              : "0 of 0"}
          </div>
          <div className="flex gap-1 text-blue-600">
            <div
              className={`px-2 text-lg cursor-pointer ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={goToFirstPage}
              title="First Page"
            >
              «
            </div>
            <div
              className={`px-2 text-lg cursor-pointer ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={goToPreviousPage}
              title="Previous Page"
            >
              ‹
            </div>
            <div
              className={`px-2 text-lg cursor-pointer ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={goToNextPage}
              title="Next Page"
            >
              ›
            </div>
            <div
              className={`px-2 text-lg cursor-pointer ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={goToLastPage}
              title="Last Page"
            >
              »
            </div>
          </div>
          <div
            className={`ml-auto px-2 cursor-pointer ${
              totalItems === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={totalItems > 0 ? handleRefresh : undefined}
            title="Refresh"
          >
            ↻
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
