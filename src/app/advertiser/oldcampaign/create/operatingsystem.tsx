"use client";
/**
 * Operating System Targeting Component
 * 
 * This component allows advertisers to select operating systems for campaign targeting.
 * Each operating system can have:
 * - enabled: boolean - whether targeting is enabled for this OS
 * - bid_adjustment: number - bid multiplier (0.5 = 50% reduction, 1.5 = 50% increase)
 * 
 * Default bid adjustments:
 * - WINDOWS: 0.5 (50% bid reduction)
 * - ANDROID: 1.0 (no bid adjustment)
 * - IOS: 1.5 (50% bid increase)
 */

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import osData from "./operating_systems.json";

interface OSNode {
  type: string;
  name: string;
  children?: OSNode[];
}

type OSDataItem = {
  id: string;
  name: string;
  type: string;
  bid_adjustment?: number;
  enabled?: boolean;
};

interface Props {
  // For edit mode, can pass previously selected types. Accepts Set<string> or string[]
  selectedIds?: Set<string> | string[];
  // For edit mode, pass existing data to preserve bid_adjustment and enabled flags
  initialData?: Array<OSDataItem>;
  onSelectionChange?: (selectedTypes: Set<string>) => void;
  onDataChange?: (operatingSystemData: Array<OSDataItem>) => void;
}

