import { useCallback, useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Location {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  bid_adjustment: number;
}

interface EditLocationTargetingProps {
  onSelectionChange?: (ids: Set<string>) => void;
  onDataChange?: (data: Location[]) => void;
  selectedIds?: Set<string>;
}

export default function EditLocationTargeting({
  onSelectionChange,
  onDataChange,
  selectedIds = new Set<string>(),
}: EditLocationTargetingProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(selectedIds);

  useEffect(() => {
    // Mock location data - Replace with API call in production
    const mockLocations = [
      { id: "us", name: "United States", type: "COUNTRY", enabled: true, bid_adjustment: 1.0 },
      { id: "de", name: "Germany", type: "COUNTRY", enabled: true, bid_adjustment: 1.0 },
      { id: "gb", name: "United Kingdom", type: "COUNTRY", enabled: true, bid_adjustment: 1.0 },
      { id: "fr", name: "France", type: "COUNTRY", enabled: true, bid_adjustment: 1.0 },
    ];
    setLocations(mockLocations);
  }, []);

  useEffect(() => {
    setSelectedLocations(selectedIds);
  }, [selectedIds]);

  const handleLocationToggle = useCallback((locationId: string) => {
    setSelectedLocations((prev) => {
      const next = new Set(prev);
      if (next.has(locationId)) {
        next.delete(locationId);
      } else {
        next.add(locationId);
      }
      
      // Prepare update data for parent component
      const updatedData = locations.filter(loc => next.has(loc.id));
      
      onSelectionChange?.(next);
      onDataChange?.(updatedData);
      return next;
    });
  }, [locations, onSelectionChange, onDataChange]);

  const handleBidAdjustment = useCallback((locationId: string, value: number) => {
    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === locationId ? { ...loc, bid_adjustment: value } : loc
      )
    );

    // Prepare updated data for parent component
    const updatedData = locations.map(loc => ({
      ...loc,
      bid_adjustment: loc.id === locationId ? value : loc.bid_adjustment
    }));
    
    onDataChange?.(updatedData.filter(loc => selectedLocations.has(loc.id)));
  }, [locations, selectedLocations, onDataChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Location Targeting</h3>
          <p className="text-sm text-gray-500">Select locations and adjust bids</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4">
          {locations.map((location) => (
            <div key={location.id} className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded">
              <input
                type="checkbox"
                checked={selectedLocations.has(location.id)}
                onChange={() => handleLocationToggle(location.id)}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <div className="font-medium">{location.name}</div>
                <div className="text-sm text-gray-500">{location.type}</div>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor={`bid-${location.id}`} className="text-sm">
                  Bid Adjustment
                </Label>
                <Input
                  id={`bid-${location.id}`}
                  type="number"
                  min="0"
                  step="0.1"
                  value={location.bid_adjustment}
                  onChange={(e) => handleBidAdjustment(location.id, parseFloat(e.target.value))}
                  className="w-20"
                  disabled={!selectedLocations.has(location.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}