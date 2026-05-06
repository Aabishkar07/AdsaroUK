"use client";

import { useRef, useState, useEffect } from "react";
import { Label } from "@/components/ui/label";

interface FeedData {
  id: string;
  name: string;
}

interface DeviceTargetingProps {
  selectedIds?: Set<string>; // Device types that should be selected from API
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onDeviceDataChange?: (deviceData: Array<{id: string, name: string, type: string}>) => void;
}

const staticFeedData: FeedData[] = [
  { id: "UNKNOWN", name: "UNKNOWN" },
  { id: "OTHER", name: "OTHER" },
  { id: "DESKTOP", name: "DESKTOP" },
  { id: "MOBILE", name: "MOBILE" },
  { id: "TABLET", name: "TABLET" },
  { id: "GAME_CONSOLE", name: "GAME_CONSOLE" },
  { id: "TV", name: "TV" },
  { id: "VR", name: "VR" },
];

export default function DeviceTargeting({
  selectedIds,
  onSelectionChange,
  onDeviceDataChange,
}: DeviceTargetingProps) {
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<Set<string>>(new Set());
  const masterCheckboxRef = useRef<HTMLInputElement | null>(null);

  const initializedRef = useRef(false);
  
  useEffect(() => {
    if (!initializedRef.current) {
      if (selectedIds && selectedIds.size > 0) {
        console.log("📱 DeviceTargeting: Initial setup with selectedIds from API");
        setSelectedDeviceIds(new Set(selectedIds));
      } else {
        // Create mode: select all device types by default
        const allIds = new Set(staticFeedData.map((item) => item.id));
        console.log("📱 DeviceTargeting: Create mode - selecting all device types by default", Array.from(allIds));
        setSelectedDeviceIds(allIds);
      }
      initializedRef.current = true;
    }
  }, [selectedIds]);
  
  const totalItems = staticFeedData.length;
  const allSelected = selectedDeviceIds.size === totalItems;
  const noneSelected = selectedDeviceIds.size === 0;
  const isIndeterminate = !allSelected && !noneSelected;

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

  const handleMasterChange = () => {
    setSelectedDeviceIds((prevSelected) => {
      if (prevSelected.size === totalItems) {
        return new Set();
      } else {
        return new Set(staticFeedData.map((item) => item.id));
      }
    });
  };

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedDeviceIds);
    }
  }, [selectedDeviceIds]); // Remove onSelectionChange from dependencies to prevent infinite loops

  useEffect(() => {
    if (onDeviceDataChange) {
      // Convert selected device IDs to the expected data format
      const deviceData = Array.from(selectedDeviceIds).map(id => {
        const device = staticFeedData.find(item => item.id === id);
        return {
          id: id,
          name: device?.name || id,
          type: "device_type"
        };
      });
      onDeviceDataChange(deviceData);
    }
  }, [selectedDeviceIds]); // Remove onDeviceDataChange from dependencies to prevent infinite loops

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  return (
    <div className="space-y-2 ">
      <Label className="text-lg font-semibold block">Devices Type</Label>

      <div className="border border-gray-300 rounded-md w-full  text-sm bg-white">
        {/* Header */}
        <div className="flex items-center py-2 px-3 border-b bg-gray-100 font-bold">
          <div className=" flex items-center justify-center pr-2">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600 rounded"
              checked={allSelected}
              ref={masterCheckboxRef}
              onChange={handleMasterChange}
            />
          </div>
          <div className="flex-grow">
            Devices ({selectedDeviceIds.size} selected)
          </div>
        </div>

        {/* Device Rows */}
        {staticFeedData.map((item) => (
          <div
            key={item.id}
            className="flex items-center py-2 px-3 border-b hover:bg-gray-100"
          >
            <div className="w-[30px] flex items-center justify-center pr-2">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                checked={selectedDeviceIds.has(item.id)}
                onChange={() => handleDeviceChange(item.id)}
              />
            </div>
            <div className="flex-grow">{item.name}</div>
          </div>
        ))}
      </div>

      {selectedDeviceIds.size === 0 && (
        <p className="text-sm text-yellow-600 mt-1">
          Note: No Devices selected
        </p>
      )}

      {/* Debug: Show selected device data */}
      {selectedDeviceIds.size > 0 && (
        <div className="p-2 bg-orange-50 rounded-md text-xs">
          <div className="font-medium text-orange-800 mb-1">
            Debug: Device Data ({selectedDeviceIds.size} devices)
          </div>
          <div className="text-orange-700">
            {Array.from(selectedDeviceIds).map(id => {
              const device = staticFeedData.find(item => item.id === id);
              return `${id}:${device?.name || id}`;
            }).join(", ")}
          </div>
        </div>
      )}
    </div>
  );
}