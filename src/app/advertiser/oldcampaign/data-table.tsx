"use client";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { TableRow } from "@/components/ui/table";
import {
  ResponsiveTableWrapper,
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableCell,
  ResponsiveTableHead,
  MobileCard,
  MobileCardHeader,
  MobileCardContent,
  MobileCardField,
  ResponsivePagination,
  ResponsiveActions,
} from "@/components/ui/responsive-table";
import axios from "axios";
import { useAuth } from "@/context/context";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CampaignData {
  id: string;
  name: string;
  is_active: boolean;
  type: string;
  start_date: string;
  end_date: string;
  creatives: number;
  budget_total: number;
  cost_total: number;
  budget_daily: number;
  cost_today: number;
  clicks_views_per_day: number;
  clicks_views_per_ip: number;
  impressions_per_ip: number;
  ad_vertical: string | number;
}

export function CampaignDataTableDemo() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const auth = useAuth();
  const mytoken = auth?.token;
  const router = useRouter();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [data, setData] = useState<CampaignData[]>([]);
  const [creativesCountByCampaign, setCreativesCountByCampaign] = useState<Record<string, number>>({});
  const creativesCacheRef = useRef<{ token: string; counts: Record<string, number> } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [isLoadingCreativesCounts, setIsLoadingCreativesCounts] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Filter states
  const [adVerticalFilter, setAdVerticalFilter] = useState("");
  const [campaignTypeFilter, setCampaignTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [adVerticalOptions, setAdVerticalOptions] = useState<
    Array<{ id: string; vertical: string }>
  >([]);
  const [adVerticalMap, setAdVerticalMap] = useState<Record<string, string>>({});

  // Track pending changes
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchAdVerticals = async () => {
      try {
        const url =
          "https://panel.adsaro.com/admin/api/AdVertical/?version=5&userToken=l95U5k9sQhhlLEal";
        const res = await fetch(url);
        const json = await res.json();
        const rows = json?.response?.rows as
          | Record<string, { id?: string | number; vertical?: string }>
          | undefined;
        const list = rows
          ? Object.entries(rows).map(([key, value]) => ({
              id: String(value?.id ?? key),
              vertical: String(value?.vertical ?? key),
            }))
          : [];
        const map = list.reduce<Record<string, string>>((acc, item) => {
          acc[item.id] = item.vertical;
          return acc;
        }, {});
        setAdVerticalOptions(list);
        setAdVerticalMap(map);
      } catch (e) {
        console.error("Error fetching Ad Verticals:", e);
        setAdVerticalOptions([]);
        setAdVerticalMap({});
      }
    };

    fetchAdVerticals();
  }, []);

  const columns: ColumnDef<CampaignData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: () => <div className="text-left">ID</div>,
      cell: ({ row }) => {
        return <div className="text-left font-medium">{row.getValue("id")}</div>;
      },
    },
    {
      accessorKey: "is_active",
      header: () => <div className="text-left">Enabled</div>,
      cell: ({ row }) => {
        const currentValue = pendingChanges[row.original.id] !== undefined
          ? pendingChanges[row.original.id]
          : (row.getValue("is_active") as boolean);

        const hasChange = pendingChanges[row.original.id] !== undefined;

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newValue = !currentValue;
                setPendingChanges((prev) => ({
                  ...prev,
                  [row.original.id]: newValue,
                }));
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                currentValue ? "bg-blue-600" : "bg-gray-200"
              } ${hasChange ? "ring-2 ring-yellow-400" : ""}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  currentValue ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm ${currentValue ? "text-green-600" : "text-gray-500"}`}
            >
              {currentValue ? "Active" : "Not Active"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Campaign Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="lowercase">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Ad Formats
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="lowercase">{row.getValue("type")}</div>,
    },
    {
      accessorKey: "budget_total",
      header: () => <div className="text-left">Price</div>,
      cell: ({ row }) => {
        return (
          <div className="text-left font-medium">
            ${Number(row.getValue("budget_total")).toFixed(2)}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-left">Actions</div>,
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push(`/advertiser/campaign/edit/${row?.original?.id}`)}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(row?.original?.id)}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  useEffect(() => {
    if (adVerticalFilter) {
      table.getColumn("ad_vertical")?.setFilterValue(adVerticalFilter);
    } else {
      table.getColumn("ad_vertical")?.setFilterValue(undefined);
    }
  }, [adVerticalFilter]);

  useEffect(() => {
    if (campaignTypeFilter) {
      table.getColumn("type")?.setFilterValue(campaignTypeFilter);
    } else {
      table.getColumn("type")?.setFilterValue(undefined);
    }
  }, [campaignTypeFilter]);

  useEffect(() => {
    if (statusFilter) {
      table.getColumn("is_active")?.setFilterValue(statusFilter === "active");
    } else {
      table.getColumn("is_active")?.setFilterValue(undefined);
    }
  }, [statusFilter]);

  const uniqueAdVerticals = adVerticalOptions.map((v) => v.vertical);
  const uniqueCampaignTypes = Array.from(new Set(data.map((item) => item.type).filter(Boolean)));

  const handleGlobalSave = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      toast.warning("No changes to save");
      return;
    }

    setIsSaving(true);
    try {
      const savePromises = Object.entries(pendingChanges).map(([id, isActive]) =>
        axios.put(`/api/campaign`, {
          data: {
            id: id,
            token: mytoken,
            collectdata: { is_active: isActive },
          },
        })
      );

      const results = await Promise.all(savePromises);

      const allSuccessful = results.every((response) => response.data && response.data.status === "OK");

      if (allSuccessful) {
        setData((prevData) =>
          prevData.map((item) =>
            pendingChanges[item.id] !== undefined
              ? { ...item, is_active: pendingChanges[item.id] }
              : item
          )
        );

        setPendingChanges({});
        toast.success(`Successfully updated ${Object.keys(pendingChanges).length} campaign(s)!`);
      } else {
        throw new Error("Some updates failed");
      }
    } catch (error) {
      console.error("Error updating campaigns:", error);
      toast.error("Failed to update some campaigns. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteDialog = (ids: Array<string | number>) => {
    const normalized = ids.map((v) => String(v)).filter(Boolean);
    if (!normalized.length) return;
    setDeleteIds(normalized);
    setDeleteDialogOpen(true);
  };

  const performDelete = async () => {
    if (!mytoken) return;
    if (!deleteIds.length) return;

    try {
      setIsDeleting(true);
      await Promise.all(
        deleteIds.map((id) =>
          axios.delete(`/api/campaign/${encodeURIComponent(id)}`, {
            headers: {
              Authorization: `Bearer ${mytoken}`,
            },
          })
        )
      );

      setRowSelection({});
      setReloadKey((k) => k + 1);
      setDeleteDialogOpen(false);
      setDeleteIds([]);
    } catch (error) {
      console.error("Error deleting campaign:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = (id: string) => {
    openDeleteDialog([id]);
  };

  const handleClearFilters = () => {
    setAdVerticalFilter("");
    setCampaignTypeFilter("");
    setStatusFilter("");
  };

  const handleExportCSV = () => {
    if (data.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const headers = [
      "ID",
      "Campaign Name",
      "Type",
      "Status",
      "Start Date",
      "End Date",
      "Creatives",
      "Total Budget",
      "Total Cost",
      "Daily Budget",
      "Today's Cost",
      "Clicks/Views per day",
      "Clicks/Views per IP",
      "Impressions per IP",
      "Ad Vertical",
    ];

    const csvRows = [
      headers.join(","),
      ...table.getFilteredRowModel().rows.map((row) => {
        const values = [
          row.getValue("id"),
          `"${String(row.getValue("name") || "").replace(/"/g, '""')}"`,
          row.getValue("type"),
          row.getValue("is_active") ? "Active" : "Not Active",
          row.getValue("start_date"),
          row.getValue("end_date"),
          row.getValue("creatives"),
          row.getValue("budget_total"),
          row.getValue("cost_total"),
          row.getValue("budget_daily"),
          row.getValue("cost_today"),
          row.getValue("clicks_views_per_day"),
          row.getValue("clicks_views_per_ip"),
          row.getValue("impressions_per_ip"),
          `"${String(adVerticalMap[row.original.ad_vertical] || "").replace(/"/g, '""')}"`,
        ];
        return values.join(",");
      }),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `campaigns_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV exported successfully!");
  };

  useEffect(() => {
    if (!mytoken) return;

    setIsLoadingCampaigns(true);

    const yieldToMain = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

    const run = async () => {
      try {
        const cachedCounts =
          creativesCacheRef.current?.token === mytoken ? creativesCacheRef.current.counts : undefined;

        const campaignResp = await axios.get(
          `https://panel.adsaro.com/advertiser/api/Campaign/?version=5&token=${mytoken}`
        );
        const rowsArray = Object.values(campaignResp.data?.response?.rows || {}) as CampaignData[];

        setData(
          rowsArray.map((r) => ({
            ...r,
            creatives: cachedCounts?.[String(r.id)] ?? r.creatives ?? 0,
          }))
        );
        setIsLoadingCampaigns(false);

        if (cachedCounts) {
          setCreativesCountByCampaign(cachedCounts);
          setIsLoadingCreativesCounts(false);
          return;
        }

        setIsLoadingCreativesCounts(true);
        await yieldToMain();

        const offerResp = await axios.get(
          `https://panel.adsaro.com/advertiser/api/OfferNew/?version=5&token=${mytoken}`
        );

        type OfferNewRow = {
          id: number | string;
          ad_campaign_id?: number | string;
          Ad?: { value?: Record<string, unknown> };
        };

        const offers = Object.values(offerResp.data?.response?.rows || {}) as OfferNewRow[];
        const counts: Record<string, number> = {};
        for (let i = 0; i < offers.length; i++) {
          const offer = offers[i];
          const campaignId = offer.ad_campaign_id !== undefined ? String(offer.ad_campaign_id) : "";
          if (campaignId) {
            const creativeCount = offer.Ad?.value ? Object.keys(offer.Ad.value).length : 0;
            counts[campaignId] = (counts[campaignId] ?? 0) + creativeCount;
          }

          if (i > 0 && i % 150 === 0) {
            await yieldToMain();
          }
        }

        creativesCacheRef.current = { token: mytoken, counts };
        setCreativesCountByCampaign(counts);
        setData((prev) =>
          prev.map((r) => ({
            ...r,
            creatives: counts[String(r.id)] ?? r.creatives ?? 0,
          }))
        );
        setIsLoadingCreativesCounts(false);
      } catch (error) {
        console.error("Error fetching campaign/creatives:", error);
        setIsLoadingCampaigns(false);
        setIsLoadingCreativesCounts(false);
      }
    };

    run();
  }, [mytoken, auth?.publisherData, reloadKey]);

  const hasChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className="w-full">
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteIds.length === 1 ? "Delete campaign" : "Delete campaigns"}
            </DialogTitle>
            <DialogDescription>
              {deleteIds.length === 1
                ? "This action cannot be undone."
                : `This will permanently delete ${deleteIds.length} campaigns. This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={performDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex items-center justify-between  gap-2 mb-3">
        <nav className="flex items-center text-sm text-gray-500 mb-3">
          <a
            href="/advertiser/dashboard"
            className="hover:text-gray-700 font-medium transition-colors"
          >
            Home
          </a>

          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800 font-semibold">Campaigns</span>
        </nav>
        <div className="flex gap-2">
          <Input
            placeholder="Search ..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
            className="pl-9 h-9 w-56 text-sm rounded-lg border-gray-200
                   focus:border-[#6a6bcf] focus:ring-[#6a6bcf]/30"
          />

          <Button variant="outline" onClick={handleExportCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        {/* Left side: Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            onClick={handleGlobalSave}
            disabled={!hasChanges || isSaving}
            className={`${
              hasChanges ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"
            } text-white`}
          >
            {isSaving
              ? "Saving..."
              : `Save  ${hasChanges ? `(${Object.keys(pendingChanges).length})` : ""}`}
          </Button>

          <Button
            variant="destructive"
            onClick={() => {
              const selectedRows = table.getFilteredSelectedRowModel().rows;
              if (selectedRows.length === 0) {
                return;
              }
              openDeleteDialog(selectedRows.map((r) => r.original.id));
            }}
            disabled={table.getFilteredSelectedRowModel().rows.length === 0}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>

          {/* Ad Vertical Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Ad Vertical</label>
            <select
              value={adVerticalFilter}
              onChange={(e) => setAdVerticalFilter(e.target.value)}
              className="border border-gray-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              {uniqueAdVerticals.map((vertical) => (
                <option key={vertical} value={vertical}>
                  {vertical}
                </option>
              ))}
            </select>
          </div>

          {/* Campaign Type Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Campaign Type</label>
            <select
              value={campaignTypeFilter}
              onChange={(e) => setCampaignTypeFilter(e.target.value)}
              className="border border-gray-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              {uniqueCampaignTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Not Active</option>
            </select>
          </div>

          <Button variant="outline" onClick={handleClearFilters} size="sm">
            Clear
          </Button>
        </div>

        {/* Right side: Actions */}
        <div className="flex gap-2">
          <Button
            className="bg-[#6a6bcf] hover:bg-[#6a6bcf]/90"
            onClick={() => router.push("/advertiser/campaign/create")}
          >
            Add New Campaign
          </Button>
        </div>
      </div>
      <div className="border rounded-md bg-white">
        <ResponsiveTableWrapper>
          <ResponsiveTable>
            <ResponsiveTableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <ResponsiveTableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </ResponsiveTableHead>
                  ))}
                </TableRow>
              ))}
            </ResponsiveTableHeader>

          <ResponsiveTableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <ResponsiveTableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </ResponsiveTableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <ResponsiveTableCell colSpan={columns.length} className="h-24 text-center">
                  {isLoadingCampaigns ? "Loading..." : "No results."}
                </ResponsiveTableCell>
              </TableRow>
            )}
          </ResponsiveTableBody>
        </ResponsiveTable>
      </ResponsiveTableWrapper>
    </div>

    {/* Pagination */}
    <div className="flex items-center justify-end space-x-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
        selected.
      </div>
      <ResponsivePagination
        currentPage={table.getState().pagination.pageIndex + 1}
        totalPages={table.getPageCount()}
        onPrevious={() => table.previousPage()}
        onNext={() => table.nextPage()}
        canPrevious={table.getCanPreviousPage()}
        canNext={table.getCanNextPage()}
      />
    </div>
  </div>
);
}
