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
import { ArrowUpDown, Check, ChevronDown, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type NotificationType = "INFO" | "WARNING" | "ERROR";

interface NotificationRow {
  id: number;
  type: NotificationType;
  created: string;
  read: string | null;
  subject: string;
  body: string;
}

export const columns: ColumnDef<NotificationRow>[] = [
  {
    id: "view",
    header: () => <div>View</div>,
    enableSorting: false,
    cell: ({ row, table }) => {
      const onView = (table.options.meta as any)?.onView as
        | ((n: NotificationRow) => void)
        | undefined;
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView?.(row.original)}
          className="h-8 w-8 p-0"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "read",
    header: () => <div>Read</div>,
    enableSorting: false,
    cell: ({ row }) => {
      const isRead = Boolean(row.original.read);
      return (
        <div className="flex items-center justify-center">
          {isRead ? <Check className="h-4 w-4 text-green-600" /> : null}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: () => <div>Type</div>,
    cell: ({ row }) => {
      const v = row.getValue("type") as NotificationType;
      const cls =
        v === "ERROR"
          ? "bg-red-100 text-red-700 border-red-200"
          : v === "WARNING"
            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
            : "bg-blue-100 text-blue-700 border-blue-200";
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border ${cls}`}>
          {v}
        </span>
      );
    },
  },
  // {
  //   id: "status",
  //   header: () => <div>Status</div>,
  //   accessorFn: (row) => (row.read ? "Read" : "Unread"),
  //   cell: ({ row }) => {
  //     const status = row.getValue("status") as string;
  //     const cls =
  //       status === "Read"
  //         ? "bg-green-100 text-green-700 border-green-200"
  //         : "bg-gray-100 text-gray-700 border-gray-200";
  //     return (
  //       <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border ${cls}`}>
  //         {status}
  //       </span>
  //     );
  //   },
  // },
  {
    accessorKey: "subject",
    header: () => <div>Subject</div>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("subject")}</div>,
  },
  {
    accessorKey: "created",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("created")}</div>,
  },
];

export function DataTableDemo2() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<NotificationRow[]>([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromDateUi, setFromDateUi] = useState("");
  const [toDateUi, setToDateUi] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | NotificationType>("");
  const [statusFilter, setStatusFilter] = useState<"" | "Read" | "Unread">("");
  // const [loading, setLoading] = useState(false);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [amount, setAmount] = useState(100);
  // const [method, setMethod] = useState("capitalist");
  // const [error, setError] = useState("");

  const auth = useAuth();
  const mytoken = auth?.token;

  const minAllowedDate = "2024-01-01";
  const maxAllowedDate = new Date().toISOString().slice(0, 10);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationRow | null>(null);

  const formatYmdHms = (d: Date): string => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  };

  const parseYmdOrYmdHmsToDate = (s: string): Date | null => {
    if (!s) return null;
    const trimmed = String(s).trim();
    const m = trimmed.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/
    );
    if (!m) return null;
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    const hour = m[4] != null ? Number(m[4]) : 0;
    const minute = m[5] != null ? Number(m[5]) : 0;
    const second = m[6] != null ? Number(m[6]) : 0;
    if (
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      Number.isNaN(day) ||
      Number.isNaN(hour) ||
      Number.isNaN(minute) ||
      Number.isNaN(second)
    ) {
      return null;
    }
    return new Date(year, month - 1, day, hour, minute, second);
  };

  const handleView = (n: NotificationRow) => {
    setSelectedNotification(n);
    setIsViewOpen(true);
    if (!n.read) {
      const now = formatYmdHms(new Date());
      setData((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: now } : x)));
    }
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
    meta: {
      onView: handleView,
    },
  });

  useEffect(() => {
    table.getColumn("type")?.setFilterValue(typeFilter || undefined);
  }, [table, typeFilter]);

  useEffect(() => {
    table.getColumn("status")?.setFilterValue(statusFilter || undefined);
  }, [table, statusFilter]);

  const fetchData = async (start: string, end: string) => {
    if (!mytoken) return;
    // setLoading(true);
    try {
      let url = `https://panel.adsaro.com/advertiser/api/Notifications/?version=4&token=${mytoken}`;
      if (start && end) {
        url += `&startDate=${start}&endDate=${end}`;
      }
      const response = await axios.get(url);
      let rows = response?.data?.response?.rows;

      if (rows && typeof rows === "object" && !Array.isArray(rows)) {
        rows = Object.values(rows);
      }

      const arr = Array.isArray(rows) ? (rows as NotificationRow[]) : [];

      // Ensure From/To date works even if backend ignores startDate/endDate.
      const startDate = parseYmdOrYmdHmsToDate(start);
      const endDateRaw = parseYmdOrYmdHmsToDate(end);
      const endDate = endDateRaw
        ? new Date(
            endDateRaw.getFullYear(),
            endDateRaw.getMonth(),
            endDateRaw.getDate(),
            23,
            59,
            59
          )
        : null;

      const filtered =
        startDate && endDate
          ? arr.filter((n) => {
              const createdAt = parseYmdOrYmdHmsToDate(n.created);
              if (!createdAt) return false;
              return createdAt >= startDate && createdAt <= endDate;
            })
          : arr;

      setData(filtered);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    } finally {
      // setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    // Keep default range in state (applied), but do not prefill the UI inputs.
    setFromDate(minAllowedDate);
    setToDate(maxAllowedDate);
    setFromDateUi("");
    setToDateUi("");
  }, []);

  useEffect(() => {
    if (!mytoken) return;
    if (!fromDate || !toDate) return;
    const from = fromDate;
    const to = toDate;
    const safeFrom = from <= to ? from : to;
    const safeTo = from <= to ? to : from;
    fetchData(safeFrom, safeTo);
  }, [mytoken, fromDate, toDate]);

  // const openModal = () => {
  //   setIsModalOpen(true);
  // };

  // const closeModal = () => {
  //   setIsModalOpen(false);
  // };

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = Number(e.target.value);

  //   if (value < 100) {
  //     setError("Amount must be at least $100");
  //   } else if (value > 10000) {
  //     setError("Amount must be no more than $10,000");
  //   } else {
  //     setError("");
  //   }

  //   setAmount(value);
  // };

  return (
    <div className="w-full">
      <Dialog
        open={isViewOpen}
        onOpenChange={(open) => {
          setIsViewOpen(open);
          if (!open) setSelectedNotification(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedNotification?.subject ?? "Notification"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-800">{selectedNotification?.type}</span>
              <span className="text-gray-400">|</span>
              <span>Created: {selectedNotification?.created ?? "—"}</span>
              <span className="text-gray-400">|</span>
              <span>Read: {selectedNotification?.read ?? "—"}</span>
            </div>
            <div
              className="prose max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: selectedNotification?.body ?? "" }}
            />
          </div>
        </DialogContent>
      </Dialog>




<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">

  {/* Breadcrumb */}
  <nav className="flex items-center text-sm text-gray-500 mt-2">
    <a
      href="/advertiser/dashboard"
      className="font-medium hover:text-[#6a6bcf] transition-colors pl-3"
    >
      Home
    </a>
      <span className="mx-2 text-gray-300">/</span>
      <span className="text-gray-800 font-semibold">
    Notifications
      </span>
  </nav>


</div>


      <div className="mb-6">
  

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center">
            <label className="mr-2">Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
          className="border border-gray-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="mr-2">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border border-gray-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="mr-2">From:</label>
            <input
              type="date"
              min={minAllowedDate}
              max={maxAllowedDate}
              value={fromDateUi}
              onChange={(e) => {
                const v = e.target.value;
                setFromDateUi(v);
                setFromDate(v || minAllowedDate);
              }}
          className="border border-gray-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center">
            <label className="mr-2">To:</label>
            <input
              type="date"
              min={minAllowedDate}
              max={maxAllowedDate}
              value={toDateUi}
              onChange={(e) => {
                const v = e.target.value;
                setToDateUi(v);
                setToDate(v || maxAllowedDate);
              }}
          className="border border-gray-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
                  className="h-[34px] px-3 text-sm bg-[#6a6bcf] hover:text-[#6a6bcf]  rounded hover:bg-white text-white border border-[#6a6bcf] disabled:opacity-50"

            variant="outline"
            onClick={() => {
              setTypeFilter("");
              setStatusFilter("");
              setColumnFilters([]);
              setFromDate(minAllowedDate);
              setToDate(maxAllowedDate);
              setFromDateUi("");
              setToDateUi("");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* <div className="flex items-center py-4">
        <Input
          placeholder="Filter by date..."
          value={(table.getColumn("created")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("created")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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

      {/* {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Fund</h2>
              <button
                onClick={closeModal}
                className="text-xl text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>

            <div className="max-w-md mx-auto p-4 bg-white shadow rounded space-y-4">
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-blue-600 mb-1">
                  Amount
                </label>
                <div className="flex items-center border rounded px-3 py-2">
                  <span className="text-gray-500 mr-2">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={handleChange}
                    className="w-full outline-none"
                    placeholder="Enter amount"
                  />
                </div>
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
              </div>

             
              <div>
                <label className="block text-sm text-gray-600">Credit</label>
                <input
                  type="text"
                  value={`$ ${credit.toFixed(2)}`}
                  disabled
                  className="w-full px-3 py-1 bg-gray-100 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600">
                  Processing Fee
                </label>
                <input
                  type="text"
                  value={`$ ${processingFee.toFixed(2)}`}
                  disabled
                  className="w-full px-3 py-1 bg-gray-100 border rounded"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Payment Method
                </label>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="capitalist"
                      checked={method === "capitalist"}
                      onChange={(e) => setMethod(e.target.value)}
                    />
                    💳 Capitalist
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="coinbase"
                      checked={method === "coinbase"}
                      onChange={(e) => setMethod(e.target.value)}
                    />
                    🌐 Coinbase - Crypto
                  </label>
                </div>
                <div className="flex justify-end">
                  <button
                    className=" bg-blue-600 text-white px-2 py-1 rounded"
                    type="submit"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )} */}

      <div className="border rounded-md">
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
  );
}
