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
import {

  TableRow,
} from "@/components/ui/table";
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
import axios, { AxiosResponse } from "axios";
import { useAuth } from "@/context/context";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface AppList {
  id: string;
  name: string;
  ipaddresses: string;
  remove_invalid: string;
  timestamp: string;
}

interface ApiResponse {
  response: {
    rows: Record<string, AppList>;
  };
}

export function AppListTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [data, setData] = useState<AppList[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [selectedData, setSelectedData] = useState<AppList | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const auth = useAuth();
  const mytoken = auth?.token;

  const columns: ColumnDef<AppList>[] = [
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
    // {
    //   accessorKey: "ipaddresses",
    //   header: "IP Addresses",
    //   cell: ({ row }) => <div>{row.getValue("ipaddresses")}</div>,
    // },
    // {
    //   accessorKey: "remove_invalid",
    //   header: "Remove Invalid",
    //   cell: ({ row }) => <div>{row.getValue("remove_invalid")}</div>,
    // },
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      cell: ({ row }) => <div>{row.getValue("timestamp")}</div>,
    },
    {
      accessorKey: "Action",
      header: "Action",
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
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
    });
  };

  const handleUpload = async () => {
    if (!file || !name) {
      alert("Please provide a name and file.");
      return;
    }
    try {
      const base64 = await convertFileToBase64(file);
      const res = await axios.post("/api/applist", {
        name,
        ipaddresses: base64,
        token: mytoken,
      });
      console.log("res", res);
      const { status } = res?.data?.data ?? {};
      if (status === "Error") {
        alert("Must be a valid list of IP addresses.");
        return;
      }

      setIsOpen(false);
      fetchData();
      setName("");
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  const handleEdit = (row: AppList) => {
    setSelectedData(row);
    setShowEditModal(true);
  };

  const handleDelete = (row: AppList) => {
    setSelectedData(row);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedData) return;
    try {
      await axios.delete(
        `https://panel.adsaro.com/advertiser/api/AppList/${selectedData.id}?version=4&token=${mytoken}`
      );
      setShowDeleteModal(false);
      fetchData();
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  const fetchData = async () => {
    if (!mytoken) return;
    try {
      const url = `https://panel.adsaro.com/advertiser/api/AppList/?version=4&token=${mytoken}`;
      const response: AxiosResponse<ApiResponse> = await axios.get(url);
      const rows = Object.values(response.data.response?.rows || {});
      setData(rows);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [mytoken]);

  function EditList({
    loaddata,
    selectedData,
    setShowEditModal,
  }: {
    loaddata: () => void;
    selectedData: AppList | null;
    setShowEditModal: (val: boolean) => void;
  }) {
    const {
      register,
      handleSubmit,
      reset,
      setValue,
      formState: { errors },
    } = useForm<{ name: string; ipaddresses: string }>();

    useEffect(() => {
      if (selectedData) {
        setValue("name", selectedData.name);
        setValue("ipaddresses", selectedData.ipaddresses);
      } else {
        reset();
      }
    }, [selectedData, setValue, reset]);

    const onSubmit = async (data: { name: string; ipaddresses: string }) => {
      setShowEditModal(false);
      try {
        await axios.put("/api/applist", {
          token: mytoken,
          id: selectedData?.id,
          data: {
            name: data.name,
            app_bundles: data.ipaddresses,
          },
        });
        loaddata();
      } catch (error) {
        console.error("Error updating App list:", error);
      }
      reset();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file?.type !== "text/plain") {
        alert("Only .txt files are allowed");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const base64 = reader.result.split(",")[1];
          setValue("ipaddresses", base64);
        }
      };
      reader.readAsDataURL(file);
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg w-96">
          <h2 className="text-xl font-bold mb-4">Edit App List</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                type="text"
                {...register("name", { required: "Name is required" })}
                className="mt-1 w-full p-2 border rounded"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="file" className="block text-sm font-medium">
                Upload .txt File
              </label>
              <input
                id="file"
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="mt-1 w-full p-2 border rounded"
              />
              <input
                type="hidden"
                {...register("ipaddresses", {
                  // required: "IP addresses required",
                })}
              />
              {errors.ipaddresses && (
                <p className="text-red-500 text-sm">
                  {errors.ipaddresses.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-x-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="bg-red-500 px-4 py-2 text-white rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 px-4 py-2 text-white rounded"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-700">App List</h1>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 text-white"
        >
          New App List
        </Button>
      </div>

      <div className="flex items-center py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(val) => col.toggleVisibility(!!val)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Upload App List</h2>
            <input
              type="text"
              placeholder="Enter Name"
              className="w-full p-2 border rounded mb-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              accept=".txt"
              type="file"
              className="w-full p-2 border rounded mb-3"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload}>Upload</Button>
            </div>
          </div>
        </div>
      )}

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
            <h3>Are you sure you want to delete {selectedData.name}?</h3>
            <div className="flex gap-x-2 justify-end mt-4">
              <Button className="bg-red-500 text-white" onClick={confirmDelete}>
                Confirm
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

      <ResponsiveTableWrapper>
        {/* Desktop Table View */}
        <div className="hidden md:block border rounded-md">
          <ResponsiveTable>
            <ResponsiveTableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <ResponsiveTableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </ResponsiveTableHead>
                  ))}
                </TableRow>
              ))}
            </ResponsiveTableHeader>
            <ResponsiveTableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <ResponsiveTableCell colSpan={columns.length} className="text-center">
                    No data
                  </ResponsiveTableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <ResponsiveTableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </ResponsiveTableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </ResponsiveTableBody>
          </ResponsiveTable>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {table.getRowModel().rows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No data
            </div>
          ) : (
            table.getRowModel().rows.map((row) => (
              <MobileCard key={row.id}>
                <MobileCardHeader>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{row.original.name}</span>
                  </div>
                  <ResponsiveActions>
                    <button onClick={() => handleEdit(row.original)}>
                      <div className="flex items-center border p-1.5 bg-blue-500 text-white rounded gap-x-2">
                        <AiOutlineEdit />
                        <span className="hidden sm:inline">Edit</span>
                      </div>
                    </button>
                    <button onClick={() => handleDelete(row.original)}>
                      <div className="flex items-center border p-1.5 bg-red-500 text-white rounded gap-x-2">
                        <AiOutlineDelete />
                        <span className="hidden sm:inline">Delete</span>
                      </div>
                    </button>
                  </ResponsiveActions>
                </MobileCardHeader>
                <MobileCardContent>
                  <MobileCardField
                    label="ID"
                    value={row.original.id}
                  />
                  <MobileCardField
                    label="Timestamp"
                    value={row.original.timestamp}
                  />
                </MobileCardContent>
              </MobileCard>
            ))
          )}
        </div>
      </ResponsiveTableWrapper>

      <ResponsivePagination
        currentPage={table.getState().pagination.pageIndex + 1}
        totalPages={table.getPageCount()}
        onPrevious={() => table.previousPage()}
        onNext={() => table.nextPage()}
        canPrevious={table.getCanPreviousPage()}
        canNext={table.getCanNextPage()}
      />
    </div>
  );
}
