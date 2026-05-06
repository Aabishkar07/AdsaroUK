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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
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
  date: string;
  commission: string | number;
  referrals: string | number;
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
    accessorKey: "commission",
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
      const value = row.getValue("commission");
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
    []
  );
  const [data, setData] = React.useState<BannerZoneData[]>([]);
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [displayFromDate, setDisplayFromDate] = React.useState("");
  const [displayToDate, setDisplayToDate] = React.useState("");
  const [referid, setReferid] = React.useState<number | string | null>(null);
  const [currentPage, setCurrentPage] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
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
    const publisher_id = auth?.publisherData?.id ?? null;
    setReferid(publisher_id);
  }, [auth]);

  React.useEffect(() => {
    const path = window.location.pathname;
    const page = path.split("/").filter(Boolean).pop() || "";
    setCurrentPage(page.charAt(0).toUpperCase() + page.slice(1) || "Dashboard");
  }, []);

  console.log(mytoken, "aabishkar");

  const formatLocalDate = (d: Date) => {
    return d.toLocaleDateString("en-CA");
  };

  const fetchData = async () => {
    if (!fromDate || !toDate || !mytoken) {
      console.log("Missing input");
      return;
    }

    try {
      setIsLoading(true);
      const url = `https://panel.adsaro.com/publisher/api/ReferralsByDate/?version=4&token=${mytoken}&filters=date:${fromDate}_${toDate}`;
      console.log("Fetching:", url);

      const response = await axios.get(url);
      const rowsArray = Object.values(
        response.data.response.rows || {}
      ) as BannerZoneData[];
      setData(
        rowsArray.map((row: any) => ({
          ...row,
          commission:
            row?.commission ??
            row?.commissions ??
            row?.Commission ??
            row?.Commissions ??
            0,
          referrals: row?.referrals ?? row?.Referrals ?? 0,
        }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
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
  }, []);

  React.useEffect(() => {
    if (mytoken && fromDate && toDate) {
      fetchData();
    }
  }, [mytoken, fromDate, toDate]);

  const handleClearFilter = () => {
    const now = new Date();
    const startDate = new Date(2024, 0, 1);

    const formattedFromDate = formatLocalDate(startDate);
    const formattedToDate = formatLocalDate(now);

    setFromDate(formattedFromDate);
    setToDate(formattedToDate);
    setDisplayFromDate("");
    setDisplayToDate("");
  };

  const handleExportCSV = () => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["Date", "Commissions", "Referrals"];
    const csvRows = [
      headers.join(","),
      ...data.map(
        (row) => `${row.date},${(row as any).commission || 0},${row.referrals || 0}`,
      ),
      `Total,${totalCommissions},${totalReferrals}`,
    ];

    const csvContent = csvRows.join("\n");
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

  const totalReferrals = data.reduce(
    (sum, row) => sum + Number(row.referrals || 0),
    0,
  );
  const totalCommissions = data.reduce(
    (sum, row) => sum + Number((row as any).commission || 0),
    0,
  );

  return (
    <div className="w-full  mt-14 max-sm:px-4">
      <div className="flex items-center justify-between pb-3">
        <nav className="flex items-center text-sm pl-3 text-gray-500">
          <a
            href="/publisher/dashboard"
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
      <div className="bg-white border border-gray-200 rounded-md mb-6">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-base font-semibold text-gray-800">
            Referrals Statistics
          </h2>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Your referral link:</p>
              <p className="text-sm text-blue-600 break-all">
                https://www.adsaro.com/publisher/signup?ref={referid || ""}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Total referrals:</p>
              <p className="text-2xl font-semibold text-gray-800">
                {totalReferrals}
              </p>
            </div>

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
        <div className="flex gap-4">
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
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow className="bg-gray-100 font-bold border-t-2 border-gray-300">
                  <TableCell className="text-gray-800">Total</TableCell>
                  <TableCell className="text-gray-800">
                    {data
                      .reduce(
                        (sum, row) => sum + Number((row as any).commission || 0),
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
