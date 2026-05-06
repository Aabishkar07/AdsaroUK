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
import { useRouter } from "next/navigation";

// const data: Payment[] = [
//   {
//     id: "m5gr84i9",
//     amount: 316,
//     status: "success",
//     email: "ken99@example.com",
//   },
//   {
//     id: "3u1reuv4",
//     amount: 242,
//     status: "success",
//     email: "Abe45@example.com",
//   },
//   {
//     id: "derv1ws0",
//     amount: 837,
//     status: "processing",
//     email: "Monserrat44@example.com",
//   },
//   {
//     id: "5kma53ae",
//     amount: 874,
//     status: "success",
//     email: "Silas22@example.com",
//   },
//   {
//     id: "bhqecj4p",
//     amount: 721,
//     status: "failed",
//     email: "carmella@example.com",
//   },
// ]

interface BannerZoneData {
  id: number
  date: string
  type: string
  status:string
  paymentmethod:string
  amount:string
  description: string
  comments: string

}

// export type Payment = {
//   id: string
//   amount: number
//   status: "pending" | "processing" | "success" | "failed"
//   email: string
// }

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
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          id
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("id")}</div>,
  },


  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          date
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("date")}</div>,
  },

  
  {
    accessorKey: "type",
    header: () => <div className="">Type</div>,
    cell: ({ row }) => {
      return <div className="font-medium ">{row.getValue("type")}</div>
    },
  },




  {
    accessorKey: "status",
    header: () => <div className=""> Status</div>,
    cell: ({ row }) => {
      return <div className="font-medium ">{row.getValue("status")}</div>
    },
  },

  {
    accessorKey: "paymentmethod",
    header: () => <div className=""> 	
Payment Method</div>,
    cell: ({ row }) => {
      return <div className="font-medium ">{row.getValue("paymentmethod")}</div>
    },
  },

  {
    accessorKey: "amount",
    header: () => <div className="">Amount</div>,
    cell: ({ row }) => {
      return <div className="font-medium ">{row.getValue("amount")}</div>
    },
  },

  {
    accessorKey: "description",
    header: () => <div className="">Description</div>,
    cell: ({ row }) => {
      return <div className="font-medium ">{row.getValue("description")}</div>
    },
  },

  {
    accessorKey: "comments",
    header: () => <div className="">Comments</div>,
    cell: ({ row }) => {
      return <div className="font-medium ">{row.getValue("comments")}</div>
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
  const [displayFromDate, setDisplayFromDate] = React.useState("");
  const [displayToDate, setDisplayToDate] = React.useState("");
  const [activeRange, setActiveRange] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
    const router = useRouter();
  
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
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
  })

  console.log(mytoken, "aabishkar");

  const formatLocalDate = (d: Date) => {
    return d.toLocaleDateString("en-CA");
  };

  React.useEffect(() => {
    const now = new Date();
    const startDate = new Date(2024, 0, 1);

    const formattedFromDate = formatLocalDate(startDate);
    const formattedToDate = formatLocalDate(now);

    setFromDate(formattedFromDate);
    setToDate(formattedToDate);
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
      case 'Today':
        startDate = endDate;
        break;
      case 'Yesterday':
        today.setDate(today.getDate() - 1);
        startDate = formatLocalDate(today);
        endDate = startDate;
        break;
      case 'Last 3 days':
        today.setDate(today.getDate() - 3);
        startDate = formatLocalDate(today);
        break;
      case 'Last 30 days':
        today.setDate(today.getDate() - 30);
        startDate = formatLocalDate(today);
        break;
      case 'This month':
        today.setDate(1); // Start of this month
        startDate = formatLocalDate(today);
        break;
      default:
        break;
    }

    setFromDate(startDate);
    setToDate(endDate || formatLocalDate(new Date()));
    setDisplayFromDate(startDate);
    setDisplayToDate(endDate);
  };

  const fetchData = async () => {
    if (!fromDate || !toDate || !mytoken) {
      console.log("Missing input");
      return;
    }

    try {
      setIsLoading(true);
      const url = `https://panel.adsaro.com/publisher/api/Transactions/?version=4&token=${mytoken}&filters=date:${fromDate}_${toDate}`;
      console.log("Fetching:", url);

      const response = await axios.get(url);
      const rowsArray = Object.values(response.data.response.rows || {})as BannerZoneData[];
      setData(rowsArray);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: Run automatically when fromDate, toDate, and token are all set
  React.useEffect(() => {
    if (mytoken && fromDate && toDate) {
      fetchData();
    }
  }, [mytoken, fromDate, toDate]);

  const handleExportCSV = () => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    const escapeCell = (value: unknown) => {
      const s = value == null ? "" : String(value);
      return `"${s.replace(/"/g, '""')}"`;
    };

    const headers = [
      "ID",
      "Date",
      "Type",
      "Status",
      "Payment Method",
      "Amount",
      "Description",
      "Comments",
    ];

    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        [
          row.id,
          row.date,
          row.type,
          row.status,
          row.paymentmethod,
          row.amount,
          row.description,
          row.comments,
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
    link.setAttribute("download", `publisher_transactions_${fromDate}_to_${toDate}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  

  return (
    <div className="w-full mt-14 max-sm:px-4">

     <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pb-3 mt-2">

  {/* Breadcrumb */}
  <nav className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 pl-1 md:pl-3">
    <a
      href="/publisher/dashboard"
      className="hover:text-gray-700 font-medium transition-colors"
    >
      Home
    </a>

    <span className="mx-2 text-gray-400">/</span>

    <span className="text-gray-800 font-semibold">
      Payment Transactions
    </span>
  </nav>

  {/* Buttons */}
  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">

    <Button
      onClick={() => router.push("/publisher/paymentinformation")}
      variant="outline"
      className="h-9 w-full sm:w-auto"
    >
      Payment Information
    </Button>

    <Button
      onClick={handleExportCSV}
      disabled={data.length === 0}
      className="
        inline-flex items-center justify-center gap-2
        h-9 w-full sm:w-auto px-4
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
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

    {/* Range */}
    <div className="w-full">
      <label className="block text-xs font-medium text-gray-600 mb-1">
        Range
      </label>
      <select
        value={activeRange}
        onChange={(e) => handleDateRangeChange(e.target.value)}
        className="w-full border border-gray-300 px-3 py-2 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500"
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
    <div className="w-full">
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
        className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {/* To */}
    <div className="w-full">
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
        className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500"
      />
    </div>

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
            {table.getRowModel().rows?.length ? (
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
  )
}
