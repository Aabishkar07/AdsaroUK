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
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import axios from "axios";
import { useAuth } from "@/context/context";
import { useEffect, useState } from "react";

interface BannerZoneData {
  id: number;
  date: string;
  type: string;
  approving_status: string;
  payment_system: string;
  amount: string;
  description: string;
  comments: string;
}

export const columns: ColumnDef<BannerZoneData>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ID <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("id")}</div>,
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("date")}</div>,
  },
  {
    accessorKey: "type",
    header: () => <div>Type</div>,
    cell: ({ row }) => <div>{row.getValue("type")}</div>,
  },
  {
    accessorKey: "approving_status",
    header: () => <div>Status</div>,
    cell: ({ row }) => <div>{row.getValue("approving_status")}</div>,
  },
  {
    accessorKey: "payment_system",
    header: () => <div>Payment Method</div>,
    cell: ({ row }) => <div>{row.getValue("payment_system")}</div>,
  },
  {
    accessorKey: "amount",
    header: () => <div>Amount</div>,
    // cell: ({ row }) => <div>$ {row.getValue("amount")}</div>,

    cell: ({ row }) => <div>$ {row.getValue("amount") ? parseFloat(row.getValue("amount")).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) : 0}</div>,

  },
  // {
  //   accessorKey: "description",
  //   header: () => <div>Description</div>,
  //   cell: ({ row }) => (
  //     <div className="w-96">{row.getValue("description")}</div>
  //   ),
  // },
  // {
  //   accessorKey: "comments",
  //   header: () => <div>Comments</div>,
  //   cell: ({ row }) => <div>{row.getValue("comments")}</div>,
  // },
];

