
"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/context";
import { Search, Filter} from "lucide-react";

interface IpList {
  id: string;
  name: string;
  readonly: string;
  token: string;
  expires: string;
}

type ApiRow = {
  id?: string | number;
  ip_list_id?: string | number;
  name?: string;
  readonly?: string;
  token?: string;
  expires?: string;
  expires_at?: string;
};

interface IpListsProps {
  onSelectionChange: (selectedIds: Set<string>) => void;
  onIpListDataChange: (ipListData: Array<{ id: string; name: string; type: string }>) => void;
  selectedIds?: string[]; // IP List IDs from API
}

export default function IpLists({ onSelectionChange, onIpListDataChange, selectedIds }: IpListsProps) {
  const [ipLists, setIpLists] = useState<IpList[]>([]);
  const [selectedIpLists, setSelectedIpLists] = useState<Set<string>>(new Set(selectedIds?.map(id => id) ?? []));
  const [searchTerm, setSearchTerm] = useState("");
  const [listTypeFilter, setListTypeFilter] = useState("My Lists");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auth = useAuth();

  // Fetch IP lists data
  const fetchIpLists = useCallback(async () => {
    if (!auth.token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/iplist?token=${auth.token}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === "OK" && result.response && result.response.rows) {
        const ipListData = Object.values(result.response.rows as Record<string, ApiRow>).map((row) => ({
          id: String(row.id ?? row.ip_list_id ?? "").trim(),
          name: row.name ?? "",
          readonly: row.readonly ?? "false",
          token: row.token ?? "",
          expires: row.expires ?? row.expires_at ?? "",
        }));
        
        setIpLists(ipListData);
        
        // Update parent component with IP list data
        const ipListDataForParent = ipListData.map(ip => ({
          id: ip.id,
          name: ip.name,
          type: "ip_list"
        }));
        onIpListDataChange(ipListDataForParent);

        // Default-select all in create mode (no selectedIds provided)
        if (!selectedIds || selectedIds.length === 0) {
          const allIds = new Set(ipListData.map((ip) => String(ip.id).trim()));
          setSelectedIpLists(allIds);
          onSelectionChange(allIds);
        }
      } else {
        console.warn("No IP lists data found or unexpected response format:", result);
        setIpLists([]);
      }
    } catch (err) {
      console.error("Error fetching IP lists:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch IP lists");
      setIpLists([]);
    } finally {
      setLoading(false);
    }
  }, [auth.token, onIpListDataChange]);

  // Load IP lists on component mount
  useEffect(() => {
    fetchIpLists();
  }, [fetchIpLists]);

  // Initialize with selectedIds from API
  useEffect(() => {
    if (selectedIds && selectedIds.length > 0) {
      console.log("🌐 IpLists: Setting selectedIds from API:", selectedIds);
      setSelectedIpLists(new Set(selectedIds.map(id => String(id).trim())));
    }
  }, [selectedIds]);

  // Handle IP list selection
  const handleIpListSelection = useCallback((ipListId: string, checked: boolean) => {
    const newSelection = new Set(selectedIpLists);
    
    const normalizedId = String(ipListId).trim();
    if (checked) {
      newSelection.add(normalizedId);
    } else {
      newSelection.delete(normalizedId);
    }
    
    setSelectedIpLists(newSelection);
    onSelectionChange(newSelection);
  }, [selectedIpLists, onSelectionChange]);

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = new Set(ipLists.map(ip => String(ip.id).trim()));
      setSelectedIpLists(allIds);
      onSelectionChange(allIds);
    } else {
      setSelectedIpLists(new Set());
      onSelectionChange(new Set());
    }
  }, [ipLists, onSelectionChange]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setListTypeFilter("My Lists");
    setSelectedFilter("All");
    setSearchTerm("");
  }, []);

  // Filter IP lists based on search and filters
  const filteredIpLists = ipLists.filter(ip => {
    const idStr = String(ip.id).trim();
    const matchesSearch = ip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idStr.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesListType = listTypeFilter === "My Lists" || listTypeFilter === "All";
    const matchesSelected = selectedFilter === "All" || 
                           (selectedFilter === "Selected" && selectedIpLists.has(idStr)) ||
                           (selectedFilter === "Unselected" && !selectedIpLists.has(idStr));
    
    return matchesSearch && matchesListType && matchesSelected;
  });

  // Get selected count
  const selectedCount = selectedIpLists.size;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>IP Lists</span>
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
              placeholder="Search IP lists..."
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
            </div> */}
            
            {/* <div className="flex items-center gap-2">
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

        {/* IP Lists Table */}
        <div className="border rounded-lg">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedCount === ipLists.length && ipLists.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=checked]:bg-blue-600"
                />
                <span className="text-sm font-medium">Select All</span>
              </div>
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading IP lists...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : filteredIpLists.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm || listTypeFilter !== "My Lists" || selectedFilter !== "All"
                  ? "No IP lists match the current filters"
                  : "No IP lists available"}
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
                  {filteredIpLists.map((ip) => (
                    <tr key={ip.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <Checkbox
                          checked={selectedIpLists.has(String(ip.id).trim())}
                          onCheckedChange={(checked) => 
                            handleIpListSelection(ip.id, checked === true)
                          }
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{ip.id}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{ip.name}</td>
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
          onClick={fetchIpLists}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Refreshing..." : "Refresh IP Lists"}
        </Button>
      </CardContent>
    </Card>
  );
} 
