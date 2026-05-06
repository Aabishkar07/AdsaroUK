"use client";

import { useRef, useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, X } from "lucide-react";

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
  const [open, setOpen] = useState(true); // Open by default
  const [query, setQuery] = useState("");
  const [chipsExpanded, setChipsExpanded] = useState(false);

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

  const handleSelectAll = () => {
    setSelectedDeviceIds(new Set(staticFeedData.map((item) => item.id)));
  };

  const handleClearAll = () => {
    setSelectedDeviceIds(new Set());
  };

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedDeviceIds);
    }
  }, [selectedDeviceIds]);

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
  }, [selectedDeviceIds]);

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  return (
    <div className="space-y-2 ">
      {/* <Label className="text-lg font-semibold block">Devices Type</Label> */}

      <div className="rounded-md border border-gray-300 bg-blue-50 p-3 w-full text-sm space-y-3 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600 rounded accent-blue-600"
              checked={allSelected}
              ref={masterCheckboxRef}
              onChange={handleMasterChange}
            />
            <div className="font-semibold text-gray-900">Devices</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-600">{selectedDeviceIds.size} selected</div>
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
          <Label className="text-sm">Device Types</Label>
          <div className="mt-1 rounded-md border border-gray-300 bg-white">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex w-full items-center justify-between px-3 py-2 text-left"
            >
              <div className="text-sm text-gray-900">
                {selectedDeviceIds.size > 0
                  ? `${selectedDeviceIds.size} selected`
                  : "Select device types"}
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {selectedDeviceIds.size > 0 && (
              <div className="flex flex-wrap gap-2 px-3 pb-2">
                {Array.from(selectedDeviceIds)
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
                          onClick={() => handleDeviceChange(id)}
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
                    onClick={() => setChipsExpanded((v) => !v)}
                    className="text-xs text-blue-700 hover:underline"
                  >
                    {chipsExpanded
                      ? "Show less"
                      : `View all (+${selectedDeviceIds.size - 3})`}
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
                    placeholder="Search device types..."
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
                        onClick={() => handleDeviceChange(item.id)}
                        className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-gray-50"
                      >
                        <div className="text-gray-900">{item.name}</div>
                        <input
                          type="checkbox"
                          checked={selectedDeviceIds.has(item.id)}
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

      {selectedDeviceIds.size === 0 && (
        <p className="text-sm text-yellow-600 mt-1">
          Note: No Devices selected
        </p>
      )}
    </div>
  );
}