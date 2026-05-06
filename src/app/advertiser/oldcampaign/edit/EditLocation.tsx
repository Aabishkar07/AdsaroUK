"use client";

import React, { useState, useEffect, useCallback } from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";

import { useAuth } from "@/context/context";
import axios from "axios";

interface LocationNode {
  id: string;
  name: string;
  type: 'COUNTRY' | 'STATE' | 'CITY' | 'ZIP';
  children?: LocationNode[];
  parentId?: string;
}

interface SelectedLocation {
  id: string;
  name: string;
  type: 'COUNTRY' | 'STATE' | 'CITY' | 'ZIP';
  country?: string;
  region?: string;
  city?: string;
  enabled: boolean;
  bid_adjustment: number;
}

interface LocationTargetingProps {
  selectedIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onDataChange?: (locationData: SelectedLocation[]) => void;
}

interface ApiResponse {
  response?: {
    rows?: Record<string, unknown>;
  };
}

interface CountryData {
  iso: string;
  name: string;
  children_count: number;
}

interface RegionData {
  id: number;
  iso: string;
  name: string;
  country_iso: string;
  children_count: number;
}

interface CityData {
  id: number;
  region_id: number;
  name: string;
  children_count: number;
}

interface PostalData {
  id: number;
  city_id: number;
  code: string;
}

