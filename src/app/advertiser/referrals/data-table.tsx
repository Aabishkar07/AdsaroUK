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
import { ArrowUpDown, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface Referral {
  date: string;
  commission: string;
  referrals: string;
}

export const columns: ColumnDef<Referral>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("date")}</div>,
  },

  {
    accessorKey: "commissions",
    header: () => (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            <div className="">Commissions ?</div>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white text-xs  py-1 rounded shadow-md">
          Network commissions for publisher referrals
        </TooltipContent>
      </Tooltip>
    ),
    cell: ({ row }) => {
      const value = row.getValue("commissions");
      return (
        <div className="font-medium text-gray-800">
          {Number(value).toLocaleString()}
        </div>
      );
    },
  },

  {
    accessorKey: "referrals",
    header: () => <div className=""> Referrals </div>,
    cell: ({ row }) => {
      return <div className="font-medium ">{row.getValue("referrals")}</div>;
    },
  },
];

export function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [data, setData] = React.useState<Referral[]>([]);
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [displayFromDate, setDisplayFromDate] = React.useState("");
const [displayToDate, setDisplayToDate] = React.useState("");
  const [referid, setReferid] = React.useState<number | string | null>(null);
  const [currentPage, setCurrentPage] = React.useState<string>("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const auth = useAuth();
  const mytoken = auth?.token;

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

  React.useEffect(() => {
    const advertiser_id = auth?.advertiserData?.id ?? null;
    setReferid(advertiser_id);
  }, [auth]);

  React.useEffect(() => {
    const path = window.location.pathname;
    const page = path.split("/").filter(Boolean).pop() || "";
    setCurrentPage(page.charAt(0).toUpperCase() + page.slice(1) || "Dashboard");
  }, []);

  const fetchData = async () => {
    if (!mytoken || !fromDate || !toDate) {
      console.log("Missing required parameters");
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://panel.adsaro.com/advertiser/api/ReferralsByDate/?version=4&token=${mytoken}&filters=date:${fromDate}_${toDate}`;
      const response = await axios.get(url);

      const rowsArray = Object.values(
        response.data.response.rows || {},
      ) as Referral[];

      setData(rowsArray);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize dates: fromDate = Jan 1, 2024, toDate = today
  React.useEffect(() => {
    const now = new Date();
    const startDate = new Date(2024, 0, 1); // January 1, 2024

    const formattedFromDate = startDate.toISOString().split("T")[0];
    const formattedToDate = now.toISOString().split("T")[0];

    setFromDate(formattedFromDate);
    setToDate(formattedToDate);
  }, []);

  // Auto-fetch when token or dates change
  React.useEffect(() => {
    if (mytoken && fromDate && toDate) {
      fetchData();
    }
  }, [mytoken, fromDate, toDate]);

  // Clear filter handler
  const handleClearFilter = () => {
    const now = new Date();
    const startDate = new Date(2024, 0, 1); // January 1, 2024

    const formattedFromDate = startDate.toISOString().split("T")[0];
    const formattedToDate = now.toISOString().split("T")[0];

    setFromDate(formattedFromDate);
    setToDate(formattedToDate);
     setDisplayFromDate(""); 
  setDisplayToDate(""); 
  };

  // Export to CSV handler
  const handleExportCSV = () => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    // Prepare CSV content
    const headers = ["Date", "Commissions", "Referrals"];
    const csvRows = [
      headers.join(","),
      ...data.map(
        (row) => `${row.date},${row.commission || 0},${row.referrals || 0}`,
      ),
      // Add totals row
      `Total,${totalCommissions},${totalReferrals}`,
    ];

    const csvContent = csvRows.join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `referrals_${fromDate}_to_${toDate}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate totals
  const totalReferrals = data.reduce(
    (sum, row) => sum + Number(row.referrals || 0),
    0,
  );
  const totalCommissions = data.reduce(
    (sum, row) => sum + Number(row.commission || 0),
    0,
  );

  return (
    <div className="w-full  mt-2 max-sm:px-4">
      <div className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex items-center text-sm pl-3 text-gray-500">
          <a
            href="/advertiser/dashboard"
            className="hover:text-gray-700 font-medium transition-colors"
          >
            Home
          </a>

          <span className="mx-2 text-gray-400">/</span>

          <span className="text-gray-800 font-semibold">{currentPage}</span>
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

      {/* Referrals Statistics Section */}
      <div className="bg-white border border-gray-200 rounded-md mb-6 ">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-base font-semibold text-gray-800">
            Referrals Statistics
          </h2>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Referral Link */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Your referral link:</p>
              <p className="text-sm text-blue-600 break-all">
                https://adsaro.com/advertiser/signup?ref={referid || ""}
              </p>
            </div>

            {/* Total Referrals */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Total referrals:</p>
              <p className="text-2xl font-semibold text-gray-800">
                {totalReferrals}
              </p>
            </div>

            {/* Total Referral Spend */}
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Total referral spend:
              </p>
              <p className="text-2xl font-semibold text-gray-800">
                {totalCommissions.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter Section */}
      <div className="mb-4">
        {/* <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Filter Report by Date
          </h2>
        </div> */}

        <div className="flex  gap-4 sm:flex-row sm:items-end">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              From
            </label>
          <input
  type="date"
  value={displayFromDate}
  onChange={(e) => {
    setDisplayFromDate(e.target.value);
    setFromDate(e.target.value);
  }}
  className="border border-gray-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500"
/>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              To
            </label>
          <input
  type="date"
  value={displayToDate}
  onChange={(e) => {
    setDisplayToDate(e.target.value);
    setToDate(e.target.value);
  }}
  className="border border-gray-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500"
/>
          </div>

          {/* <div className="flex items-end">
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="w-full px-4 py-2 text-white transition bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Loading..." : "Fetch Data"}
            </button>
          </div> */}

          <div className="flex items-end">
            <button
              onClick={handleClearFilter}
              disabled={isLoading}
        className="h-[34px] px-3 text-sm bg-[#6a6bcf] hover:text-[#6a6bcf]  rounded hover:bg-white text-white border border-[#6a6bcf] disabled:opacity-50"
            >
              Clear 
            </button>
          </div>
        </div>
      </div>

      {/* <div className="flex items-center py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div> */}

      <div className="border rounded-md bg-white overflow-x-auto">
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
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
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
                {/* Totals Row */}
                <TableRow className="bg-gray-100 font-bold border-t-2 border-gray-300">
                  <TableCell className="text-gray-800">Total</TableCell>
                  <TableCell className="text-gray-800">
                    {data
                      .reduce(
                        (sum, row) => sum + Number(row.commission || 0),
                        0,
                      )
                      .toLocaleString()}
                  </TableCell>
                  <TableCell className="text-gray-800">
                    {data.reduce(
                      (sum, row) => sum + Number(row.referrals || 0),
                      0,
                    )}
                  </TableCell>
                </TableRow>
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? "Loading data..." : "No results."}
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