export default function OperatingSystem({ selectedIds, initialData, onSelectionChange, onDataChange }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const allTypes = React.useMemo(() => {
    const collect = (nodes: OSNode[]): string[] =>
      nodes.flatMap((n) => [
        n.type,
        ...(n.children ? collect(n.children) : []),
      ]);
    return new Set(collect(osData));
  }, []);

  // Keep per-OS settings (bid_adjustment, enabled, and name) so we can preserve on edit
  const [settings, setSettings] = useState<Record<string, { bid_adjustment: number; enabled: boolean; name: string }>>({});
  // Prevent repeated hydration that can cause update loops
  const [hydrated, setHydrated] = useState(false);

  // Helper defaults based on type
  const getDefaultBid = (type: string) => {
    if (type === "WINDOWS") return 0.5;
    if (type === "ANDROID") return 1.0;
    if (type === "IOS") return 1.5;
    return 0.9; // generic default
  };

  const findOSNodeByType = (type: string): OSNode | null => {
    const dfs = (nodes: OSNode[]): OSNode | null => {
      for (const node of nodes) {
        if (node.type === type) return node;
        if (node.children) {
          const found = dfs(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    return dfs(osData);
  };

  // Initialize with selectedIds from props (for edit mode) or select all (for create mode)
  useEffect(() => {
    if (hydrated) return; // avoid re-hydration loops
    const normalizedSelected =
      selectedIds !== undefined
        ? new Set(Array.isArray(selectedIds) ? selectedIds : Array.from(selectedIds))
        : undefined;

    if (normalizedSelected !== undefined) {
      // Edit mode: use exact provided selection
      setSelected(normalizedSelected);
    } else {
      // Create mode: select all by default
      setSelected(new Set(allTypes));
    }

    // Initialize settings map. If editing and initialData provided, hydrate from it; otherwise use defaults
    setSettings((prev) => {
      const next: Record<string, { bid_adjustment: number; enabled: boolean; name: string }> = {};
      const all = Array.from(allTypes);
      console.log("prev",prev)
      const byTypeFromInitial: Record<string, OSDataItem> = {};
      if (initialData) {
        for (const item of initialData) {
          byTypeFromInitial[item.type] = item;
        }
      }

      for (const type of all) {
        const node = findOSNodeByType(type);
        const name = node?.name || type;
        const fromInit = byTypeFromInitial[type];
        const bid = fromInit?.bid_adjustment ?? getDefaultBid(type);
        // If selectedIds is provided, enabled should reflect whether included; otherwise default true for create
        const enabled = normalizedSelected ? normalizedSelected.has(type) : true;
        next[type] = { bid_adjustment: bid, enabled, name };
      }
      return next;
    });
    setHydrated(true);
  }, [hydrated, allTypes.size, selectedIds, initialData]);

  useEffect(() => {
    onSelectionChange?.(selected);
    
    // Call onDataChange with the selected operating system data
    if (onDataChange) {
      const selectedOSData = Array.from(selected).map((type) => {
        const node = findOSNodeByType(type);
        const setting = settings[type];
        return {
          id: type,
          name: setting?.name ?? node?.name ?? type,
          type,
          bid_adjustment: setting?.bid_adjustment ?? getDefaultBid(type),
          enabled: setting?.enabled ?? true,
        } as OSDataItem;
      });
      
      onDataChange(selectedOSData);
    }
  }, [selected, settings, onSelectionChange, onDataChange]);

  const toggleExpand = (type: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const toggleSelect = (node: OSNode) => {
    const collect = (n: OSNode): string[] => [
      n.type,
      ...(n.children ? n.children.flatMap(collect) : []),
    ];
    const all = collect(node);

    const isAllSelected = all.every((t) => selected.has(t));
    const updated = new Set(selected);

    if (isAllSelected) {
      all.forEach((t) => updated.delete(t));
    } else {
      all.forEach((t) => updated.add(t));
    }

    // Update enabled flags in settings to reflect selection changes
    setSettings((prev) => {
      const next = { ...prev };
      for (const t of all) {
        const existing = next[t];
        if (existing) {
          next[t] = { ...existing, enabled: updated.has(t) };
        } else {
          const nodeInfo = findOSNodeByType(t);
          next[t] = {
            bid_adjustment: getDefaultBid(t),
            enabled: updated.has(t),
            name: nodeInfo?.name || t,
          };
        }
      }
      return next;
    });

    setSelected(updated);
  };

  const toggleLeaf = (type: string) => {
    setSelected((prevSel) => {
      const prev = new Set(prevSel);
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      // Reflect enabled in settings
      setSettings((s) => {
        const nodeInfo = findOSNodeByType(type);
        const current = s[type];
        return {
          ...s,
          [type]: {
            bid_adjustment: current?.bid_adjustment ?? getDefaultBid(type),
            enabled: next.has(type),
            name: current?.name ?? nodeInfo?.name ?? type,
          },
        };
      });
      return next;
    });
  };

  const totalItems = osData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentData = osData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isAllSelected = selected.size === allTypes.size;
  const isIndeterminate = selected.size > 0 && selected.size < allTypes.size;

  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleMasterToggle = () => {
    if (isAllSelected) {
      setSelected(new Set());
      setSettings((prev) => {
        const next: typeof prev = { ...prev };
        for (const t of Object.keys(next)) {
          next[t] = { ...next[t], enabled: false };
        }
        return next;
      });
    } else {
      const all = new Set(allTypes);
      setSelected(all);
      setSettings((prev) => {
        const next: typeof prev = { ...prev };
        for (const t of Array.from(all)) {
          const nodeInfo = findOSNodeByType(t);
          const existing = next[t];
          next[t] = {
            bid_adjustment: existing?.bid_adjustment ?? getDefaultBid(t),
            enabled: true,
            name: existing?.name ?? nodeInfo?.name ?? t,
          };
        }
        return next;
      });
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-lg font-semibold block">OS Targeting</Label>

      <div className="border border-gray-300 rounded-md w-full md:w-96 text-sm bg-white">
        {/* Header */}
        <div className="flex items-center py-2 px-3 border-b bg-gray-100 font-bold">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-blue-600 mr-2"
            checked={isAllSelected}
            ref={masterCheckboxRef}
            onChange={handleMasterToggle}
          />
          <span className="flex-grow">
            Operating Systems ({selected.size} selected)
          </span>
        </div>

        {/* Render Tree Nodes */}
        {currentData.map((node) => {
          const collect = (n: OSNode): string[] => [
            n.type,
            ...(n.children ? n.children.flatMap(collect) : []),
          ];

          const allChildTypes = collect(node);
          const isNodeSelected = allChildTypes.every((t) => selected.has(t));
          const isNodeIndeterminate =
            allChildTypes.some((t) => selected.has(t)) && !isNodeSelected;

          return (
            <div key={node.type} className="border-b">
              <div
                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => node.children && toggleExpand(node.type)}
              >
                <div className="w-4 mr-2">
                  {node.children &&
                    (expanded.has(node.type) ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    ))}
                </div>
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600 mr-2"
                  checked={isNodeSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isNodeIndeterminate;
                  }}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSelect(node);
                  }}
                />
                <span className="font-medium">{node.name}</span>
              </div>
              {node.children && expanded.has(node.type) && (
                <div className="ml-8 border-l bg-white">
                  {node.children.map((child) => (
                    <div
                      key={child.type}
                      className="flex items-center px-3 py-1 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600 mr-2"
                        checked={selected.has(child.type)}
                        onChange={() => toggleLeaf(child.type)}
                      />
                      {child.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-3 py-2 border-t text-xs bg-gray-100">
          <div>{`${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
            currentPage * itemsPerPage,
            totalItems
          )} of ${totalItems}`}</div>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`px-2 ${
                currentPage === 1 ? "text-gray-400" : "hover:bg-gray-200"
              }`}
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-2 ${
                currentPage === 1 ? "text-gray-400" : "hover:bg-gray-200"
              }`}
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-2 ${
                currentPage === totalPages
                  ? "text-gray-400"
                  : "hover:bg-gray-200"
              }`}
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-2 ${
                currentPage === totalPages
                  ? "text-gray-400"
                  : "hover:bg-gray-200"
              }`}
            >
              »
            </button>
          </div>
        </div>
      </div>

      {selected.size === 0 && totalItems > 0 && (
        <p className="text-sm text-yellow-600 mt-1">
          Note: No OS selected. Your campaign may not target any devices.
        </p>
      )}
    </div>
  );
}