export default function EditLocationTargeting({ selectedIds: propSelectedIds, onSelectionChange, onDataChange }: LocationTargetingProps) {
  console.log("📍 Location component: Component rendering with props:", { 
    hasOnSelectionChange: !!onSelectionChange, 
    hasOnDataChange: !!onDataChange 
  });
  
  const auth = useAuth();
  const [locationTree, setLocationTree] = useState<LocationNode[]>([]);
  const [filteredTree, setFilteredTree] = useState<LocationNode[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentRange, setCurrentRange] = useState({ start: 0, end: 500 });
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Initialize with selectedIds from props (for edit mode)
  useEffect(() => {
    if (propSelectedIds !== undefined) {
      // Edit mode: use the exact selectedIds provided (even if empty)
      setSelectedIds(new Set(propSelectedIds));
      console.log("🔄 Location Component: Edit mode - using provided selectedIds:", Array.from(propSelectedIds));
    } else {
      // Create mode: start with empty selection
      setSelectedIds(new Set());
      console.log("🔄 Location Component: Create mode - starting with empty selection");
    }
  }, [propSelectedIds]);

  // Build the hierarchical tree structure with pagination
  const buildLocationTree = useCallback(async (range: { start: number; end: number } = { start: 0, end: 500 }, append: boolean = false) => {
    if (!auth.token) return;
    
    setError("");
    if (!append) setLoading(true);
    
    try {
      const [countryRes, regionRes, cityRes, postalRes] = await Promise.all([
        axios.get<ApiResponse>(`https://panel.adsaro.com/advertiser/api/GeoCountries/?version=4&token=${auth.token}&range=${range.start}-${range.end}`),
        axios.get<ApiResponse>(`https://panel.adsaro.com/advertiser/api/GeoRegions/?version=4&token=${auth.token}&range=${range.start}-${range.end}`),
        axios.get<ApiResponse>(`https://panel.adsaro.com/advertiser/api/GeoCities/?version=4&token=${auth.token}&range=${range.start}-${range.end}`),
        axios.get<ApiResponse>(`https://panel.adsaro.com/advertiser/api/GeoPostalCodes/?version=4&token=${auth.token}&range=${range.start}-${range.end}`),
      ]);

      const countries = Object.values(countryRes.data?.response?.rows || {}) as CountryData[];
      const regions = Object.values(regionRes.data?.response?.rows || {}) as RegionData[];
      const cities = Object.values(cityRes.data?.response?.rows || {}) as CityData[];
      const postals = Object.values(postalRes.data?.response?.rows || {}) as PostalData[];

      // Check if we have data
      if (countries.length === 0 && regions.length === 0 && cities.length === 0 && postals.length === 0) {
        setHasMoreData(false);
        return false;
      }
      console.log("hasMoreData",hasMoreData)

      // Group by country ISO
      const countryGroups = new Map<string, { country: CountryData; regions: RegionData[] }>();
      
      countries.forEach(country => {
        const countryRegions = regions.filter(region => region.country_iso === country.iso);
        countryGroups.set(country.iso, { country, regions: countryRegions });
      });

      // Build the tree structure
      const tree: LocationNode[] = [];
      
      countryGroups.forEach(({ country, regions: countryRegions }) => {
        const normCountryId = (country.iso || '').toString().toUpperCase();
        const countryNode: LocationNode = {
          id: normCountryId,
          name: country.name,
          type: 'COUNTRY',
          children: []
        };

        countryRegions.forEach(region => {
          const regionCities = cities.filter(city => city.region_id === region.id);
          const regionNode: LocationNode = {
            id: region.id.toString(),
            name: region.name,
            type: 'STATE',
            parentId: normCountryId,
            children: []
          };

          regionCities.forEach(city => {
            const cityPostals = postals.filter(postal => postal.city_id === city.id);
            const cityNode: LocationNode = {
              id: city.id.toString(),
              name: city.name,
              type: 'CITY',
              parentId: region.id.toString(),
              children: []
            };

            cityPostals.forEach(postal => {
              const postalNode: LocationNode = {
                id: postal.id.toString(),
                name: postal.code,
                type: 'ZIP',
                parentId: city.id.toString()
              };
              cityNode.children!.push(postalNode);
            });

            regionNode.children!.push(cityNode);
          });

          countryNode.children!.push(regionNode);
        });

        tree.push(countryNode);
      });

      if (append) {
        // Merge with existing tree, avoiding duplicates
        setLocationTree(prevTree => {
          const existingIds = new Set<string>();
          const collectIds = (nodes: LocationNode[]) => {
            nodes.forEach(node => {
              existingIds.add(node.id);
              if (node.children) collectIds(node.children);
            });
          };
          collectIds(prevTree);

          const mergeNodes = (existing: LocationNode[], newNodes: LocationNode[]): LocationNode[] => {
            const result = [...existing];
            
            newNodes.forEach(newNode => {
              const existingIndex = result.findIndex(node => node.id === newNode.id);
              if (existingIndex >= 0) {
                // Merge children if node already exists
                if (newNode.children && result[existingIndex].children) {
                  result[existingIndex].children = mergeNodes(result[existingIndex].children!, newNode.children);
                }
              } else {
                // Add new node
                result.push(newNode);
              }
            });
            
            return result;
          };

          return mergeNodes(prevTree, tree);
        });
      } else {
        setLocationTree(tree);
      }

      // Update current range
      setCurrentRange(range);
      console.log("hasMoreData",currentRange)
      return true;
    } catch (err) {
      console.error("Failed to build location tree:", err);
      setError("Failed to load locations. Please try again.");
      if (!append) {
        setLocationTree([]);
      }
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  // Load all pages sequentially on mount (like create component)
  const loadAllPages = useCallback(async () => {
    if (!auth.token) return;
    setLoading(true);
    setError("");
    setHasMoreData(true);
    setLocationTree([]);
    let start = 0;
    const PAGE = 1000;
    let safety = 0;
    while (safety < 200) {
      const end = start + PAGE;
      const got = await buildLocationTree({ start, end }, true);
      if (!got) break;
      start = end + 1;
      safety += 1;
    }
    setHasMoreData(false);
    setLoading(false);
  }, [auth.token, buildLocationTree]);

  // Initial load: fetch all pages
  useEffect(() => {
    loadAllPages();
  }, [loadAllPages]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Compute filtered tree (like create component)
  const computeFiltered = useCallback(
    (tree: LocationNode[], query: string): LocationNode[] => {
      if (!query.trim()) return tree;
      const searchLower = query.toLowerCase();

      const filterNode = (node: LocationNode): LocationNode | null => {
        const nodeMatches = node.name.toLowerCase().includes(searchLower);
        let filteredChildren: LocationNode[] = [];
        if (node.children) {
          filteredChildren = node.children
            .map(filterNode)
            .filter((child): child is LocationNode => child !== null);
        }
        if (nodeMatches || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
        return null;
      };

      return tree
        .map(filterNode)
        .filter((node): node is LocationNode => node !== null);
    },
    []
  );

  const filterTree = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setFilteredTree(locationTree);
        setExpandedIds(new Set());
        return;
      }

      const filtered = computeFiltered(locationTree, query);
      setFilteredTree(filtered);

      const newExpandedIds = new Set<string>();
      const expandMatchingNodes = (nodes: LocationNode[]) => {
        nodes.forEach((node) => {
          if (node.children && node.children.length > 0) {
            newExpandedIds.add(node.id);
            expandMatchingNodes(node.children);
          }
        });
      };
      expandMatchingNodes(filtered);
      setExpandedIds(newExpandedIds);
    },
    [locationTree, computeFiltered]
  );

  // Update filtered tree when location tree changes
  useEffect(() => {
    setFilteredTree(locationTree);
  }, [locationTree]);

  // Filter when search query changes
  useEffect(() => {
    filterTree(debouncedQuery);
    if (debouncedQuery.trim()) {
      setIsSearching(true);
      // No incremental fetch needed since we load all pages up front,
      // but we keep this flag for UX parity
      setTimeout(() => setIsSearching(false), 100);
    }
  }, [debouncedQuery, filterTree]);

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setFilteredTree(locationTree);
    setExpandedIds(new Set());
  };

  // Bulk selection helpers (like create)
  const addNodeAndChildren = useCallback((node: LocationNode, acc: Set<string>) => {
    acc.add(node.id);
    if (node.children) {
      node.children.forEach((child) => addNodeAndChildren(child, acc));
    }
  }, []);

  const handleSelectAll = useCallback(() => {
    const newSelected = new Set<string>(selectedIds);
    const source = (searchQuery.trim() ? filteredTree : locationTree);
    source.forEach((root) => addNodeAndChildren(root, newSelected));
    setSelectedIds(newSelected);
    if (onSelectionChange) onSelectionChange(newSelected);
  }, [selectedIds, searchQuery, filteredTree, locationTree, addNodeAndChildren, onSelectionChange]);

  const handleDeselectAll = useCallback(() => {
    const cleared = new Set<string>();
    setSelectedIds(cleared);
    if (onSelectionChange) onSelectionChange(cleared);
  }, [onSelectionChange]);

  // Get all child IDs for a given node
  // const getAllChildIds = (node: LocationNode): string[] => {
  //   let ids: string[] = [];
  //   if (node.children) {
  //     node.children.forEach(child => {
  //       ids.push(child.id);
  //       ids = ids.concat(getAllChildIds(child));
  //     });
  //   }
  //   return ids;
  // };

  // Get all parent IDs for a given node
  // const getAllParentIds = (nodeId: string): string[] => {
  //   const findNode = (nodes: LocationNode[], targetId: string): LocationNode | null => {
  //     for (const node of nodes) {
  //       if (node.id === targetId) return node;
  //       if (node.children) {
  //         const found = findNode(node.children, targetId);
  //         if (found) return found;
  //       }
  //     }
  //     return null;
  //   };
    
  //   const node = findNode(locationTree, nodeId);
  //   if (!node || !node.parentId) return [];

  //   const parentIds: string[] = [node.parentId];
  //   const parent = findNode(locationTree, node.parentId);
  //   if (parent) {
  //     parentIds.push(...getAllParentIds(parent.id));
  //   }
  //   return parentIds;
  // };

  // Convert selected IDs to location data
  const getLocationData = useCallback((): SelectedLocation[] => {
    const locationData: SelectedLocation[] = [];
    
    // Only process nodes that are actually selected
    const processSelectedNode = (node: LocationNode) => {
      if (selectedIds.has(node.id)) {
        let locationName = node.name;
        let country, region, city;
        
        if (node.type === 'ZIP') {
          const cityNode = node.parentId ? findNodeById(locationTree, node.parentId) : null;
          const regionNode = cityNode?.parentId ? findNodeById(locationTree, cityNode.parentId) : null;
          const countryNode = regionNode?.parentId ? findNodeById(locationTree, regionNode.parentId) : null;
          
          if (cityNode && regionNode && countryNode) {
            locationName = `${countryNode.name} > ${regionNode.name} > ${cityNode.name} > ${node.name}`;
            country = countryNode.name;
            region = regionNode.name;
            city = cityNode.name;
          }
        } else if (node.type === 'CITY') {
          const regionNode = node.parentId ? findNodeById(locationTree, node.parentId) : null;
          const countryNode = regionNode?.parentId ? findNodeById(locationTree, regionNode.parentId) : null;
          
          if (regionNode && countryNode) {
            locationName = `${countryNode.name} > ${regionNode.name} > ${node.name}`;
            country = countryNode.name;
            region = regionNode.name;
          }
        } else if (node.type === 'STATE') {
          const countryNode = node.parentId ? findNodeById(locationTree, node.parentId) : null;
          
          if (countryNode) {
            locationName = `${countryNode.name} > ${node.name}`;
            country = countryNode.name;
          }
        }
        
        locationData.push({
          id: node.id,
          name: locationName,
          type: node.type,
          country,
          region,
          city,
          enabled: true,
          bid_adjustment: 1.0
        });
      }
    };
    
    // Process all nodes in the tree to find selected ones
    const processTree = (nodes: LocationNode[]) => {
      nodes.forEach(node => {
        processSelectedNode(node);
        if (node.children && node.children.length > 0) {
          processTree(node.children);
        }
      });
    };
    
    processTree(locationTree);
    
    console.log("📍 Location component: getLocationData called");
    console.log("📍 Selected IDs:", Array.from(selectedIds));
    console.log("📍 Generated location data:", locationData);
    
    return locationData;
  }, [selectedIds, locationTree]);

  // Handle selection changes
  const handleSelectionChange = useCallback((nodeId: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedIds);
    
    if (checked) {
      // Add this node and all its children
      const addNodeAndChildren = (node: LocationNode) => {
        newSelectedIds.add(node.id);
        if (node.children) {
          node.children.forEach(addNodeAndChildren);
        }
      };
      
      const node = findNodeById(locationTree, nodeId);
      if (node) {
        addNodeAndChildren(node);
      }
    } else {
      // Remove this node and all its children
      const removeNodeAndChildren = (node: LocationNode) => {
        newSelectedIds.delete(node.id);
        if (node.children) {
          node.children.forEach(removeNodeAndChildren);
        }
      };
      
      const node = findNodeById(locationTree, nodeId);
      if (node) {
        removeNodeAndChildren(node);
      }
    }
    
    setSelectedIds(newSelectedIds);
    
    // Call the callback with the new selection
    if (onSelectionChange) {
      onSelectionChange(newSelectedIds);
    }
    
    // Call the data change callback with the formatted data
    if (onDataChange) {
      const locationData = getLocationData();
      console.log("📍 Location component: Calling onDataChange with:", locationData);
      onDataChange(locationData);
    }
  }, [selectedIds, locationTree, onSelectionChange, onDataChange, getLocationData]);

  // Find node by ID
  const findNodeById = (nodes: LocationNode[], id: string): LocationNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Check if node is selected
  const isNodeSelected = (node: LocationNode): boolean => {
    // If this node is explicitly selected, mark as selected
    if (selectedIds.has(node.id)) return true;

    // Leaf node: selected only if explicitly selected
    if (!node.children || node.children.length === 0) {
      return selectedIds.has(node.id);
    }
    
    // Parent node: selected if all children are selected
    return node.children.every(child => isNodeSelected(child));
  };

  // Check if node is partially selected (indeterminate)
  const isNodeIndeterminate = (node: LocationNode): boolean => {
    // If this node is explicitly selected, do not show indeterminate
    if (selectedIds.has(node.id)) return false;
    if (!node.children || node.children.length === 0) return false;
    
    const someSelected = node.children.some(child => 
      isNodeSelected(child) || isNodeIndeterminate(child)
    );
    const allSelected = node.children.every(child => isNodeSelected(child));
    
    return someSelected && !allSelected;
  };

  // Toggle expand/collapse
  const toggleExpand = (nodeId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Render a single node
  const renderNode = (node: LocationNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const expanded = expandedIds.has(node.id);
    const selected = isNodeSelected(node);
    const indeterminate = isNodeIndeterminate(node);

    return (
      <div key={node.id} className="pl-1" style={{ paddingLeft: level * 20 }}>
        <div className="flex items-center space-x-2 py-1 hover:bg-gray-50 rounded-md transition-all">
          {hasChildren ? (
            <div
              onClick={() => toggleExpand(node.id)}
              className="cursor-pointer text-gray-600 hover:text-black"
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          ) : (
            <div style={{ width: 16 }} />
          )}
          
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-blue-600 rounded"
            checked={selected}
            ref={(el) => {
              if (el) el.indeterminate = indeterminate;
            }}
            onChange={(e) => handleSelectionChange(node.id, e.target.checked)}
          />
          
          <span className="select-none text-sm">{node.name}</span>
        </div>
        
        {expanded && hasChildren && (
          <div>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Update parent components when selections change
  useEffect(() => {
    if (onDataChange) {
      const locationData = getLocationData();
      console.log("📍 Location component: useEffect calling onDataChange with:", locationData);
      onDataChange(locationData);
    }
  }, [selectedIds, onDataChange, getLocationData]);

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold block">Locations Targeting</Label>
      
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search countries, regions, cities, or postal codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="text-xs text-gray-500 mt-1">
            Found {filteredTree.length} matching location(s)
          </div>
        )}
      </div>
      
      {/* Bulk actions */}
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={handleSelectAll}>
          Select All {searchQuery.trim() ? "(filtered)" : ""}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={handleDeselectAll}>
          Deselect All
        </Button>
      </div>

      <div className="border border-gray-300 rounded-md w-full md:w-96 text-sm bg-white max-h-[450px] overflow-auto p-2 relative">
        {loading ? (
          <div className="text-gray-500 italic text-center py-8">Loading locations...</div>
        ) : error ? (
          <div className="text-red-500 italic text-center py-8">{error}</div>
        ) : filteredTree.length === 0 ? (
          <div className="text-gray-500 italic text-center py-8">
            {searchQuery ? `No locations found matching "${searchQuery}"` : "No data available"}
          </div>
        ) : (
          <>
            {filteredTree.map((node) => renderNode(node))}
            {isSearching && (
              <div className="text-gray-500 italic text-center py-2">
                Searching more results...
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Selection Summary */}
      {selectedIds.size > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800 font-medium">
            ✓ {selectedIds.size} location(s) selected
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Location targeting will be applied when you submit the campaign
          </p>
        </div>
      )}

      {/* Info Message */}
      {selectedIds.size === 0 && filteredTree.length > 0 && !loading && (
        <div className="text-sm text-yellow-600 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <strong>Note:</strong> No locations selected. Your campaign may not receive traffic. 
          Select at least one location to enable targeting.
        </div>
      )}

      {/* Load status */}
      {!searchQuery && (
        <div className="text-xs text-gray-500 text-center">
          {loading
            ? "Loading all locations, this may take some time..."
            : "All locations loaded."}
        </div>
      )}
    </div>
  );
}