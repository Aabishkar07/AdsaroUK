"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/context";
import { Search, Filter} from "lucide-react";

interface AppList {
  id: string;
  name: string;
  timestamp: string;
  ipaddresses?: string;
}

type ApiRow = {
  id?: string | number;
  app_list_id?: string | number;
  name?: string;
  timestamp?: string;
  created_at?: string;
  ipaddresses?: string;
  app_bundles?: string;
};

interface AppListsProps {
  onSelectionChange: (selectedIds: Set<string>) => void;
  onAppListDataChange: (
    appListData: Array<{ id: string; name: string; type: string }>
  ) => void;
  selectedIds?: string[]; // App List IDs from API
}

export default function AppLists({
  onSelectionChange,
  onAppListDataChange,
  selectedIds,
}: AppListsProps) {
  const [appLists, setAppLists] = useState<AppList[]>([]);
  const [selectedAppLists, setSelectedAppLists] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [listTypeFilter, setListTypeFilter] = useState("My Lists");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auth = useAuth();

  // Fetch app lists data
  const fetchAppLists = useCallback(async () => {
    if (!auth.token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/applist?token=${auth.token}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.status === "OK" && result.response && result.response.rows) {
        const appListData = Object.values(result.response.rows as Record<string, ApiRow>).map((row) => ({
          id: String(row.id ?? row.app_list_id ?? ""),
          name: row.name ?? "",
          timestamp: row.timestamp ?? row.created_at ?? "",
          ipaddresses: row.ipaddresses ?? row.app_bundles ?? "",
        }));

        setAppLists(appListData);

        // Update parent component with app list data
        const appListDataForParent = appListData.map((app) => ({
          id: app.id,
          name: app.name,
          type: "app_list",
        }));
        onAppListDataChange(appListDataForParent);

        // Default-select all in create mode (no selectedIds provided)
        if (!selectedIds || selectedIds.length === 0) {
          const allIds = new Set(appListData.map((app) => app.id));
          setSelectedAppLists(allIds);
          onSelectionChange(allIds);
        }
      } else {
        console.warn(
          "No app lists data found or unexpected response format:",
          result
        );
        setAppLists([]);
      }
    } catch (err) {
      console.error("Error fetching app lists:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch app lists"
      );
      setAppLists([]);
    } finally {
      setLoading(false);
    }
  }, [auth.token, onAppListDataChange]);

  // Load app lists on component mount
  useEffect(() => {
    fetchAppLists();
  }, [fetchAppLists]);

  // Initialize with selectedIds from API
  useEffect(() => {
    if (selectedIds && selectedIds.length > 0) {
      console.log("📱 AppLists: Setting selectedIds from API:", selectedIds);
      setSelectedAppLists(new Set(selectedIds));
    }
  }, [selectedIds]);

  // Handle app list selection
  const handleAppListSelection = useCallback(
    (appListId: string, checked: boolean) => {
      const newSelection = new Set(selectedAppLists);

      if (checked) {
        newSelection.add(appListId);
      } else {
        newSelection.delete(appListId);
      }

      setSelectedAppLists(newSelection);
      onSelectionChange(newSelection);
    },
    [selectedAppLists, onSelectionChange]
  );

  // Handle select all
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const allIds = new Set(appLists.map((app) => app.id));
        setSelectedAppLists(allIds);
        onSelectionChange(allIds);
      } else {
        setSelectedAppLists(new Set());
        onSelectionChange(new Set());
      }
    },
    [appLists, onSelectionChange]
  );

  // Clear filters
  const clearFilters = useCallback(() => {
    setListTypeFilter("My Lists");
    setSelectedFilter("All");
    setSearchTerm("");
  }, []);

  // Filter app lists based on search and filters
  const filteredAppLists = appLists.filter((app) => {
    console.log("aaaaaaaa",app);
    console.log("searchTerm",searchTerm);
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(app.id).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesListType =
      listTypeFilter === "My Lists" || listTypeFilter === "All";
    const matchesSelected =
      selectedFilter === "All" ||
      (selectedFilter === "Selected" && selectedAppLists.has(app.id)) ||
      (selectedFilter === "Unselected" && !selectedAppLists.has(app.id));

    return matchesSearch && matchesListType && matchesSelected;
  });

  // Get selected count
  const selectedCount = selectedAppLists.size;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>App Lists</span>
          {selectedCount > 0 && (
            <span className="text-sm font-normal text-gray-500">
              ({selectedCount} selected)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-wrap flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search app lists..."
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

        {/* App Lists Table */}
        <div className="border rounded-lg">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={
                    selectedCount === appLists.length && appLists.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                  className="data-[state=checked]:bg-blue-600"
                />
                <span className="text-sm font-medium">Select All</span>
              </div>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading app lists...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : filteredAppLists.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ||
                listTypeFilter !== "My Lists" ||
                selectedFilter !== "All"
                  ? "No app lists match the current filters"
                  : "No app lists available"}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 w-12">
                      <Checkbox className="invisible" />
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Name
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppLists.map((app) => (
                    <tr key={app.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <Checkbox
                          checked={selectedAppLists.has(app.id)}
                          onCheckedChange={(checked) =>
                            handleAppListSelection(app.id, checked === true)
                          }
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {app.id}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {app.name}
                      </td>
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
          onClick={fetchAppLists}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Refreshing..." : "Refresh App Lists"}
        </Button>
      </CardContent>
    </Card>
  );
}