export function DataTableDemo2() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<BannerZoneData[]>([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Filter states
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");

  const auth = useAuth();
  const mytoken = auth?.token;

  const parseTransactionDate = (value: unknown): Date | null => {
    if (value == null) return null;
    if (value instanceof Date) return Number.isFinite(value.getTime()) ? value : null;

    const s = String(value).trim();
    if (!s) return null;

    // YYYY-MM-DD
    const m1 = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m1) {
      const y = Number(m1[1]);
      const m = Number(m1[2]);
      const d = Number(m1[3]);
      const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
      return Number.isFinite(dt.getTime()) ? dt : null;
    }

    // YYYY-MM-DD HH:mm:ss
    const m2 = s.match(
      /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/,
    );
    if (m2) {
      const y = Number(m2[1]);
      const mo = Number(m2[2]);
      const d = Number(m2[3]);
      const hh = Number(m2[4]);
      const mm = Number(m2[5]);
      const ss = Number(m2[6]);
      const dt = new Date(y, mo - 1, d, hh, mm, ss, 0);
      return Number.isFinite(dt.getTime()) ? dt : null;
    }

    const dt = new Date(s);
    return Number.isFinite(dt.getTime()) ? dt : null;
  };

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

  const fetchData = async (start?: string, end?: string) => {
    if (!mytoken) return;

    const startDate = start || fromDate;
    const endDate = end || toDate;

    if (!startDate || !endDate) return;

    setIsLoading(true);
    try {
      let url = `https://panel.adsaro.com/advertiser/api/Transactions/?version=4&token=${mytoken}`;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await axios.get(url);
      let rows = response?.data?.response?.rows;

      if (rows && typeof rows === "object" && !Array.isArray(rows)) {
        rows = Object.values(rows);
      }

      const asArray = (Array.isArray(rows) ? rows : []) as BannerZoneData[];
      const from = parseTransactionDate(startDate);
      const to = parseTransactionDate(endDate);
      const toInclusive = to ? new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999) : null;

      const filtered =
        from && toInclusive
          ? asArray.filter((r) => {
              const dt = parseTransactionDate((r as any)?.date);
              if (!dt) return false;
              const t = dt.getTime();
              return t >= from.getTime() && t <= toInclusive.getTime();
            })
          : asArray;

      setData(filtered);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize dates: fromDate = Jan 1, 2024, toDate = today
  useEffect(() => {
    const now = new Date();
    const startDate = new Date(2024, 0, 1); // January 1, 2024
    
    const formattedFromDate = startDate.toISOString().split("T")[0];
    const formattedToDate = now.toISOString().split("T")[0];
    
    setFromDate(formattedFromDate);
    setToDate(formattedToDate);
  }, []);

  // Auto-fetch when token or dates change
  useEffect(() => {
    if (mytoken && fromDate && toDate) {
      fetchData();
    }
  }, [mytoken, fromDate, toDate]);

  // Apply column filters when filter values change
  useEffect(() => {
    if (typeFilter) {
      table.getColumn("type")?.setFilterValue(typeFilter);
    } else {
      table.getColumn("type")?.setFilterValue(undefined);
    }
  }, [typeFilter]);

  useEffect(() => {
    if (statusFilter) {
      table.getColumn("approving_status")?.setFilterValue(statusFilter);
    } else {
      table.getColumn("approving_status")?.setFilterValue(undefined);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (paymentMethodFilter) {
      table.getColumn("payment_system")?.setFilterValue(paymentMethodFilter);
    } else {
      table.getColumn("payment_system")?.setFilterValue(undefined);
    }
  }, [paymentMethodFilter]);

  // Get unique values for filters
  const uniqueTypes = Array.from(new Set(data.map(item => item.type).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(data.map(item => item.approving_status).filter(Boolean)));
  const uniquePaymentMethods = Array.from(new Set(data.map(item => item.payment_system).filter(Boolean)));

  // Clear all filters
  const handleClearFilters = () => {
    const now = new Date();
    const startDate = new Date(2024, 0, 1);
    
    const formattedFromDate = startDate.toISOString().split("T")[0];
    const formattedToDate = now.toISOString().split("T")[0];
    
    setFromDate(formattedFromDate);
    setToDate(formattedToDate);
    setTypeFilter("");
    setStatusFilter("");
    setPaymentMethodFilter("");
  };

  const redirectadkernel = () => {
    window.open(
      `https://panel.adsaro.com/advertiser/popups/add-funds?authToken=${mytoken}&redirectSuccessURL=https://www.adfocusnetwork.com/advertiser/payment-transactions/&redirectCancelURL=https://www.adfocusnetwork.com/advertiser/dashboard`,
      "_blank"
    );
  };

  // Export to CSV handler
  const handleExportCSV = () => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["ID", "Date", "Type", "Status", "Payment Method", "Amount", "Description", "Comments"];
    const csvRows = [
      headers.join(","),
      ...table.getFilteredRowModel().rows.map(row => {
        const values = [
          row.getValue("id"),
          row.getValue("date"),
          row.getValue("type"),
          row.getValue("approving_status"),
          row.getValue("payment_system"),
          row.getValue("amount"),
          `"${String(row.getValue("description") || "").replace(/"/g, '""')}"`,
          `"${String(row.getValue("comments") || "").replace(/"/g, '""')}"`
        ];
        return values.join(",");
      })
    ];

    const csvContent = csvRows.join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_${fromDate}_to_${toDate}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full  mt-2 max-sm:px-4">


<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">

  {/* Breadcrumb */}
  <nav className="flex flex-wrap items-center text-sm text-gray-500 gap-y-1">
    <a
      href="/advertiser/dashboard"
      className="font-medium hover:text-[#6a6bcf] transition-colors pl-3"
    >
      Home
    </a>
      <span className="mx-2 text-gray-300">/</span>
      <span className="text-gray-800 font-semibold">
      Budget Manager
      </span>
      <span className="mx-2 text-gray-300">/</span>
      <span className="text-gray-800 font-semibold">
      Payment Transactions
      </span>
  </nav>

  {/* Right Actions */}
  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 w-full lg:w-auto">


    {/* Search */}
    <div className="relative w-full sm:w-auto">

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
          placeholder="Search by type..."
          value={(table.getColumn("type")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("type")?.setFilterValue(event.target.value)
          }
              className="pl-9 h-9 w-full sm:w-56 text-sm rounded-lg border-gray-200
                   focus:border-[#6a6bcf] focus:ring-[#6a6bcf]/30"
        />

    </div>


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
</div>


<div className="mb-4">
  <div className="flex flex-col lg:flex-row lg:items-end gap-3 lg:justify-between">


    {/* Left side: Filters */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-end gap-3 w-full">


      {/* From Date */}
      <div className="w-full sm:w-auto">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          From
        </label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* To Date */}
      <div className="w-full sm:w-auto">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          To
        </label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Type */}
      <div className="w-full sm:w-auto">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Type
        </label>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500"
        >

          <option value="">All</option>
          {uniqueTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="w-full sm:w-auto">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Status
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500"
        >

          <option value="">All</option>
          {uniqueStatuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Payment Method */}
      <div className="w-full sm:w-auto">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Payment
        </label>
        <select
          value={paymentMethodFilter}
          onChange={(e) => setPaymentMethodFilter(e.target.value)}
          className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500"
        >

          <option value="">All</option>
          {uniquePaymentMethods.map((method) => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
      </div>

      {/* Clear */}
      <button
        onClick={handleClearFilters}
        disabled={isLoading}
        className="h-[34px] px-3 text-sm bg-[#6a6bcf] hover:text-[#6a6bcf]  rounded hover:bg-white text-white border border-[#6a6bcf] disabled:opacity-50 w-full sm:w-auto"
      >
        Clear Filters
      </button>
    </div>

    {/* Right side: Add Funds */}
    <button
      onClick={redirectadkernel}
      className="h-[34px] px-5 text-sm rounded bg-[#6a6bcf] hover:text-[#6a6bcf]  text-white hover:bg-white border border-[#6a6bcf]  transition whitespace-nowrap w-full sm:w-auto"
    >
      + Add Funds
    </button>

  </div>
</div>


      {/* <div className="flex items-center py-4 gap-4">
     

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
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div> */}

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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                  className="text-center h-24"
                >
                  {isLoading ? "Loading data..." : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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