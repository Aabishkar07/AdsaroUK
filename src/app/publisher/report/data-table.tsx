"use client";

import * as React from "react";
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
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { useAuth } from "@/context/context";
import { useSearchParams } from "next/navigation";

type CombinedRow = {
  group: string;
  impressions: number;
  clicks: number;
  revenue: number;
};

const toNumber = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const formatLocalDate = (d: Date) => d.toLocaleDateString("en-CA");

type ReportType = "All" | "POP" | "Display";
type GroupBy = "Date" | "Country";

export function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [data, setData] = React.useState<CombinedRow[]>([]);

  const [reportType, setReportType] = React.useState<ReportType>("All");
  const [groupBy, setGroupBy] = React.useState<GroupBy>("Date");

  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [displayFromDate, setDisplayFromDate] = React.useState("");
  const [displayToDate, setDisplayToDate] = React.useState("");
  const [activeRange, setActiveRange] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);

  const auth = useAuth();
  const mytoken = auth?.token;
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const rt = searchParams?.get("reportType");
    const gb = searchParams?.get("groupBy");

    if (rt === "All" || rt === "POP" || rt === "Display") {
      setReportType(rt);
    }

    if (gb === "Date" || gb === "Country") {
      setGroupBy(gb);
    }
  }, [searchParams]);

  const columns = React.useMemo<ColumnDef<CombinedRow>[]>(() => {
    const groupLabel = groupBy === "Date" ? "Date" : "Country";

    return [
      {
        accessorKey: "group",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {groupLabel} <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="lowercase">{row.getValue("group")}</div>
        ),
      },
      {
        accessorKey: "impressions",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Impressions <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium text-gray-800">
            {toNumber(row.getValue("impressions")).toLocaleString()}
          </div>
        ),
        sortingFn: (a, b) =>
          toNumber(a.getValue("impressions")) -
          toNumber(b.getValue("impressions")),
      },
      {
        accessorKey: "clicks",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Clicks <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium text-gray-800">
            {toNumber(row.getValue("clicks")).toLocaleString()}
          </div>
        ),
        sortingFn: (a, b) =>
          toNumber(a.getValue("clicks")) - toNumber(b.getValue("clicks")),
      },
      {
        accessorKey: "revenue",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Revenue <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium text-gray-800">
            {toNumber(row.getValue("revenue")).toLocaleString(undefined, {
              minimumFractionDigits: 4,
              maximumFractionDigits: 4,
            })}
          </div>
        ),
        sortingFn: (a, b) =>
          toNumber(a.getValue("revenue")) - toNumber(b.getValue("revenue")),
      },
    ];
  }, [groupBy]);

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

  const mergeByKey = (
    keyFn: (r: any) => string,
    popRows: any[] = [],
    displayRows: any[] = [],
    popMap: (r: any) => { impressions: unknown; clicks: unknown; revenue: unknown },
    displayMap: (r: any) => {
      impressions: unknown;
      clicks: unknown;
      revenue: unknown;
    },
  ): CombinedRow[] => {
    const map = new Map<string, CombinedRow>();

    const add = (group: string, imp: unknown, clicks: unknown, rev: unknown) => {
      const key = String(group);
      const prev = map.get(key) || {
        group: key,
        impressions: 0,
        clicks: 0,
        revenue: 0,
      };
      prev.impressions += toNumber(imp);
      prev.clicks += toNumber(clicks);
      prev.revenue += toNumber(rev);
      map.set(key, prev);
    };

    if (reportType === "All" || reportType === "POP") {
      for (const r of popRows) {
        const m = popMap(r);
        add(keyFn(r), m.impressions, m.clicks, m.revenue);
      }
    }

    if (reportType === "All" || reportType === "Display") {
      for (const r of displayRows) {
        const m = displayMap(r);
        add(keyFn(r), m.impressions, m.clicks, m.revenue);
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.group.localeCompare(b.group),
    );
  };

  const fetchData = async () => {
    if (!fromDate || !toDate || !mytoken) return;

    setIsLoading(true);
    try {
      const popUrl =
        groupBy === "Date"
          ? `https://panel.adsaro.com/publisher/api/FeedReports/date?version=4&token=${mytoken}&filters=date:${fromDate}_${toDate}`
          : `https://panel.adsaro.com/publisher/api/FeedReports/country?version=4&token=${mytoken}&filters=date:${fromDate}_${toDate}`;

      const displayUrl =
        groupBy === "Date"
          ? `https://panel.adsaro.com/publisher/api/ZoneReports/date?version=5&token=${mytoken}&filters=date:${fromDate}_${toDate}`
          : `https://panel.adsaro.com/publisher/api/ZoneReports/country?version=5&token=${mytoken}&filters=date:${fromDate}_${toDate}`;

      const requests: Promise<any>[] = [];
      if (reportType === "All" || reportType === "POP") {
        requests.push(axios.get(popUrl));
      }
      if (reportType === "All" || reportType === "Display") {
        requests.push(axios.get(displayUrl));
      }

      const res = await Promise.all(requests);

      const popRes =
        reportType === "Display" ? null : reportType === "POP" ? res[0] : res[0];
      const displayRes =
        reportType === "POP" ? null : reportType === "Display" ? res[0] : res[1];

      const popRowsObj = popRes?.data?.response?.list?.rows || {};
      const displayRowsObj = displayRes?.data?.response?.list?.rows || {};

      const popRows = Object.values(popRowsObj) as any[];
      const displayRows = Object.values(displayRowsObj) as any[];

      if (groupBy === "Date") {
        setData(
          mergeByKey(
            (r) => String(r?.date),
            popRows,
            displayRows,
            (r) => ({
              impressions: r?.pub_pixel_impressions,
              clicks: r?.pub_clicks,
              revenue: r?.pub_revenue,
            }),
            (r) => ({
              impressions: r?.rtb_pub_impressions ?? r?.rtb_pub_gross,
              clicks: r?.rtb_pub_clicks,
              revenue: r?.rtb_pub_revenue,
            }),
          ),
        );
      } else {
        setData(
          mergeByKey(
            (r) => String(r?.country),
            popRows,
            displayRows,
            (r) => ({
              impressions: r?.pub_pixel_impressions,
              clicks: r?.pub_clicks,
              revenue: r?.revenue,
            }),
            (r) => ({
              impressions: r?.rtb_pub_impressions ?? r?.rtb_pub_gross,
              clicks: r?.rtb_pub_clicks,
              revenue: r?.rtb_pub_revenue,
            }),
          ),
        );
      }
    } catch (e) {
      console.error("Error fetching combined publisher reports:", e);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 360);

    const formattedFrom = formatLocalDate(start);
    const formattedTo = formatLocalDate(now);

    setFromDate(formattedFrom);
    setToDate(formattedTo);
    setDisplayFromDate("");
    setDisplayToDate("");
    setActiveRange("");
  }, []);

  const handleDateRangeChange = (range: string) => {
    setActiveRange(range);

    const today = new Date();
    let startDate: string = "";
    let endDate: string = formatLocalDate(today);

    switch (range) {
      case "Today":
        startDate = endDate;
        break;
      case "Yesterday": {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        startDate = formatLocalDate(yesterday);
        endDate = startDate;
        break;
      }
      case "Last 3 days": {
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);
        startDate = formatLocalDate(threeDaysAgo);
        break;
      }
      case "Last 30 days": {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        startDate = formatLocalDate(thirtyDaysAgo);
        break;
      }
      case "This month": {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = formatLocalDate(firstDay);
        break;
      }
      default:
        break;
    }

    setFromDate(startDate);
    setToDate(endDate);
    setDisplayFromDate(startDate);
    setDisplayToDate(endDate);
  };

  React.useEffect(() => {
    if (mytoken && fromDate && toDate) {
      fetchData();
    }
  }, [mytoken, fromDate, toDate, reportType, groupBy]);

  const handleClearFilters = () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 360);

    const formattedFrom = formatLocalDate(start);
    const formattedTo = formatLocalDate(now);

    setFromDate(formattedFrom);
    setToDate(formattedTo);
    setDisplayFromDate("");
    setDisplayToDate("");
    setActiveRange("");
  };

  const totals = React.useMemo(() => {
    const rows = table.getFilteredRowModel().rows;
    return rows.reduce(
      (acc, r) => {
        const row = r.original as CombinedRow;
        acc.impressions += toNumber(row.impressions);
        acc.clicks += toNumber(row.clicks);
        acc.revenue += toNumber(row.revenue);
        return acc;
      },
      { impressions: 0, clicks: 0, revenue: 0 },
    );
  }, [table, data, sorting, columnFilters, reportType, groupBy]);

  const handleExportCSV = () => {
    const rows = table.getFilteredRowModel().rows;
    if (!rows.length) {
      alert("No data to export");
      return;
    }

    const escapeCell = (value: unknown) => {
      const s = value == null ? "" : String(value);
      return `"${s.replace(/"/g, '""')}"`;
    };

    const groupLabel = groupBy === "Date" ? "Date" : "Country";
    const headers = [groupLabel, "Impressions", "Clicks", "Revenue"];

    const csvRows = [
      headers.join(","),
      ...rows.map((r) => {
        const row = r.original as CombinedRow;
        return [row.group, row.impressions, row.clicks, row.revenue]
          .map(escapeCell)
          .join(",");
      }),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `publisher_report_${reportType}_${groupBy}_${fromDate}_to_${toDate}.csv`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full mt-14 max-sm:px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
        <nav className="flex flex-wrap items-center text-sm pl-3 text-gray-500 gap-y-1">
          <a
            href="/publisher/dashboard"
            className="hover:text-gray-700 font-medium transition-colors"
          >
            Home
          </a>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800 font-semibold">Reports</span>
        </nav>

        <Button
          onClick={handleExportCSV}
          disabled={data.length === 0}
          className="
            inline-flex items-center justify-center gap-2 h-9 px-4 w-full sm:w-auto
            text-sm font-medium text-white
            bg-[#6a6bcf] rounded-lg shadow-sm
            hover:bg-[#5a5bc4] hover:shadow-md hover:-translate-y-[1px]
            disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none
            transition-all duration-300
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 3v4a1 1 0 0 0 1 1h4" />
            <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
            <path d="M9 15l2 2l4 -4" />
          </svg>
          Export
        </Button>
      </div>

      <div className="mb-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3 lg:justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-end gap-3 w-full">
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="POP">POP</option>
                <option value="Display">Display</option>
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Range
              </label>
              <select
                value={activeRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled hidden>
                  Select
                </option>
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="Last 3 days">Last 3 days</option>
                <option value="Last 30 days">Last 30 days</option>
                <option value="This month">This month</option>
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Group By
              </label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Date">By date</option>
                <option value="Country">By country</option>
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                From
              </label>
              <input
                type="date"
                value={displayFromDate}
                onChange={(e) => {
                  setActiveRange("");
                  setDisplayFromDate(e.target.value);
                  setFromDate(e.target.value);
                }}
                className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                To
              </label>
              <input
                type="date"
                value={displayToDate}
                onChange={(e) => {
                  setActiveRange("");
                  setDisplayToDate(e.target.value);
                  setToDate(e.target.value);
                }}
                className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleClearFilters}
              disabled={isLoading}
              className="h-[34px] px-3 text-sm bg-[#6a6bcf] hover:text-[#6a6bcf] rounded hover:bg-white text-white border border-[#6a6bcf] disabled:opacity-50 w-full sm:w-auto"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="border rounded-md bg-white overflow-x-auto">
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
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow className="bg-gray-100 font-bold border-t-2 border-gray-300">
                  <TableCell className="text-gray-800">Total</TableCell>
                  <TableCell className="text-gray-800">
                    {totals.impressions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-gray-800">
                    {totals.clicks.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-gray-800">
                    {totals.revenue.toLocaleString(undefined, {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 4,
                    })}
                  </TableCell>
                </TableRow>
              </>
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center py-4 space-x-2">
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
