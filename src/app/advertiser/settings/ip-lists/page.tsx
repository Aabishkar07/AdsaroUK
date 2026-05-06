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
import { ChevronDown } from "lucide-react";
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
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdvertiserSidebar } from "@/components/advertiser/app-sidebar";
import { SiteAdvertiserHeader } from "@/components/advertiser/site-header";
import { useAuth } from "@/context/context";
import { CSVLink } from "react-csv";
import {
  AiOutlineDownload,
  AiOutlineEdit,
  AiOutlineDelete,
} from "react-icons/ai";
import axios from "axios";
import { useEffect, useState } from "react";
import AddList from "./Addlist/AddList";
import EditList from "./Edit/EditList";

// Define types for IP list data
export interface ReferralData {
  id: string;
  name: string;
  readonly: string;
  token: string;
  expires: string;
}

function IpListDataTable() {
  const [data, setData] = useState<ReferralData[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedData, setSelectedData] = useState<ReferralData | null>(null);

  const auth = useAuth();
  const mytoken = auth?.token;

  const handleEdit = (row: ReferralData) => {
    setSelectedData(row);
    setShowEditModal(true);
  };

  const handleDelete = (row: ReferralData) => {
    setSelectedData(row);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedData) {
      try {
        await axios.delete(
          `https://panel.adsaro.com/advertiser/api/IpList/${selectedData.id}?version=4&token=${mytoken}`
        );
        setShowDeleteModal(false);
        fetchData();
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }
  };

  const columns: ColumnDef<ReferralData>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div>{row.getValue("id")}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "readonly",
      header: "Read Only",
      cell: ({ row }) => <div>{row.getValue("readonly")}</div>,
    },
    {
      accessorKey: "expires",
      header: "Expires",
      cell: ({ row }) => <div>{row.getValue("expires")}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row.original)}>
            <div className="flex items-center border p-1.5 bg-blue-500 text-white rounded gap-x-2">
              <AiOutlineEdit className="text-xl" />
              Edit
            </div>
          </button>
          <button onClick={() => handleDelete(row.original)}>
            <div className="flex items-center border p-1.5 bg-red-500 text-white rounded gap-x-2">
              <AiOutlineDelete className="text-xl" />
              Delete
            </div>
          </button>
        </div>
      ),
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

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://panel.adsaro.com/advertiser/api/IpList/?version=4&token=${mytoken}`
      );
      const rowsArray = Object.values(
        response.data.response?.rows || {}
      ) as ReferralData[];
      setData(rowsArray);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (mytoken) {
      fetchData();
    }
  }, [mytoken]);

  // CSV export configuration
  const csvHeaders = [
    { label: "ID", key: "id" },
    { label: "Name", key: "name" },
    { label: "Read Only", key: "readonly" },
    { label: "Expires", key: "expires" },
  ];

  const csvData = data.map((row) => ({
    id: row.id,
    name: row.name,
    readonly: row.readonly,
    expires: row.expires,
  }));

  const csvLink = {
    filename: "IP List.csv",
    headers: csvHeaders,
    data: csvData,
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-700">IP Lists</h1>
        <AddList loaddata={fetchData} />
      </div>

      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        
        <div className="hover:bg-blue-500 border border-blue-500 hover:text-white px-4 py-2 rounded transition duration-500 ease-in-out text-blue-500 flex items-center gap-2 bg-transparent">
          <CSVLink {...csvLink} className="flex items-center">
            <span className="text-xl">
              <AiOutlineDownload />
            </span>
            <span className="pl-2">Download CSV</span>
          </CSVLink>
        </div>

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
      </div>

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
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
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

      {showEditModal && selectedData && (
        <EditList
          loaddata={fetchData}
          selectedData={selectedData}
          setShowEditModal={setShowEditModal}
        />
      )}

      {showDeleteModal && selectedData && (
        <div className="fixed z-[999] inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure you want to delete {selectedData.name}?
            </h3>
            <div className="flex gap-x-2 justify-end">
              <Button 
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Confirm Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Iplist: React.FC = () => {
  return (
    <SidebarProvider>
      <AdvertiserSidebar variant="inset" />
      <SidebarInset>
        <SiteAdvertiserHeader />
        <div className="flex flex-col flex-1">
          <div className="container sm:px-6 sm:space-y-8 pt-4">
            <div className="bg-white py-3 shadow-md flex justify-between items-center rounded-lg p-6">
              <div className="">
                <div className="text-gray-700 text-xl font-semibold mb-2">
                  IP Lists
                </div>
                <div className="text-sm text-gray-500">
                  <span className="hover:text-gray-700 transition-colors">Home</span>{" "}
                  /<span className="text-gray-800 font-medium ml-1">Setting</span>/
                  <span className="text-gray-800 font-medium ml-1">IP Lists</span>
                </div>
              </div>
            </div>

            <div className="bg-white py-3 text-black shadow-lg rounded-lg px-6">
              <IpListDataTable />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Iplist;
