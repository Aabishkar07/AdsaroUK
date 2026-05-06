
"use client";

import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/context";
import axios from "axios";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const itemsToDisplay = feedData.slice(startIndex, startIndex + itemsPerPage);
  const totalItems = feedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

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

  const goToFirstPage = () => currentPage !== 1 && setCurrentPage(1);
  const goToPreviousPage = () =>
    currentPage > 1 && setCurrentPage((prev) => prev - 1);
  const goToNextPage = () =>
    currentPage < totalPages && setCurrentPage((prev) => prev + 1);
  const goToLastPage = () =>
    currentPage !== totalPages && setCurrentPage(totalPages);

  const handleRefresh = async () => {
    await fetchCarriers();
    setCurrentPage(1);
  };

  return (
    <div className="space-y-2">
      <Label className="text-lg font-semibold block">Carriers</Label>

      <div className="border border-gray-300 rounded-md w-full  text-sm bg-white">
        {/* Header */}
        <div className="flex items-center py-2 px-3 border-b bg-gray-100 font-bold">
          <div className=" flex items-center justify-center pr-2">
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
            Carriers ({selectedCarrierIds.size} selected)
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
                  checked={selectedCarrierIds.has(item.id)}
                  onChange={() => handleCarrierChange(item.id)}
                />
              </div>
              <div className="flex-grow">{item.name}</div>
            </div>
          ))
        )}

        {/* Footer: Pagination + Refresh */}
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
