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
import { ChevronDown, Search, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

export default function OperatingSystem({
  selectedIds,
  initialData,
  onSelectionChange,
  onDataChange,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mainOpen, setMainOpen] = useState(true); // Open by default
  const [versionOpen, setVersionOpen] = useState(false);
  const [mainQuery, setMainQuery] = useState("");
  const [versionQuery, setVersionQuery] = useState("");
  const [mainChipsExpanded, setMainChipsExpanded] = useState(false);
  const [versionChipsExpanded, setVersionChipsExpanded] = useState(false);

  const allTypes = React.useMemo(() => {
    const collect = (nodes: OSNode[]): string[] =>
      nodes.flatMap((n) => [
        n.type,
        ...(n.children ? collect(n.children) : []),
      ]);
    return new Set(collect(osData));
  }, []);

  const topLevelNodes = React.useMemo(() => osData as OSNode[], []);

  const childrenByParentType = React.useMemo(() => {
    const map = new Map<string, OSNode[]>();
    for (const node of topLevelNodes) {
      map.set(node.type, node.children ? node.children : []);
    }
    return map;
  }, [topLevelNodes]);

  const parentByChildType = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const parent of topLevelNodes) {
      if (parent.children) {
        for (const child of parent.children) {
          map.set(child.type, parent.type);
        }
      }
    }
    return map;
  }, [topLevelNodes]);

  const selectedMainTypes = React.useMemo(() => {
    return topLevelNodes
      .map((n) => n.type)
      .filter((t) => selected.has(t));
  }, [topLevelNodes, selected]);

  const versionOptions = React.useMemo(() => {
    const all: OSNode[] = [];
    selectedMainTypes.forEach((t) => {
      const children = childrenByParentType.get(t) || [];
      children.forEach((c) => all.push(c));
    });
    return all;
  }, [selectedMainTypes, childrenByParentType]);

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

    if (normalizedSelected !== undefined && normalizedSelected.size > 0) {
      // Edit mode: use exact provided selection
      console.log("🖥️ OperatingSystem: Edit mode - loading selected OS from API", Array.from(normalizedSelected));
      setSelected(normalizedSelected);
    } else {
      // Create mode or empty selection: select all by default
      console.log("🖥️ OperatingSystem: Create mode - selecting all OS by default", Array.from(allTypes));
      setSelected(new Set(allTypes));
    }

    // Initialize settings map. If editing and initialData provided, hydrate from it; otherwise use defaults
    setSettings((prev) => {
      const next: Record<string, { bid_adjustment: number; enabled: boolean; name: string }> = {};
      const all = Array.from(allTypes);
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

  const handleSelectAll = () => {
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
  };

  const handleClearAll = () => {
    setSelected(new Set());
    setSettings((prev) => {
      const next: typeof prev = { ...prev };
      for (const t of Object.keys(next)) {
        next[t] = { ...next[t], enabled: false };
      }
      return next;
    });
  };

  const toggleMain = (node: OSNode) => {
    const collect = (n: OSNode): string[] => [
      n.type,
      ...(n.children ? n.children.flatMap(collect) : []),
    ];
    const all = collect(node);

    setSelected((prevSel) => {
      const next = new Set(prevSel);
      const isAll = all.every((t) => next.has(t));
      if (isAll) {
        all.forEach((t) => next.delete(t));
      } else {
        all.forEach((t) => next.add(t));
      }

      setSettings((prev) => {
        const sNext = { ...prev };
        for (const t of all) {
          const nodeInfo = findOSNodeByType(t);
          const existing = sNext[t];
          sNext[t] = {
            bid_adjustment: existing?.bid_adjustment ?? getDefaultBid(t),
            enabled: next.has(t),
            name: existing?.name ?? nodeInfo?.name ?? t,
          };
        }
        return sNext;
      });

      return next;
    });
  };

  const toggleVersion = (node: OSNode) => {
    const type = node.type;
    const parent = parentByChildType.get(type);
    setSelected((prevSel) => {
      const next = new Set(prevSel);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
        if (parent) next.add(parent);
      }

      setSettings((prev) => {
        const sNext = { ...prev };
        const nodeInfo = findOSNodeByType(type);
        const existing = sNext[type];
        sNext[type] = {
          bid_adjustment: existing?.bid_adjustment ?? getDefaultBid(type),
          enabled: next.has(type),
          name: existing?.name ?? nodeInfo?.name ?? type,
        };
        if (parent) {
          const parentInfo = findOSNodeByType(parent);
          const pExisting = sNext[parent];
          sNext[parent] = {
            bid_adjustment: pExisting?.bid_adjustment ?? getDefaultBid(parent),
            enabled: next.has(parent),
            name: pExisting?.name ?? parentInfo?.name ?? parent,
          };
        }
        return sNext;
      });

      return next;
    });
  };

  const removeChip = (type: string) => {
    const parent = parentByChildType.get(type);
    const topNode = topLevelNodes.find((n) => n.type === type);
    if (topNode) {
      toggleMain(topNode);
      return;
    }

    setSelected((prevSel) => {
      const next = new Set(prevSel);
      next.delete(type);

      setSettings((prev) => {
        const sNext = { ...prev };
        const nodeInfo = findOSNodeByType(type);
        const existing = sNext[type];
        sNext[type] = {
          bid_adjustment: existing?.bid_adjustment ?? getDefaultBid(type),
          enabled: false,
          name: existing?.name ?? nodeInfo?.name ?? type,
        };
        return sNext;
      });

      if (parent) {
        const siblings = childrenByParentType.get(parent) || [];
        const anySiblingSelected = siblings.some((c) => next.has(c.type));
        if (!anySiblingSelected) {
          // keep parent selected if it was explicitly selected; otherwise remove it
          // (matches the most common user expectation in step-wise selection)
          //
          // Note: if you want parent always kept once selected, remove this block.
          next.delete(parent);
        }
      }

      return next;
    });
  };

  return (
    <div className="space-y-2">
      {/* <Label className="text-lg font-semibold block">OS Targeting</Label> */}

      <div className="rounded-md border border-gray-300 bg-blue-50 p-3 w-full text-sm space-y-3 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600 accent-blue-600"
              checked={isAllSelected}
              ref={masterCheckboxRef}
              onChange={handleMasterToggle}
            />
            <div className="font-semibold text-gray-900">
              Operating Systems
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-600">{selected.size} selected</div>
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
          <Label className="text-sm">Main OS</Label>
          <div className="mt-1 rounded-md border border-gray-300 bg-white">
            <button
              type="button"
              onClick={() => setMainOpen((v) => !v)}
              className="flex w-full items-center justify-between px-3 py-2 text-left"
            >
              <div className="text-sm text-gray-900">
                {selectedMainTypes.length > 0
                  ? `${selectedMainTypes.length} selected`
                  : "Select main OS"}
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {selectedMainTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 px-3 pb-2">
                {selectedMainTypes
                  .slice(0, mainChipsExpanded ? undefined : 3)
                  .map((t) => (
                    <div
                      key={t}
                      className="flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-xs text-white"
                    >
                      <span>{settings[t]?.name ?? t}</span>
                      <button
                        type="button"
                        onClick={() => removeChip(t)}
                        className="rounded-full bg-white/20 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                {selectedMainTypes.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setMainChipsExpanded((v) => !v)}
                    className="text-xs text-blue-700 hover:underline"
                  >
                    {mainChipsExpanded
                      ? "Show less"
                      : `View all (+${selectedMainTypes.length - 3})`}
                  </button>
                )}
              </div>
            )}
            {mainOpen && (
              <div className="border-t border-gray-200 p-3">
                <div className="relative mb-2">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    value={mainQuery}
                    onChange={(e) => setMainQuery(e.target.value)}
                    className="pl-8"
                    placeholder="Search main OS..."
                  />
                </div>
                <div className="max-h-56 overflow-auto">
                  {topLevelNodes
                    .filter((n) =>
                      n.name.toLowerCase().includes(mainQuery.toLowerCase()) ||
                      n.type.toLowerCase().includes(mainQuery.toLowerCase())
                    )
                    .map((node) => {
                      const children = childrenByParentType.get(node.type) || [];
                      const types = [node.type, ...children.map((c) => c.type)];
                      const checked = types.every((t) => selected.has(t));
                      return (
                        <button
                          key={node.type}
                          type="button"
                          onClick={() => toggleMain(node)}
                          className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-gray-50"
                        >
                          <div className="text-gray-900">{node.name}</div>
                          <input type="checkbox" checked={checked} readOnly />
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <Label className="text-sm">Versions</Label>
          <div className="mt-1 rounded-md border border-gray-300 bg-white">
            <button
              type="button"
              disabled={selectedMainTypes.length === 0}
              onClick={() => setVersionOpen((v) => !v)}
              className="flex w-full items-center justify-between px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="text-sm text-gray-900">
                {selectedMainTypes.length === 0
                  ? "Select main OS first"
                  : `${versionOptions.filter((v) => selected.has(v.type)).length} selected`}
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {versionOptions.filter((v) => selected.has(v.type)).length > 0 && (
              <div className="flex flex-wrap gap-2 px-3 pb-2">
                {versionOptions
                  .filter((v) => selected.has(v.type))
                  .slice(0, versionChipsExpanded ? undefined : 3)
                  .map((v) => (
                    <div
                      key={v.type}
                      className="flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-xs text-white"
                    >
                      <span>{v.name}</span>
                      <button
                        type="button"
                        onClick={() => removeChip(v.type)}
                        className="rounded-full bg-white/20 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                {versionOptions.filter((v) => selected.has(v.type)).length > 3 && (
                  <button
                    type="button"
                    onClick={() => setVersionChipsExpanded((v) => !v)}
                    className="text-xs text-blue-700 hover:underline"
                  >
                    {versionChipsExpanded
                      ? "Show less"
                      : `View all (+${versionOptions.filter((v) => selected.has(v.type)).length - 3})`}
                  </button>
                )}
              </div>
            )}
            {versionOpen && (
              <div className="border-t border-gray-200 p-3">
                <div className="relative mb-2">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    value={versionQuery}
                    onChange={(e) => setVersionQuery(e.target.value)}
                    className="pl-8"
                    placeholder="Search versions..."
                  />
                </div>
                <div className="max-h-56 overflow-auto">
                  {versionOptions
                    .filter((n) =>
                      n.name.toLowerCase().includes(versionQuery.toLowerCase()) ||
                      n.type.toLowerCase().includes(versionQuery.toLowerCase())
                    )
                    .map((node) => {
                      const checked = selected.has(node.type);
                      return (
                        <button
                          key={node.type}
                          type="button"
                          onClick={() => toggleVersion(node)}
                          className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-gray-50"
                        >
                          <div className="text-gray-900">{node.name}</div>
                          <input type="checkbox" checked={checked} readOnly />
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        {selected.size === 0 && osData.length > 0 && (
          <p className="text-sm text-yellow-600 mt-1">
            Note: No OS selected. Your campaign may not target any devices.
          </p>
        )}
      </div>
    </div>
  );
}