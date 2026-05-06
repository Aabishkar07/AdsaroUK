"use client";

import * as React from "react";
import axios from "axios";

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
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";

import {
  buildAdvertiserReportUrls,
  normalizeAdvertiserReportRows,
  type AdvertiserReportGroupBy,
  type AdvertiserReportType,
} from "@/lib/advertiser-reporting";

import { useAuth } from "@/context/context";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown } from "lucide-react";

interface CombinedReportRow {
  report_source?: "XML" | "Display";
  date?: string;
  country?: string;
  campaign_id?: number | string;
  campaign_name?: string;

  adv_responses?: number;
  adv_impressions?: number;
  adv_clicks?: number;
  adv_conversions?: number;
  adv_cost?: number;
  adv_profit?: number;
  adv_ctr?: number;
  adv_roi?: number;
}

function toNumber(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const s = String(v).trim();
  const normalized = s.replace(/,/g, "").replace(/%/g, "");
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

function headerSortIcon(isSorted: false | "asc" | "desc") {
  if (isSorted === "asc") return <ArrowUp className="ml-2 h-4 w-4" />;
  if (isSorted === "desc") return <ArrowDown className="ml-2 h-4 w-4" />;
  return <ArrowUpDown className="ml-2 h-4 w-4" />;
}

function getColumns(
  reportType: AdvertiserReportType,
  groupBy: AdvertiserReportGroupBy,
): ColumnDef<CombinedReportRow>[] {
  const columns: ColumnDef<CombinedReportRow>[] = [
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
    // {
    //   accessorKey: "report_source",
    //   header: () => <div>Report</div>,
    //   cell: ({ row }) => {
    //     const v = row.getValue("report_source") as string | null | undefined;
    //     return <div className="font-medium">{v || "N/A"}</div>;
    //   },
    // },
  ];

  if (groupBy === "date") {
    columns.push({
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          {headerSortIcon(column.getIsSorted())}
        </Button>
      ),
      cell: ({ row }) => {
        const v = row.getValue("date") as string | null | undefined;
        return <div className="font-medium">{v || "-"}</div>;
      },
      sortingFn: (a, b) => {
        const av = a.getValue("date") as string | null | undefined;
        const bv = b.getValue("date") as string | null | undefined;
        return String(av ?? "").localeCompare(String(bv ?? ""));
      },
    });
  }

  if (groupBy === "country") {
    columns.push({
      accessorKey: "country",
      header: () => <div>Country</div>,
      cell: ({ row }) => {
        const v = row.getValue("country") as string | null | undefined;
        return <div className="font-medium">{v || "-"}</div>;
      },
    });
  }

  if (groupBy === "campaign") {
    columns.push({
      accessorKey: "campaign_id",
      header: () => <div>Campaign ID</div>,
      cell: ({ row }) => {
        const v = row.getValue("campaign_id") as
          | number
          | string
          | null
          | undefined;
        return (
          <div className="font-medium">
            {v != null && v !== "" ? String(v) : "-"}
          </div>
        );
      },
    });
    columns.push({
      accessorKey: "campaign_name",
      header: () => <div>Campaign</div>,
      cell: ({ row }) => {
        const v = row.getValue("campaign_name") as string | null | undefined;
        return <div className="font-medium">{v || "-"}</div>;
      },
    });
  }

  columns.push(
    // {
    //   accessorKey: "adv_responses",
    //   header: () => <div>Responses</div>,
    //   cell: ({ row }) => {
    //     const v = row.getValue("adv_responses") as number | null | undefined;
    //     return <div className="font-medium">{v != null ? v.toLocaleString() : "-"}</div>;
    //   },
    // },
    {
      accessorKey: "adv_impressions",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Impressions
          {headerSortIcon(column.getIsSorted())}
        </Button>
      ),
      cell: ({ row }) => {
        const v = row.getValue("adv_impressions") as number | null | undefined;
        return (
          <div className="font-medium">
            {v != null ? v.toLocaleString() : "-"}
          </div>
        );
      },
      sortingFn: (a, b) =>
        toNumber(a.getValue("adv_impressions")) -
        toNumber(b.getValue("adv_impressions")),
    },
    {
      accessorKey: "adv_clicks",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Clicks
          {headerSortIcon(column.getIsSorted())}
        </Button>
      ),
      cell: ({ row }) => {
        const v = row.getValue("adv_clicks") as number | null | undefined;
        return (
          <div className="font-medium">
            {v != null ? v.toLocaleString() : "-"}
          </div>
        );
      },
      sortingFn: (a, b) =>
        toNumber(a.getValue("adv_clicks")) - toNumber(b.getValue("adv_clicks")),
    },
    {
      accessorKey: "adv_cost",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Spend
          {headerSortIcon(column.getIsSorted())}
        </Button>
      ),
      cell: ({ row }) => {
        const raw = row.getValue("adv_cost") as
          | number
          | string
          | null
          | undefined;
        const n =
          raw == null
            ? null
            : typeof raw === "number"
              ? raw
              : parseFloat(String(raw));
        return (
          <div className="font-medium">
            {n == null || Number.isNaN(n)
              ? "-"
              : `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
        );
      },
      sortingFn: (a, b) =>
        toNumber(a.getValue("adv_cost")) - toNumber(b.getValue("adv_cost")),
    },
    // {
    //   accessorKey: "adv_profit",
    //   header: () => <div>Profit</div>,
    //   cell: ({ row }) => {
    //     const raw = row.getValue("adv_profit") as number | string | null | undefined;
    //     const n = raw == null ? null : typeof raw === "number" ? raw : parseFloat(String(raw));
    //     return (
    //       <div className="font-medium">
    //         {n == null || Number.isNaN(n)
    //           ? "-"
    //           : `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
    //       </div>
    //     );
    //   },
    // },
    {
      id: "adv_ctr",
      accessorFn: (row) => {
        const isDisplay =
          reportType === "Display" || row.report_source === "Display";

        if (isDisplay) {
          const conversions = toNumber(row.adv_conversions);
          const impressions = toNumber(row.adv_impressions);
          if (
            !Number.isFinite(conversions) ||
            !Number.isFinite(impressions) ||
            impressions === 0
          )
            return null;
          return (conversions / impressions) * 100;
        }

        const clicks = toNumber(row.adv_clicks);
        const responses = toNumber(row.adv_responses);
        if (
          !Number.isFinite(clicks) ||
          !Number.isFinite(responses) ||
          responses === 0
        )
          return null;
        return (clicks / responses) * 100;
      },
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {reportType === "Display" ? "CR" : "CTR"}
          {headerSortIcon(column.getIsSorted())}
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("adv_ctr") as number | null;
        return (
          <div className="font-medium">
            {value == null || Number.isNaN(value)
              ? "-"
              : `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`}
          </div>
        );
      },
      sortingFn: (a, b, columnId) =>
        toNumber(a.getValue(columnId)) - toNumber(b.getValue(columnId)),
    },

    // {
    //   accessorKey: "adv_roi",
    //   header: () => <div>ROI</div>,
    //   cell: ({ row }) => {
    //     const raw = row.getValue("adv_roi") as number | string | null | undefined;
    //     const n = raw == null ? null : typeof raw === "number" ? raw : parseFloat(String(raw));
    //     return (
    //       <div className="font-medium">
    //         {n == null || Number.isNaN(n)
    //           ? "-"
    //           : `${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`}
    //       </div>
    //     );
    //   },
    // },
  );

  return columns;
}

function toIsoDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function CombinedReportTable() {
  const { token } = useAuth();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [data, setData] = React.useState<CombinedReportRow[]>([]);
  const [fromDate, setFromDate] = React.useState<string>("");
  const [toDate, setToDate] = React.useState<string>("");
  const [defaultFromDate, setDefaultFromDate] = React.useState<string>("");
  const [defaultToDate, setDefaultToDate] = React.useState<string>("");
  const [activeRange, setActiveRange] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [reportType, setReportType] =
    React.useState<AdvertiserReportType>("All");
  const [groupBy, setGroupBy] = React.useState<AdvertiserReportGroupBy>("date");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [reloadKey, setReloadKey] = React.useState(0);
  const [apiTotals, setApiTotals] = React.useState<
    Partial<Record<Exclude<AdvertiserReportType, "All">, CombinedReportRow>>
  >({});

  const columns = React.useMemo(
    () => getColumns(reportType, groupBy),
    [reportType, groupBy],
  );

  const searchColumnId = React.useMemo(() => {
    if (groupBy === "country") return "country";
    if (groupBy === "campaign") return "campaign_name";
    return "date";
  }, [groupBy]);

  const tableData = React.useMemo((): CombinedReportRow[] => {
    if (reportType !== "All") return data;

    const keyOf = (r: CombinedReportRow): string => {
      if (groupBy === "country") return String(r.country ?? "");
      if (groupBy === "campaign") return String(r.campaign_id ?? "");
      return String(r.date ?? "");
    };

    const map = new Map<string, CombinedReportRow>();

    for (const r of data) {
      const key = keyOf(r);
      if (!key) continue;

      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          report_source: undefined,
          date: groupBy === "date" ? r.date : undefined,
          country: groupBy === "country" ? r.country : undefined,
          campaign_id: groupBy === "campaign" ? r.campaign_id : undefined,
          campaign_name: groupBy === "campaign" ? r.campaign_name : undefined,

          adv_responses: toNumber(r.adv_responses),
          adv_impressions: toNumber(r.adv_impressions),
          adv_clicks: toNumber(r.adv_clicks),
          adv_conversions: toNumber(r.adv_conversions),
          adv_cost: toNumber(r.adv_cost),
          adv_profit: toNumber(r.adv_profit),
        });
        continue;
      }

      existing.adv_responses =
        toNumber(existing.adv_responses) + toNumber(r.adv_responses);
      existing.adv_impressions =
        toNumber(existing.adv_impressions) + toNumber(r.adv_impressions);
      existing.adv_clicks =
        toNumber(existing.adv_clicks) + toNumber(r.adv_clicks);
      existing.adv_conversions =
        toNumber(existing.adv_conversions) + toNumber(r.adv_conversions);
      existing.adv_cost = toNumber(existing.adv_cost) + toNumber(r.adv_cost);
      existing.adv_profit =
        toNumber(existing.adv_profit) + toNumber(r.adv_profit);

      if (groupBy === "campaign") {
        if (!existing.campaign_name && r.campaign_name) {
          existing.campaign_name = r.campaign_name;
        }
      }
    }

    return Array.from(map.values());
  }, [data, reportType, groupBy]);

  const table = useReactTable({
    data: tableData,
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

  React.useEffect(() => {
    if (groupBy !== "date") return;
    if (sorting.some((s) => s.id === "date")) return;
    setSorting([{ id: "date", desc: true }]);
  }, [groupBy, sorting]);

  const handleExportCSV = React.useCallback(() => {
    const escapeCsv = (value: unknown): string => {
      if (value === null || value === undefined) return "";
      const s = String(value);
      const needsQuotes = /[\n\r,\"]/g.test(s);
      const escaped = s.replace(/\"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const formatCell = (row: CombinedReportRow, columnId: string): string => {
      if (columnId === "adv_cost") {
        const raw = row.adv_cost;
        const n =
          raw == null
            ? null
            : typeof raw === "number"
              ? raw
              : parseFloat(String(raw));
        if (n == null || Number.isNaN(n)) return "";
        return n.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }

      if (columnId === "adv_ctr") {
        const isDisplay =
          reportType === "Display" || row.report_source === "Display";
        const value = isDisplay
          ? (() => {
              const conversionsRaw = row.adv_conversions;
              const impressionsRaw = row.adv_impressions;
              const conversions =
                conversionsRaw == null
                  ? null
                  : typeof conversionsRaw === "number"
                    ? conversionsRaw
                    : parseFloat(String(conversionsRaw));
              const impressions =
                impressionsRaw == null
                  ? null
                  : typeof impressionsRaw === "number"
                    ? impressionsRaw
                    : parseFloat(String(impressionsRaw));
              if (conversions == null || impressions == null) return null;
              if (
                !Number.isFinite(conversions) ||
                !Number.isFinite(impressions) ||
                impressions === 0
              )
                return null;
              return (conversions / impressions) * 100;
            })()
          : (() => {
              const clicksRaw = row.adv_clicks;
              const responsesRaw = row.adv_responses;
              const clicks =
                clicksRaw == null
                  ? null
                  : typeof clicksRaw === "number"
                    ? clicksRaw
                    : parseFloat(String(clicksRaw));
              const responses =
                responsesRaw == null
                  ? null
                  : typeof responsesRaw === "number"
                    ? responsesRaw
                    : parseFloat(String(responsesRaw));
              if (clicks == null || responses == null) return null;
              if (
                !Number.isFinite(clicks) ||
                !Number.isFinite(responses) ||
                responses === 0
              )
                return null;
              return (clicks / responses) * 100;
            })();

        if (value == null || Number.isNaN(value)) return "";
        return value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }

      const v = (row as any)?.[columnId];
      if (typeof v === "number") return v.toLocaleString();
      return v == null ? "" : String(v);
    };

    const visibleColumns = table
      .getVisibleLeafColumns()
      .filter((c) => c.id !== "select");

    if (visibleColumns.length === 0) return;

    const headers = visibleColumns.map((c) => {
      if (c.id === "adv_ctr") return reportType === "Display" ? "CR" : "CTR";
      if (c.id === "adv_cost") return "Spend";
      if (c.id === "campaign_id") return "Campaign ID";
      if (c.id === "campaign_name") return "Campaign";
      if (c.id === "adv_impressions") return "Impressions";
      if (c.id === "adv_clicks") return "Clicks";
      return c.id;
    });

    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const rowsToExport =
      selectedRows.length > 0 ? selectedRows : table.getSortedRowModel().rows;

    const csvLines: string[] = [];
    csvLines.push(headers.map(escapeCsv).join(","));

    for (const r of rowsToExport) {
      const line = visibleColumns
        .map((c) => escapeCsv(formatCell(r.original, c.id)))
        .join(",");
      csvLines.push(line);
    }

    const csv = csvLines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const effectiveFrom = fromDate || defaultFromDate;
    const effectiveTo = toDate || defaultToDate;
    const fileName =
      `combined-report_${reportType}_${groupBy}_${effectiveFrom || ""}_${effectiveTo || ""}.csv`
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_.-]/g, "");

    a.download = fileName || "combined-report.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [
    table,
    reportType,
    groupBy,
    fromDate,
    toDate,
    defaultFromDate,
    defaultToDate,
  ]);

  const totals = React.useMemo(() => {
    const toNumber = (v: unknown): number => {
      if (v === null || v === undefined || v === "") return 0;
      if (typeof v === "number") return Number.isFinite(v) ? v : 0;
      const s = String(v).trim();
      const normalized = s.replace(/,/g, "").replace(/%/g, "");
      const n = parseFloat(normalized);
      return Number.isFinite(n) ? n : 0;
    };

    const filteredRows = table.getFilteredRowModel().rows;

    let impressionsAll = 0;
    let clicksAll = 0;
    let conversionsAll = 0;
    let spendAll = 0;

    let impressionsXml = 0;
    let clicksXml = 0;
    let responsesXml = 0;

    let impressionsDisplay = 0;
    let conversionsDisplay = 0;

    for (const r of filteredRows) {
      const impressions = toNumber(r.original.adv_impressions);
      const clicks = toNumber(r.original.adv_clicks);
      const conversions = toNumber(r.original.adv_conversions);
      const spend = toNumber(r.original.adv_cost);
      const responses = toNumber(r.original.adv_responses);

      impressionsAll += impressions;
      clicksAll += clicks;
      conversionsAll += conversions;
      spendAll += spend;

      const src = r.original.report_source;
      if (src === "XML") {
        impressionsXml += impressions;
        clicksXml += clicks;
        responsesXml += responses;
      }
      if (src === "Display") {
        impressionsDisplay += impressions;
        conversionsDisplay += conversions;
      }
    }

    const ctrXml = responsesXml > 0 ? (clicksXml / responsesXml) * 100 : 0;
    const crDisplay =
      impressionsDisplay > 0
        ? (conversionsDisplay / impressionsDisplay) * 100
        : 0;

    const hasColumnFilters = table.getState().columnFilters.length > 0;
    const canUseApiTotals = !hasColumnFilters;
    const xmlTotal = canUseApiTotals ? apiTotals.XML : undefined;
    const displayTotal = canUseApiTotals ? apiTotals.Display : undefined;

    const xmlImpr = xmlTotal ? toNumber(xmlTotal.adv_impressions) : 0;
    const xmlClicks = xmlTotal ? toNumber(xmlTotal.adv_clicks) : 0;
    const xmlConv = xmlTotal ? toNumber(xmlTotal.adv_conversions) : 0;
    const xmlResponses = xmlTotal ? toNumber(xmlTotal.adv_responses) : 0;
    const xmlSpend = xmlTotal ? toNumber(xmlTotal.adv_cost) : 0;
    const xmlCtr = xmlResponses > 0 ? (xmlClicks / xmlResponses) * 100 : 0;

    const dispImpr = displayTotal ? toNumber(displayTotal.adv_impressions) : 0;
    const dispClicks = displayTotal ? toNumber(displayTotal.adv_clicks) : 0;
    const dispConv = displayTotal ? toNumber(displayTotal.adv_conversions) : 0;
    const dispSpend = displayTotal ? toNumber(displayTotal.adv_cost) : 0;
    const dispCr = dispImpr > 0 ? (dispConv / dispImpr) * 100 : 0;

    return {
      filtered: {
        impressionsAll: canUseApiTotals
          ? reportType === "XML"
            ? xmlImpr
            : reportType === "Display"
              ? dispImpr
              : xmlImpr + dispImpr
          : impressionsAll,
        clicksAll: canUseApiTotals
          ? reportType === "XML"
            ? xmlClicks
            : reportType === "Display"
              ? dispClicks
              : xmlClicks + dispClicks
          : clicksAll,
        conversionsAll: canUseApiTotals
          ? reportType === "XML"
            ? xmlConv
            : reportType === "Display"
              ? dispConv
              : xmlConv + dispConv
          : conversionsAll,
        spendAll: canUseApiTotals
          ? reportType === "XML"
            ? xmlSpend
            : reportType === "Display"
              ? dispSpend
              : xmlSpend + dispSpend
          : spendAll,
        impressionsXml,
        clicksXml,
        impressionsDisplay,
        conversionsDisplay,
        ctrXml: canUseApiTotals
          ? reportType === "XML" || reportType === "All"
            ? xmlCtr
            : ctrXml
          : ctrXml,
        crDisplay: canUseApiTotals
          ? reportType === "Display" || reportType === "All"
            ? dispCr
            : crDisplay
          : crDisplay,
      },
    };
  }, [table, reportType, apiTotals]);

  const fetchData = React.useCallback(async () => {
    if (!token) return;

    const effectiveFrom = fromDate || defaultFromDate;
    const effectiveTo = toDate || defaultToDate;
    if (!effectiveFrom || !effectiveTo) return;

    setIsLoading(true);
    try {
      const urls = buildAdvertiserReportUrls({
        reportType,
        groupBy,
        token,
        fromDate: effectiveFrom,
        toDate: effectiveTo,
      });

      const results = await Promise.all(
        urls.map(async ({ reportType: source, url }) => {
          const response = await axios.get(url);
          const raw = response.data as any;
          const totalFromApi =
            raw?.response?.total ?? raw?.response?.list?.total;
          const rows = normalizeAdvertiserReportRows<CombinedReportRow>(
            response.data,
          );
          setApiTotals((prev) => ({
            ...prev,
            [source]: (totalFromApi && typeof totalFromApi === "object"
              ? totalFromApi
              : undefined) as any,
          }));

          return rows.map((r) => {
            const anyRow = r as unknown as Record<string, unknown>;
            const campaignNameFromApi = anyRow["campaign"];
            return {
              ...r,
              report_source: source,
              campaign_name:
                r.campaign_name ??
                (typeof campaignNameFromApi === "string"
                  ? campaignNameFromApi
                  : undefined),
            };
          });
        }),
      );

      setData(results.flat());
    } catch (e) {
      console.error("Error fetching combined reports:", e);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    token,
    fromDate,
    toDate,
    defaultFromDate,
    defaultToDate,
    reportType,
    groupBy,
  ]);

  const handleClearFilters = React.useCallback(() => {
    setFromDate("");
    setToDate("");
    setActiveRange("");
    setReportType("All");
    setGroupBy("date");
    setSorting([]);
    setColumnFilters([]);
    setRowSelection({});
    table.getColumn(searchColumnId)?.setFilterValue("");
    setReloadKey((k) => k + 1);
  }, [searchColumnId, table]);

  React.useEffect(() => {
    if (!token) return;
    if (!defaultFromDate || !defaultToDate) return;
    if (reloadKey === 0) return;
    fetchData();
  }, [reloadKey, token, defaultFromDate, defaultToDate, fetchData]);

  React.useEffect(() => {
    const today = new Date();
    const to = toIsoDate(today);
    const from = new Date(today);
    from.setDate(from.getDate() - 365);
    setDefaultFromDate(toIsoDate(from));
    setDefaultToDate(to);
  }, []);

  const handleDateRangeChange = React.useCallback((range: string) => {
    setActiveRange(range);

    const today = new Date();
    let startDate = "";
    let endDate = toIsoDate(today);

    switch (range) {
      case "Today":
        startDate = endDate;
        break;
      case "Yesterday": {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        startDate = toIsoDate(yesterday);
        endDate = startDate;
        break;
      }
      case "Last 3 days": {
        const d = new Date(today);
        d.setDate(today.getDate() - 3);
        startDate = toIsoDate(d);
        break;
      }
      case "Last 30 days": {
        const d = new Date(today);
        d.setDate(today.getDate() - 30);
        startDate = toIsoDate(d);
        break;
      }
      case "This month": {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = toIsoDate(firstDay);
        break;
      }
      default:
        break;
    }

    setFromDate(startDate);
    setToDate(endDate);
  }, []);

  React.useEffect(() => {
    if (token && defaultFromDate && defaultToDate) {
      fetchData();
    }
  }, [token, defaultFromDate, defaultToDate, fetchData]);

  return (
    <div className="w-full mt-2  max-sm:px-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between pb-2">

  {/* Breadcrumb */}
  <nav className="flex items-center text-xs sm:text-sm text-gray-500">
    <a href="/advertiser/dashboard" className="hover:text-gray-700 font-medium">
      Home
    </a>
    <span className="mx-1 sm:mx-2 text-gray-400">/</span>
    <span className="text-gray-800 font-semibold">Reports</span>
  </nav>

  {/* Actions */}
  <div className="flex items-center gap-2 w-full md:w-auto">

    {/* Search */}
    <div className="relative flex-1 sm:flex-none sm:w-56">
      <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/>
      </svg>

      <Input
        placeholder="Search..."
        value={(table.getColumn(searchColumnId)?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn(searchColumnId)?.setFilterValue(event.target.value)
        }
        className="pl-8 h-8 text-xs sm:text-sm rounded-md border-gray-200 focus:border-[#6a6bcf] focus:ring-[#6a6bcf]/30"
      />
    </div>

    {/* Export */}
    <Button
      onClick={handleExportCSV}
      disabled={table.getFilteredRowModel().rows.length === 0}
      className="h-8 px-3 text-xs sm:text-sm bg-[#6a6bcf] rounded-md text-white hover:bg-[#5a5bc4]"
    >
      Export
    </Button>

  </div>
</div>


   <div className="mb-4">

  <div className="
    grid
    grid-cols-1
    sm:grid-cols-2
    lg:grid-cols-3
    xl:grid-cols-6
    gap-3
  ">

    {/* Report Type */}
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">Report Type</label>
      <select
        onChange={(e) => setReportType(e.target.value as AdvertiserReportType)}
        value={reportType}
        className="h-9 px-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6a6bcf] outline-none"
      >
        <option value="All">All</option>
        <option value="XML">Pop/Push</option>
        <option value="Display">Banner/Native</option>
      </select>
    </div>

    {/* Filter */}
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">Group By</label>
      <select
        onChange={(e) => setGroupBy(e.target.value as AdvertiserReportGroupBy)}
        value={groupBy}
        className="h-9 px-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6a6bcf] outline-none"
      >
        <option value="date">Date</option>
        <option value="country">Country</option>
        <option value="campaign">Campaign</option>
      </select>
    </div>

    {/* Range */}
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">Range</label>
      <select
        value={activeRange}
        onChange={(e) => handleDateRangeChange(e.target.value)}
        className="h-9 px-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6a6bcf] outline-none"
      >
        <option value="" disabled hidden>Select</option>
        <option value="Today">Today</option>
        <option value="Yesterday">Yesterday</option>
        <option value="Last 3 days">Last 3 days</option>
        <option value="Last 30 days">Last 30 days</option>
        <option value="This month">This month</option>
      </select>
    </div>

    {/* From */}
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">From</label>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => { setActiveRange(""); setFromDate(e.target.value); }}
        className="h-9 px-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6a6bcf] outline-none"
      />
    </div>

    {/* To */}
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">To</label>
      <input
        type="date"
        value={toDate}
        onChange={(e) => { setActiveRange(""); setToDate(e.target.value); }}
        className="h-9 px-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6a6bcf] outline-none"
      />
    </div>

    {/* Clear Button */}
    <div className="flex items-end">
      <Button
        onClick={handleClearFilters}
        disabled={!token || isLoading}
        className="w-full h-9 text-sm bg-[#6a6bcf] text-white rounded-md hover:bg-[#5a5bc4]"
      >
        Clear
      </Button>
    </div>

  </div>
</div>


      <div className="rounded-md border bg-white shadow-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

                <TableRow className="bg-gray-50">
                  {table.getVisibleLeafColumns().map((col) => {
                    const id = col.id;

                    const totalLabelColumnId =
                      groupBy === "campaign"
                        ? "campaign_id"
                        : groupBy === "country"
                          ? "country"
                          : "date";

                    if (id === "select") {
                      return <TableCell key={id} />;
                    }

                    if (id === totalLabelColumnId) {
                      return (
                        <TableCell key={id} className="font-semibold">
                          Total
                        </TableCell>
                      );
                    }

                    if (id === "adv_impressions") {
                      return (
                        <TableCell key={id} className="font-semibold">
                          {totals.filtered.impressionsAll.toLocaleString()}
                        </TableCell>
                      );
                    }

                    if (id === "adv_clicks") {
                      return (
                        <TableCell key={id} className="font-semibold">
                          {totals.filtered.clicksAll.toLocaleString()}
                        </TableCell>
                      );
                    }

                    if (id === "adv_cost") {
                      return (
                        <TableCell key={id} className="font-semibold">
                          $
                          {totals.filtered.spendAll.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                      );
                    }

                    if (id === "adv_ctr") {
                      if (reportType === "All") {
                        return (
                          <TableCell key={id} className="font-semibold">
                            CTR:{" "}
                            {totals.filtered.ctrXml.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                            %
                          </TableCell>
                        );
                      }

                      return (
                        <TableCell key={id} className="font-semibold">
                          {(reportType === "Display"
                            ? totals.filtered.crDisplay
                            : totals.filtered.ctrXml
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          %
                        </TableCell>
                      );
                    }

                    return <TableCell key={id} />;
                  })}
                </TableRow>
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? "Loading..." : "No results found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* <div className="flex items-center justify-end py-4 space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
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
      </div> */}

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
