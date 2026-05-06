"use client"

import * as React from "react"
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
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import axios from "axios"
import { useAuth } from "@/context/context"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"


interface BannerZoneData {
  country: string
  request: number
  pub_pixel_impressions: number
  pub_net_clicks: number
  pub_clicks: number
}



export const columns: ColumnDef<BannerZoneData>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  

  {
    accessorKey: "country",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Country
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("country")}</div>,
  },

  

  {
    accessorKey: "request",
    header: () => <div className="">Request</div>,
    cell: ({ row }) => {
      return <div className="font-medium ">{row.getValue("request")}</div>
    },
  },
  {
    accessorKey: "pub_pixel_impressions",
    header: () => (
      <Tooltip>
        <TooltipTrigger asChild>
            <Button
                variant="ghost"
                className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600 transition-colors"
              >
          <div className="">
            Impressions ?
          </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white text-xs px-3 py-1 rounded shadow-md">
          Total times the ad was displayed to users
        </TooltipContent>
      </Tooltip>
    ),
    cell: ({ row }) => {
      return (
        <div className="font-medium text-gray-800">
          {row.getValue("pub_pixel_impressions")}
        </div>
      );
    },
  },




  {
    accessorKey: "pub_net_clicks",
    header: () => (
      <Tooltip>
        <TooltipTrigger asChild>
        <Button
                variant="ghost"
                className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600 transition-colors"
              >
          <div className="">
            Gross Clicks ? 
          </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white text-xs px-3 py-1 rounded shadow-md">
Clicks sent by publisher        </TooltipContent>
      </Tooltip>
    ),
    cell: ({ row }) => {
      return (
        <div className="font-medium text-gray-800">
          {row.getValue("pub_net_clicks")}
        </div>
      );
    },
  },

  {
    accessorKey: "revenue",
    header: () => (
      <Tooltip>
        <TooltipTrigger asChild>
        <Button
                variant="ghost"
                className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600 transition-colors"
              >
          <div className="">
            Revenue ?
          </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white text-xs px-3 py-1 rounded shadow-md">
          Sum of displayed bids of clicks
        </TooltipContent>
      </Tooltip>
    ),
    cell: ({ row }) => {
      const value = row.getValue("revenue");
      return (
        <div className="font-medium text-gray-800">
          ${Number(value).toFixed(2)}
        </div>
      );
    },
  },

  {
    accessorKey: "pub_clicks",
    header: () => <div className="">Clicks </div>,
    cell: ({ row }) => {
      return <div className="font-medium ">{row.getValue("pub_clicks")}</div>
    },
  },




]

export function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [data, setData] = React.useState<BannerZoneData[]>([]);
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [activeRange, setActiveRange] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const auth = useAuth();
const mytoken = auth?.token;
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

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
  })

  const formatLocalDate = (d: Date) => {
    return d.toLocaleDateString("en-CA");
  };

  const handleDateRangeChange = (range: string) => {
    setActiveRange(range);

    const today = new Date();
    let startDate: string = "";
    let endDate: string = formatLocalDate(today);

    switch (range) {
      case 'Today':
        startDate = endDate;
        break;
      case 'Yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        startDate = formatLocalDate(yesterday);
        endDate = startDate;
        break;
      case 'Last 3 days':
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);
        startDate = formatLocalDate(threeDaysAgo);
        break;
      case 'Last 30 days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        startDate = formatLocalDate(thirtyDaysAgo);
        break;
      case 'This month':
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = formatLocalDate(firstDay);
        break;
      default:
        break;
    }

    setFromDate(startDate);
    setToDate(endDate);
    
    // Auto-fetch data when date range changes
    if (startDate && endDate && mytoken) {
      setTimeout(() => fetchData(), 100);
    }
  };



  const fetchData = async () => {
    if (!fromDate || !toDate || !mytoken) {
      console.log("Missing input");
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://panel.adsaro.com/publisher/api/FeedReports/country?version=4&token=${mytoken}&filters=date:${fromDate}_${toDate}`;
      console.log("Fetching:", url);

      const response = await axios.get(url);
      
      // Check if the response has data
      if (response.data && response.data.response && response.data.response.list) {
        const rowsArray = Object.values(response.data.response.list.rows || {}) as BannerZoneData[];
        setData(rowsArray);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Set default date range when component mounts
  React.useEffect(() => {
    const now = new Date();
    const startDate = new Date(2024, 0, 1);

    setFromDate(formatLocalDate(startDate));
    setToDate(formatLocalDate(now));
    setActiveRange("");
  }, []);

  // Run automatically when fromDate, toDate, and token are all set
  React.useEffect(() => {
    if (mytoken && fromDate && toDate) {
      fetchData();
    }
  }, [mytoken, fromDate, toDate]);

  const handleClearFilters = () => {
    const now = new Date();
    const startDate = new Date(2024, 0, 1);

    setFromDate(formatLocalDate(startDate));
    setToDate(formatLocalDate(now));
    setActiveRange("");
  };

  const handleExportCSV = () => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    const escapeCell = (value: unknown) => {
      const s = value == null ? "" : String(value);
      return `"${s.replace(/"/g, '""')}"`;
    };

    const headers = ["Country", "Request", "Impressions", "Net Clicks", "Clicks"];
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        [
          row.country,
          row.request,
          row.pub_pixel_impressions,
          row.pub_net_clicks,
          row.pub_clicks,
        ]
          .map(escapeCell)
          .join(","),
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `pop_country_${fromDate}_to_${toDate}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReportTypeChange = (value: string) => {
    const routes: { [key: string]: string } = {
      POP: "/publisher/xmlreportbycountry",
      Display: "/publisher/zonereportbycountry",
    };
    const url = routes[value];
    if (url) router.push(url);
  };

  const handleGroupByChange = (value: string) => {
    const routes: { [key: string]: string } = {
      Date: "/publisher/xmlreportbydate",
      Country: "/publisher/xmlreportbycountry",
    };
    const url = routes[value];
    if (url) router.push(url);
  };


  
  return (
    <div className="w-full mt-14">
      <div className="flex items-center justify-between pb-3">
        <nav className="flex items-center text-sm pl-3 text-gray-500">
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
            inline-flex items-center gap-2 h-9 px-4
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
        <div className="flex flex-wrap items-end gap-3 justify-between">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Report Type
              </label>
              <select
                value="POP"
                onChange={(e) => handleReportTypeChange(e.target.value)}
                className="border border-gray-300 px-2 py-1.5 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="POP">POP</option>
                <option value="Display">Display</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Group By
              </label>
              <select
                value="Country"
                onChange={(e) => handleGroupByChange(e.target.value)}
                className="border border-gray-300 px-2 py-1.5 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Date">Date</option>
                <option value="Country">Country</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Range
              </label>
              <select
                value={activeRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="border border-gray-300 px-2 py-1.5 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500"
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

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setActiveRange("");
                  setFromDate(e.target.value);
                }}
                className="border border-gray-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setActiveRange("");
                  setToDate(e.target.value);
                }}
                className="border border-gray-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleClearFilters}
            disabled={isLoading}
            className="h-[34px] px-3 text-sm bg-[#6a6bcf] hover:text-[#6a6bcf] rounded hover:bg-white text-white border border-[#6a6bcf] disabled:opacity-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end py-4 space-x-2">
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
      </div>
    </div>
  )
}
