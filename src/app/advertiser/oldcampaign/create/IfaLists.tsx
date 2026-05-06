"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/context";
import { Search, Filter } from "lucide-react";

interface IfaList {
  id: string;
  name: string;
  timestamp: string;
  ifas?: string;
}

type ApiRow = {
  id?: string | number;
  ifa_list_id?: string | number;
  name?: string;
  timestamp?: string;
  created_at?: string;
  ifas?: string;
  ifa_bundles?: string;
};

interface IfaListsProps {
  onSelectionChange: (selectedIds: Set<string>) => void;
  onIfaListDataChange: (ifaListData: Array<{ id: string; name: string; type: string }>) => void;
  selectedIds?: string[]; // IFA List IDs from API
}

export default function IfaLists({ onSelectionChange, onIfaListDataChange, selectedIds }: IfaListsProps) {
  const [ifaLists, setIfaLists] = useState<IfaList[]>([]);
  const [selectedIfaLists, setSelectedIfaLists] = useState<Set<string>>(new Set(selectedIds));
  const [searchTerm, setSearchTerm] = useState("");
  const [listTypeFilter, setListTypeFilter] = useState("My Lists");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auth = useAuth();

  // Fetch IFA lists data
  const fetchIfaLists = useCallback(async () => {
    if (!auth.token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://panel.adsaro.com/advertiser/api/IfaList/?version=4&token=${auth.token}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === "OK" && result.response && result.response.rows) {
        const ifaListData = Object.values(result.response.rows as Record<string, ApiRow>).map((row) => ({
          id: String(row.id ?? row.ifa_list_id ?? ""),
          name: row.name ?? "",
          timestamp: row.timestamp ?? row.created_at ?? "",
          ifas: row.ifas ?? row.ifa_bundles ?? "",
        }));
        
        setIfaLists(ifaListData);
        
        // Update parent component with IFA list data
        const ifaListDataForParent = ifaListData.map(ifa => ({
          id: ifa.id,
          name: ifa.name,
          type: "ifa_list"
        }));
        onIfaListDataChange(ifaListDataForParent);

        // Default-select all in create mode (no selectedIds provided)
        if (!selectedIds || selectedIds.length === 0) {
          const allIds = new Set(ifaListData.map((ifa) => ifa.id));
          setSelectedIfaLists(allIds);
          onSelectionChange(allIds);
        }
      } else {
        console.warn("No IFA lists data found or unexpected response format:", result);
        setIfaLists([]);
      }
    } catch (err) {
      console.error("Error fetching IFA lists:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch IFA lists");
      setIfaLists([]);
    } finally {
      setLoading(false);
    }
  }, [auth.token, onIfaListDataChange]);

  // Load IFA lists on component mount
  useEffect(() => {
    fetchIfaLists();
  }, [fetchIfaLists]);

  // Initialize with selectedIds from API
  useEffect(() => {
    if (selectedIds && selectedIds.length > 0) {
      console.log("📱 IfaLists: Setting selectedIds from API:", selectedIds);
      setSelectedIfaLists(new Set(selectedIds));
    }
  }, [selectedIds]);

  // Handle IFA list selection
  const handleIfaListSelection = useCallback((ifaListId: string, checked: boolean) => {
    const newSelection = new Set(selectedIfaLists);
    
    if (checked) {
      newSelection.add(ifaListId);
    } else {
      newSelection.delete(ifaListId);
    }
    
    setSelectedIfaLists(newSelection);
    onSelectionChange(newSelection);
  }, [selectedIfaLists, onSelectionChange]);

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = new Set(ifaLists.map(ifa => ifa.id));
      setSelectedIfaLists(allIds);
      onSelectionChange(allIds);
    } else {
      setSelectedIfaLists(new Set());
      onSelectionChange(new Set());
    }
  }, [ifaLists, onSelectionChange]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setListTypeFilter("My Lists");
    setSelectedFilter("All");
    setSearchTerm("");
  }, []);

  // Filter IFA lists based on search and filters
  const filteredIfaLists = ifaLists.filter(ifa => {
    const matchesSearch = ifa.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         String(ifa.id).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesListType = listTypeFilter === "My Lists" || listTypeFilter === "All";
    const matchesSelected = selectedFilter === "All" || 
                           (selectedFilter === "Selected" && selectedIfaLists.has(ifa.id)) ||
                           (selectedFilter === "Unselected" && !selectedIfaLists.has(ifa.id));
    
    return matchesSearch && matchesListType && matchesSelected;
  });

  // Get selected count
  const selectedCount = selectedIfaLists.size;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>IFA Lists</span>
          {selectedCount > 0 && (
            <span className="text-sm font-normal text-gray-500">
              ({selectedCount} selected)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search IFA lists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            {/* <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">List Type:</span>
              <div className="flex items-center gap-1 bg-gray-100 rounded-md px-2 py-1">
                <span className="text-sm">{listTypeFilter}</span>
                <button
                  onClick={() => setListTypeFilter("My Lists")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Selected:</span>
              <div className="flex items-center gap-1 bg-gray-100 rounded-md px-2 py-1">
                <span className="text-sm">{selectedFilter}</span>
                <button
                  onClick={() => setSelectedFilter("All")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div> */}
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Selected Count */}
        <div className="text-sm text-gray-600">
          Selected: {selectedCount} items
        </div>

        {/* IFA Lists Table */}
        <div className="border rounded-lg">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedCount === ifaLists.length && ifaLists.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=checked]:bg-blue-600"
                />
                <span className="text-sm font-medium">Select All</span>
              </div>
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading IFA lists...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : filteredIfaLists.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm || listTypeFilter !== "My Lists" || selectedFilter !== "All"
                  ? "No IFA lists match the current filters"
                  : "No IFA lists available"}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 w-12">
                      <Checkbox className="invisible" />
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ID</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIfaLists.map((ifa) => (
                    <tr key={ifa.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <Checkbox
                          checked={selectedIfaLists.has(ifa.id)}
                          onCheckedChange={(checked) => 
                            handleIfaListSelection(ifa.id, checked === true)
                          }
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{ifa.id}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{ifa.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          onClick={fetchIfaLists}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Refreshing..." : "Refresh IFA Lists"}
        </Button>
      </CardContent>
    </Card>
  );
}