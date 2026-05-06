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

import { ArrowUpDown, Play, Pause, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";

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

import { useEffect, useMemo, useState, useCallback } from "react";

import { useAuth } from "@/context/context";

import { useRouter, useSearchParams } from "next/navigation";

import { toast } from "react-toastify";

  

interface CreativeRow {

  id: string;

  offerId: string;

  adId: string;

  enabled: boolean;

  status: string;

  creativeType: string;

  campaign: string;

  campaignId: string;

  campaignType: string;

  creativeName: string;

  adTitle: string;

  size: string;

  destinationUrl: string;

  adDomain: string;

}



interface CampaignItem {

  id: string;

  name: string;

  type?: string;

}



export function CreativeDataTableDemo() {

  const [sorting, setSorting] = useState<SortingState>([]);

  const router = useRouter();

  const searchParams = useSearchParams();

  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);

  const [loadingCampaigns, setLoadingCampaigns] = useState(false);



  const [statusFilter, setStatusFilter] = useState<string>("");

  const [campaignTypeFilter, setCampaignTypeFilter] = useState<string>("");

  const [campaignFilter, setCampaignFilter] = useState<string>("");



  const [pendingEnabledChanges, setPendingEnabledChanges] = useState<Record<string, boolean>>({});

  const [savingEnabled, setSavingEnabled] = useState(false);

  const [deleting, setDeleting] = useState(false);



  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [data, setData] = useState<CreativeRow[]>([]);

  const [loadingCreatives, setLoadingCreatives] = useState(false);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [rowSelection, setRowSelection] = useState({});



  const auth = useAuth();

  const mytoken = auth?.token;



  const campaignIdToName = useMemo(() => {

    const map: Record<string, string> = {};

    campaigns.forEach((c) => {

      map[String(c.id)] = c.name;

    });

    return map;

  }, [campaigns]);



  const updateOfferNewEnabled = async (

    offerId: string,

    edits: Array<{ id: string; enabled: boolean }>

  ) => {

    if (!mytoken) return;

    const payload = {

      id: Number(offerId),

      Ad: {

        mode: "UPDATE",

        edit: edits.map((e) => ({ id: Number(e.id), enabled: e.enabled })),

      },

    };

    await axios.put(

      `/api/offernew/${encodeURIComponent(offerId)}?version=5&token=${encodeURIComponent(mytoken)}`,

      payload,

      { headers: { "Content-Type": "application/json" } }

    );

  };



  const handleSaveEnabled = async (ids: string[]) => {

    if (!mytoken) return;

    const unique = Array.from(new Set(ids)).filter((id) => id in pendingEnabledChanges);

    if (unique.length === 0) {

      toast.info("No pending changes to save");

      return;

    }

    try {

      setSavingEnabled(true);



      const byOffer: Record<string, Array<{ id: string; enabled: boolean }>> = {};

      unique.forEach((rowId) => {

        const row = data.find((r) => r.id === rowId);

        if (!row) return;

        const offerId = row.offerId;

        if (!byOffer[offerId]) byOffer[offerId] = [];

        byOffer[offerId].push({ id: row.adId, enabled: pendingEnabledChanges[rowId] });

      });



      await Promise.all(

        Object.entries(byOffer).map(([offerId, edits]) => updateOfferNewEnabled(offerId, edits))

      );



      toast.success("Saved changes");

      setPendingEnabledChanges((prev) => {

        const next = { ...prev };

        unique.forEach((id) => delete next[id]);

        return next;

      });

      setData((prev) =>

        prev.map((r) =>

          unique.includes(r.id)

            ? {

                ...r,

                enabled: pendingEnabledChanges[r.id],

              }

            : r

        )

      );

    } catch (e) {

      console.error("Failed to save enabled changes", e);

      toast.error("Failed to save changes");

    } finally {

      setSavingEnabled(false);

    }

  };



  const handleDelete = async (offerId: string) => {

    if (!mytoken) return;

    const ok = window.confirm(`Delete creative #${offerId}?`);

    if (!ok) return;

    try {

      setDeleting(true);

      await axios.delete(

        `/api/offernew/${encodeURIComponent(offerId)}?version=5&token=${encodeURIComponent(mytoken)}`

      );

      toast.success("Creative deleted");

      setData((prev) => prev.filter((r) => r.offerId !== offerId));

      setPendingEnabledChanges((prev) => {

        const next = { ...prev };

        Object.keys(next).forEach((k) => {

          if (k.startsWith(`${offerId}:`)) delete next[k];

        });

        return next;

      });

    } catch (e) {

      console.error("Failed to delete creative", e);

      toast.error("Failed to delete creative");

    } finally {

      setDeleting(false);

    }

  };



  const getOfferApprovalStatus = useCallback((offer: any): string => {

    const adMap: Record<string, any> = offer?.Ad?.value ?? {};

    const adList = Object.values(adMap);

    const first = adList.length > 0 ? adList[0] : undefined;

    const nested = first?.approval_status;

    if (nested != null && String(nested).trim() !== "") return String(nested);

    return "—";

  }, []);



  const processOfferToRows = useCallback((offer: any): CreativeRow[] => {

    const rows: CreativeRow[] = [];

    const offerId = String(offer.id);

    const campaignId = offer.ad_campaign_id ? String(offer.ad_campaign_id) : "—";

    const creativeName = offer.name ?? `Creative #${offerId}`;

    const adMap: Record<string, any> = offer.Ad?.value ?? {};

    const adList = Object.values(adMap);



    if (adList.length === 0) {

      rows.push({

        id: `${offerId}:0`,

        offerId,

        adId: "0",

        enabled: Boolean(offer.is_active),

        status: getOfferApprovalStatus(offer),

        creativeType: offer.campaign_type ?? "—",

        campaign: creativeName,

        campaignId,

        campaignType: offer.campaign_type ?? "—",

        creativeName: creativeName,

        adTitle: "No ads",

        size: "—",

        destinationUrl: offer.imp_url ?? "—",

        adDomain: "—",

      });

      return rows;

    }



    adList.forEach((ad: any) => {

      const adId = ad?.id != null ? String(ad.id) : "0";

      const firstImg = ad?.images?.[0];

      const size =

        firstImg?.width && firstImg?.height

          ? `${firstImg.width} × ${firstImg.height}`

          : "—";

      rows.push({

        id: `${offerId}:${adId}`,

        offerId,

        adId,

        enabled: ad?.enabled !== false,

        status: ad?.approval_status ?? "—",

        creativeType: ad?.type ?? "—",

        campaign: creativeName,

        campaignId,

        campaignType: offer.campaign_type ?? "—",

        creativeName: creativeName,

        adTitle: ad?.title ?? "Untitled Ad",

        size,

        destinationUrl: ad?.dest_url ?? offer.imp_url ?? "—",

        adDomain: ad?.display ?? "—",

      });

    });



    return rows;

  }, [getOfferApprovalStatus]);



  const columns = useMemo<ColumnDef<CreativeRow>[]>(

    () => [

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

        filterFn: (row, _columnId, filterValue) => {

          if (!filterValue) return true;

          const rawId = row.getValue("id");

          const fullId = rawId == null ? "" : String(rawId);

          const adId = fullId.includes(':') ? fullId.split(':')[1] : fullId;

          return adId.toLowerCase().includes(filterValue.toLowerCase());

        },

        header: () => <div>ID</div>,

        cell: ({ row }) => {

          const rawId = row.getValue("id");

          const fullId = rawId == null ? "" : String(rawId);

          const adId = fullId.includes(':') ? fullId.split(':')[1] : fullId;

          return <div className="font-medium">{adId}</div>;

        },

      },

      {

        accessorKey: "creativeName",

        header: ({ column }) => (

          <Button

            variant="ghost"

            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

          >

            Creative Name

            <ArrowUpDown className="ml-2 h-4 w-4" />

          </Button>

        ),

        cell: ({ row }) => <div className="font-medium">{row.getValue("creativeName")}</div>,

      },

      {

        accessorKey: "campaign",

        filterFn: (row, _columnId, filterValue) => {

          if (!filterValue) return true;

          return String(row.original.campaignId ?? "") === String(filterValue);

        },

        header: ({ column }) => (

          <Button

            variant="ghost"

            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

          >

            Campaign

            <ArrowUpDown className="ml-2 h-4 w-4" />

          </Button>

        ),

        cell: ({ row }) => {

          const cid = String(row.original.campaignId ?? "");

          const label = campaignIdToName[cid] ?? cid;

          return <div>{label}</div>;

        },

      },

      {

        accessorKey: "enabled",

        header: () => <div>Enabled</div>,

        cell: ({ row }) => {

          const base = row.getValue("enabled") as boolean;

          const override = pendingEnabledChanges[row.original.id];

          const val = override !== undefined ? override : base;

          return (

            <span

              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${

                val ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"

              }`}

            >

              {val ? "Yes" : "No"}

            </span>

          );

        },

      },

      {

        accessorKey: "campaignType",

        header: ({ column }) => (

          <Button

            variant="ghost"

            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

          >

            Ad Format

            <ArrowUpDown className="ml-2 h-4 w-4" />

          </Button>

        ),

        cell: ({ row }) => <div>{row.getValue("campaignType")}</div>,

      },

      {

        accessorKey: "status",

        header: ({ column }) => (

          <Button

            variant="ghost"

            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

          >

            Status

            <ArrowUpDown className="ml-2 h-4 w-4" />

          </Button>

        ),

        cell: ({ row }) => {

          const s = String(row.getValue("status") ?? "");

          const u = s.toUpperCase();

          const cls =

            u === "APPROVED"

              ? "bg-green-100 text-green-700"

              : u === "PENDING"

              ? "bg-yellow-100 text-yellow-700"

              : "bg-gray-100 text-gray-600";

          return (

            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}>

              {s}

            </span>

          );

        },

      },

      {

        id: "actions",

        header: () => <div className="text-left">Actions</div>,

        enableHiding: false,

        cell: ({ row }) => {

          const hasChange = row.original.id in pendingEnabledChanges;

          const currentValue =

            pendingEnabledChanges[row.original.id] !== undefined

              ? pendingEnabledChanges[row.original.id]

              : row.original.enabled;

          return (

            <div className="flex items-center gap-2">

              <Button

                variant="ghost"

                size="sm"

                onClick={() => {

                  const newValue = !currentValue;

                  setPendingEnabledChanges((prev) => ({

                    ...prev,

                    [row.original.id]: newValue,

                  }));

                }}

                className={`h-8 w-8 p-0 ${hasChange ? "ring-2 ring-yellow-400 rounded" : ""}`}

                title={currentValue ? "Disable ad" : "Enable ad"}

              >

                {currentValue ? (

                  <Pause className="h-4 w-4 text-orange-600" />

                ) : (

                  <Play className="h-4 w-4 text-green-600" />

                )}

              </Button>



              <Button

                variant="ghost"

                size="sm"

                onClick={() => handleDelete(row?.original?.offerId)}

                className="h-8 w-8 p-0"

                title="Delete creative"

                disabled={deleting}

              >

                <Trash2 className="h-4 w-4 text-red-600" />

              </Button>

            </div>

          );

        },

      },

    ],

    [pendingEnabledChanges, deleting, campaignIdToName]

  );



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

    state: { sorting, columnFilters, columnVisibility, rowSelection },

  });



  // Fetch creative data with progressive loading

  useEffect(() => {

    if (!mytoken) return;

    

    const fetchCreatives = async () => {

      try {

        setLoadingCreatives(true);

        setData([]);

        

        const filterCampaignId =

          searchParams?.get("filters.campaignId") ?? searchParams?.get("campaign_id");

        const filterCampaignType = searchParams?.get("filters.campaignType");

        const filterStatus = searchParams?.get("filters.status") ?? searchParams?.get("status");

        const sortParam = searchParams?.get("sort");



        const response = await axios.get(

          `/api/offernew?version=5&token=${encodeURIComponent(mytoken)}`

        );



        let ads = Object.values(response.data?.response?.rows || []);



        if (filterCampaignId) {

          ads = ads.filter((ad: any) => String(ad.ad_campaign_id ?? "") === String(filterCampaignId));

        }

        if (filterCampaignType) {

          const target = String(filterCampaignType).toUpperCase();

          ads = ads.filter(

            (ad: any) => String(ad.campaign_type ?? "").toUpperCase() === target

          );

        }

        if (filterStatus) {

          const target = String(filterStatus).toUpperCase();

          ads = ads.filter((offer: any) => getOfferApprovalStatus(offer).toUpperCase() === target);

        }



        if (sortParam === "id-desc") {

          ads = [...ads].sort((a: any, b: any) => {

            const aNum = Number(a.id);

            const bNum = Number(b.id);

            if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return bNum - aNum;

            return String(b.id).localeCompare(String(a.id));

          });

        }



        const CHUNK_SIZE = 10;

        const totalOffers = ads.length;

        

        for (let i = 0; i < totalOffers; i += CHUNK_SIZE) {

          const chunk = ads.slice(i, i + CHUNK_SIZE);

          const chunkRows: CreativeRow[] = [];

          

          chunk.forEach((offer: any) => {

            const rows = processOfferToRows(offer);

            chunkRows.push(...rows);

          });

          

          setData((prev) => [...prev, ...chunkRows]);

          

          if (i + CHUNK_SIZE < totalOffers) {

            await new Promise(resolve => setTimeout(resolve, 50));

          }

        }



      } catch (err) {

        console.error("❌ Error fetching creatives:", err);

        toast.error("Failed to load creatives");

        setData([]);

      } finally {

        setLoadingCreatives(false);

      }

    };

    

    fetchCreatives();

  }, [mytoken, searchParams, processOfferToRows, getOfferApprovalStatus]);



  useEffect(() => {

    const fetchCampaigns = async () => {

      if (!mytoken) return;

      try {

        setLoadingCampaigns(true);

        const resp = await axios.get(

          `https://panel.adsaro.com/advertiser/api/Campaign/?version=4&token=${encodeURIComponent(mytoken)}`

        );

        const rows = Object.values(resp.data?.response?.rows || {}) as Array<{

          id: number | string;

          name?: string;

          type?: string;

        }>;



        const list: CampaignItem[] = rows.map((r) => ({

          id: String(r.id),

          name: r.name ?? String(r.id),

          type: r.type,

        }));

        setCampaigns(list);

      } catch (e) {

        console.error("Failed to load campaigns", e);

        toast.error("Failed to load campaigns");

      } finally {

        setLoadingCampaigns(false);

      }

    };

    fetchCampaigns();

  }, [mytoken]);



  const uniqueStatuses = useMemo(() => {

    const set = new Set<string>();

    data.forEach((r) => {

      const s = String(r.status ?? "").trim();

      if (s && s !== "—") set.add(s);

    });

    return Array.from(set);

  }, [data]);



  const uniqueCampaignTypes = useMemo(() => {

    const set = new Set<string>();

    data.forEach((r) => {

      const s = String(r.campaignType ?? "").trim();

      if (s && s !== "—") set.add(s);

    });

    return Array.from(set);

  }, [data]);



  const selectedRowIds = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);



  const handleBulkDelete = async () => {

    if (!mytoken) return;

    if (selectedRowIds.length === 0) {

      toast.info("Select rows to delete");

      return;

    }

    const offerIds = Array.from(

      new Set(

        table

          .getFilteredSelectedRowModel()

          .rows.map((r) => (r.original as CreativeRow).offerId)

      )

    );

    const ok = window.confirm(`Delete ${offerIds.length} creatives?`);

    if (!ok) return;

    try {

      setDeleting(true);

      await Promise.all(

        offerIds.map((id) =>

          axios.delete(

            `/api/offernew/${encodeURIComponent(id)}?version=5&token=${encodeURIComponent(mytoken)}`

          )

        )

      );

      toast.success("Creatives deleted");

      setData((prev) => prev.filter((r) => !offerIds.includes(r.offerId)));

      setRowSelection({});

      setPendingEnabledChanges((prev) => {

        const next = { ...prev };

        Object.keys(next).forEach((k) => {

          if (offerIds.some((oid) => k.startsWith(`${oid}:`))) delete next[k];

        });

        return next;

      });

    } catch (e) {

      console.error("Bulk delete failed", e);

      toast.error("Bulk delete failed");

    } finally {

      setDeleting(false);

    }

  };



  const handleClearFilters = () => {

    table.resetColumnFilters();

    setStatusFilter("");

    setCampaignTypeFilter("");

    setCampaignFilter("");

  };



  return (

    <div className="w-full  mt-2">

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-2">

        <nav className="flex items-center text-sm text-gray-500">

          <a href="/advertiser/dashboard" className="font-medium hover:text-[#6a6bcf] transition-colors pl-3">

            Home

          </a>

          <span className="mx-2 text-gray-300">/</span>

          <span className="text-gray-800 font-semibold">Creatives</span>

        </nav>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">

          <div className="relative">

            <svg

              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"

              fill="none"

              stroke="currentColor"

              strokeWidth="2"

              viewBox="0 0 24 24"

            >

              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />

            </svg>

            <Input

              placeholder="Search ..."

              value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}

              onChange={(event) => table.getColumn("id")?.setFilterValue(event.target.value)}

              className="pl-9 h-9 w-full sm:w-56 text-sm rounded-lg border-gray-200 focus:border-[#6a6bcf] focus:ring-[#6a6bcf]/30"

            />

          </div>

          <a href="/advertiser/creative/create" 

          className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 h-9 text-sm font-medium text-white bg-[#6a6bcf] rounded-lg shadow-sm hover:bg-[#5a5bc4] transition-all duration-300">

            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">

              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />

            </svg>

            Add Creative

          </a>

        </div>

      </div>

      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:flex-wrap sm:items-center">

        <Button 

          variant="outline"

          className={`h-9 w-full sm:w-auto ${
            savingEnabled
              ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed hover:bg-gray-50"
              : ""
          }`}

          onClick={() =>
            handleSaveEnabled(
              selectedRowIds.length
                ? selectedRowIds
                : Object.keys(pendingEnabledChanges)
            )
          }

          disabled={savingEnabled}

        >

          {savingEnabled ? (
            <>

              <Loader2 className="mr-2 h-4 w-4 animate-spin" />

              Saving...

            </>

          ) : (
            "Save"
          )}

        </Button>

        <Button

          variant="destructive"

          className="h-9 w-full sm:w-auto"

          onClick={handleBulkDelete}

          disabled={selectedRowIds.length === 0 || deleting}

        >

          {deleting ? (

            <>

              <Loader2 className="mr-2 h-4 w-4 animate-spin" />

              Deleting...

            </>

          ) : (

            "Delete"

          )}

        </Button>



        <div className="flex items-center gap-2">

          <span className="text-sm text-gray-600">Status</span>

          <select

            value={statusFilter}

            onChange={(e) => {

              const v = e.target.value;

              setStatusFilter(v);

              table.getColumn("status")?.setFilterValue(v || undefined);

            }}

            className="h-9 rounded-lg border border-gray-200 px-3 text-sm"

          >

            <option value="">All</option>

            {uniqueStatuses.map((s) => (

              <option key={s} value={s}>

                {s}

              </option>

            ))}

          </select>

        </div>



        <div className="flex items-center gap-2">

          <span className="text-sm text-gray-600">Ad Format</span>

          <select

            value={campaignTypeFilter}

            onChange={(e) => {

              const v = e.target.value;

              setCampaignTypeFilter(v);

              table.getColumn("campaignType")?.setFilterValue(v || undefined);

            }}

            className="h-9 rounded-lg border border-gray-200 px-3 text-sm"

          >

            <option value="">All</option>

            {uniqueCampaignTypes.map((s) => (

              <option key={s} value={s}>

                {s}

              </option>

            ))}

          </select>

        </div>



        <div className="flex items-center gap-2">

          <span className="text-sm text-gray-600">Campaign</span>

          <select

            value={campaignFilter}

            onChange={(e) => {

              const v = e.target.value;

              setCampaignFilter(v);

              table.getColumn("campaign")?.setFilterValue(v || undefined);

            }}

            className="h-9 rounded-lg border border-gray-200 px-3 text-sm"

            disabled={loadingCampaigns}

          >

            <option value="">All</option>

            {campaigns.map((c) => (

              <option key={c.id} value={c.id}>

                {c.name}

              </option>

            ))}

          </select>

        </div>



        <Button variant="outline" className="h-9" onClick={handleClearFilters}>

          Clear Filters

        </Button>

      </div>



      {loadingCreatives && data.length > 0 && (

        <div className="mb-4 flex items-center justify-center py-2 bg-blue-50 rounded-lg">

          <Loader2 className="h-4 w-4 animate-spin text-[#6a6bcf]" />

          <span className="ml-2 text-sm text-gray-600">Loading more creatives...</span>

        </div>

      )}



      <ResponsiveTableWrapper>

        <div className="hidden md:block border rounded-md border rounded-md bg-white">

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

              {table.getRowModel().rows.length ? (

                table.getRowModel().rows.map((row) => (

                  <TableRow 

                    key={row.id} 

                    data-state={row.getIsSelected() && "selected"}

                  >

                    {row.getVisibleCells().map((cell) => (

                      <ResponsiveTableCell key={cell.id}>

                        {flexRender(cell.column.columnDef.cell, cell.getContext())}

                      </ResponsiveTableCell>

                    ))}

                  </TableRow>

                ))

              ) : !loadingCreatives ? (

                <TableRow>

                  <ResponsiveTableCell colSpan={columns.length} className="h-24 text-center">

                    No results.

                  </ResponsiveTableCell>

                </TableRow>

              ) : null}

            </ResponsiveTableBody>

          </ResponsiveTable>



          {loadingCreatives && data.length === 0 && (

            <div className="flex items-center justify-center py-12">

              <Loader2 className="h-8 w-8 animate-spin text-[#6a6bcf]" />

              <span className="ml-3 text-gray-600">Loading creatives...</span>

            </div>

          )}

        </div>



        <div className="md:hidden space-y-4">

          {table.getRowModel().rows.length ? (

            table.getRowModel().rows.map((row) => (

              <MobileCard key={row.id}>

                <MobileCardHeader>

                  <div className="flex flex-col gap-1">

                    <span className="font-medium">{row.original.creativeName}</span>

                    <span className="text-sm text-gray-600">{row.original.adTitle}</span>

                  </div>

                  <ResponsiveActions>

                    <Checkbox

                      checked={row.getIsSelected()}

                      onCheckedChange={(value) => row.toggleSelected(!!value)}

                      aria-label="Select row"

                    />

                  </ResponsiveActions>

                </MobileCardHeader>

                <MobileCardContent>

                  <MobileCardField 

                    label="ID" 

                    value={row.original.id.includes(':') ? row.original.id.split(':')[1] : row.original.id} 

                  />

                  <MobileCardField label="Enabled" value={row.original.enabled ? "Yes" : "No"} />

                  <MobileCardField label="Status" value={row.original.status} />

                  <MobileCardField label="Ad Format" value={row.original.campaignType} />

                  <MobileCardField

                    label="Campaign"

                    value={campaignIdToName[String(row.original.campaignId ?? "")] ?? row.original.campaignId}

                  />

                  <MobileCardField label="Size" value={row.original.size} />

                  <MobileCardField

                    label="Destination"

                    value={

                      row.original.destinationUrl && row.original.destinationUrl !== "—" ? (

                        <a 

                          href={row.original.destinationUrl}

                          target="_blank"

                          rel="noopener noreferrer"

                          className="text-blue-600 hover:underline"

                        >

                          {row.original.destinationUrl}

                        </a>

                      ) : (

                        "—"

                      )

                    }

                  />

                  <MobileCardField label="Ad Domain" value={row.original.adDomain} />

                </MobileCardContent>

              </MobileCard>

            ))

          ) : !loadingCreatives ? (

            <div className="text-center py-8 text-muted-foreground">No results.</div>

          ) : null}

        </div>

      </ResponsiveTableWrapper>
       <div className="flex items-center  py-4 space-x-2">

        <div className="text-sm text-muted-foreground">

          {table.getFilteredSelectedRowModel().rows.length} of{" "}

          {table.getFilteredRowModel().rows.length} row(s) selected.

        </div>

        <div className="space-x-2">

          <Button

            variant="outline"

            size="sm"

            onClick={() => table.previousPage()}

            disabled={!table.getCanPreviousPage()}

          >

            Previous

          </Button>

          <Button

            variant="outline"

            size="sm"

            onClick={() => table.nextPage()}

            disabled={!table.getCanNextPage()}

          >

            Next

          </Button>

        </div>

      </div>

    </div>

  );

}