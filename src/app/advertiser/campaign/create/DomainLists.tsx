"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/context";
import { Search, Filter } from "lucide-react";

interface DomainList {
  id: string;
  name: string;
  timestamp: string;
  domains?: string;
  remove_invalid?: boolean;
}

type ApiRow = {
  id?: string | number;
  domain_list_id?: string | number;
  name?: string;
  timestamp?: string;
  created_at?: string;
  domains?: string;
  domain_bundles?: string;
  remove_invalid?: boolean;
};

interface DomainListsProps {
  onSelectionChange: (selectedIds: Set<string>) => void;
  onDomainListDataChange: (domainListData: Array<{ id: string; name: string; type: string }>) => void;
  selectedIds?: string[]; // Domain List IDs from API
}

export default function DomainLists({ onSelectionChange, onDomainListDataChange, selectedIds }: DomainListsProps) {
  const [domainLists, setDomainLists] = useState<DomainList[]>([]);
  const [selectedDomainLists, setSelectedDomainLists] = useState<Set<string>>(new Set(selectedIds?.map(id => id) ?? []));
  const [searchTerm, setSearchTerm] = useState("");
  const [listTypeFilter, setListTypeFilter] = useState("My Lists");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auth = useAuth();

  // Fetch domain lists data
  const fetchDomainLists = useCallback(async () => {
    if (!auth.token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://panel.adsaro.com/advertiser/api/DomainList/?version=4&token=${auth.token}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === "OK" && result.response && result.response.rows) {
        const domainListData = Object.values(result.response.rows as Record<string, ApiRow>).map((row) => ({
          id: String(row.id ?? row.domain_list_id ?? ""),
          name: row.name ?? "",
          timestamp: row.timestamp ?? row.created_at ?? "",
          domains: row.domains ?? row.domain_bundles ?? "",
          remove_invalid: row.remove_invalid ?? false,
        }));
        
        setDomainLists(domainListData);
        
        // Update parent component with domain list data including actual domains
        const domainListDataForParent = domainListData.map(domain => ({
          id: domain.id,
          name: domain.name,
          type: "domain_list",
          domains: domain.domains
        }));
        onDomainListDataChange(domainListDataForParent);

        // Default-select all in create mode (no selectedIds provided)
        if (!selectedIds || selectedIds.length === 0) {
          const allIds = new Set(domainListData.map((d) => d.id));
          setSelectedDomainLists(allIds);
          onSelectionChange(allIds);
        }
      } else {
        console.warn("No domain lists data found or unexpected response format:", result);
        setDomainLists([]);
      }
    } catch (err) {
      console.error("Error fetching domain lists:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch domain lists");
      setDomainLists([]);
    } finally {
      setLoading(false);
    }
  }, [auth.token, onDomainListDataChange]);

  // Load domain lists on component mount
  useEffect(() => {
    fetchDomainLists();
  }, [fetchDomainLists]);

  // Initialize with selectedIds from API
  useEffect(() => {
    if (selectedIds && selectedIds.length > 0) {
      console.log("🌍 DomainLists: Setting selectedIds from API:", selectedIds);
      setSelectedDomainLists(new Set(selectedIds));
    }
  }, [selectedIds]);

  // Handle domain list selection
  const handleDomainListSelection = useCallback((domainListId: string, checked: boolean) => {
    const newSelection = new Set(selectedDomainLists);
    
    if (checked) {
      newSelection.add(domainListId);
    } else {
      newSelection.delete(domainListId);
    }
    
    setSelectedDomainLists(newSelection);
    onSelectionChange(newSelection);
  }, [selectedDomainLists, onSelectionChange]);

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = new Set(domainLists.map(domain => domain.id));
      setSelectedDomainLists(allIds);
      onSelectionChange(allIds);
    } else {
      setSelectedDomainLists(new Set());
      onSelectionChange(new Set());
    }
  }, [domainLists, onSelectionChange]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setListTypeFilter("My Lists");
    setSelectedFilter("All");
    setSearchTerm("");
  }, []);

  // Filter domain lists based on search and filters
  const filteredDomainLists = domainLists.filter(domain => {
    const matchesSearch = domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         String(domain.id).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesListType = listTypeFilter === "My Lists" || listTypeFilter === "All";
    const matchesSelected = selectedFilter === "All" || 
                           (selectedFilter === "Selected" && selectedDomainLists.has(domain.id)) ||
                           (selectedFilter === "Unselected" && !selectedDomainLists.has(domain.id));
    
    return matchesSearch && matchesListType && matchesSelected;
  });

  // Get selected count
  const selectedCount = selectedDomainLists.size;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Domain Lists</span>
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
              placeholder="Search domain lists..."
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

        {/* Domain Lists Table */}
        <div className="border rounded-lg">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedCount === domainLists.length && domainLists.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=checked]:bg-blue-600"
                />
                <span className="text-sm font-medium">Select All</span>
              </div>
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading domain lists...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : filteredDomainLists.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm || listTypeFilter !== "My Lists" || selectedFilter !== "All"
                  ? "No domain lists match the current filters"
                  : "No domain lists available"}
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
                  {filteredDomainLists.map((domain) => (
                    <tr key={domain.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <Checkbox
                          checked={selectedDomainLists.has(domain.id)}
                          onCheckedChange={(checked) => 
                            handleDomainListSelection(domain.id, checked === true)
                          }
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{domain.id}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{domain.name}</td>
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
          onClick={fetchDomainLists}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Refreshing..." : "Refresh Domain Lists"}
        </Button>
      </CardContent>
    </Card>
  );
}