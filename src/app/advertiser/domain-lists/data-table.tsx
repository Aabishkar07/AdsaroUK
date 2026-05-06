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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios, { AxiosResponse } from "axios";
import { useAuth } from "@/context/context";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface Referral {
  id: string;
  actions: string;
  name: string;
  domains: string;
  readonly: string;
  token: string;
  expires: string;
}

interface ApiResponse {
  response: {
    rows: Record<string, Referral>;
  };
}

export function DomainListTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [data, setData] = useState<Referral[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState<string>("");
  const [selectedData, setSelectedData] = useState<Referral | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  const auth = useAuth();
  const mytoken: string | undefined = auth?.token;

  const columns: ColumnDef<Referral>[] = [
    {
      accessorKey: "id",
      header: () => <div>ID</div>,
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: () => <div>Name</div>,
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "Action",
      header: () => <div>Action</div>,
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

  const handleUpload = async (): Promise<void> => {
    if (!file || !name) {
      alert("Enter name and select a file");
      return;
    }
    try {
      const base64 = await convertFileToBase64(file);
      const respon: AxiosResponse = await axios.post("/api/domainlist", {
        name,
        domains: base64,
        token: mytoken,
      });
      console.log("aaa",respon)

      const { status } = respon?.data?.data ?? {};
      if (status == "Error") {
        alert("Must be a well-formed domain name.");
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

  const handleEdit = (row: Referral): void => {
    setSelectedData(row);
    setShowEditModal(true);
  };

  const handleDelete = (row: Referral): void => {
    setSelectedData(row);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!selectedData) return;
    try {
      await axios.delete(
        `https://panel.adsaro.com/advertiser/api/DomainList/${selectedData.id}?version=4&token=${mytoken}`
      );
      setShowDeleteModal(false);
      fetchData();
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  const fetchData = async (): Promise<void> => {
    if (!mytoken) return;
    try {
      const url = `https://panel.adsaro.com/advertiser/api/DomainList/?version=4&token=${mytoken}`;
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

  // Edit Modal Component
  type EditListProps = {
    loaddata: () => void;
    selectedData?: Referral | null;
    setShowEditModal: (value: boolean) => void;
  };

  interface FormInputs {
    name: string;
    domains: string;
  }

  function EditList({
    loaddata,
    selectedData,
    setShowEditModal,
  }: EditListProps) {
    const {
      register,
      handleSubmit,
      reset,
      setValue,
      formState: { errors },
    } = useForm<FormInputs>();

    useEffect(() => {
      if (selectedData) {
        setValue("name", selectedData.name);
        setValue("domains", selectedData.domains);
      } else {
        reset();
      }
    }, [selectedData, setValue, reset]);

    const onSubmit = async (data: FormInputs) => {
      setShowEditModal(false);

      const requestData = JSON.stringify({
        token: mytoken,
        id: selectedData?.id,
        data: {
          name: data.name,
          domains: data.domains,
        },
      });

      try {
        const response = await fetch("/api/domainlist", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: requestData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        await response.json();
        loaddata();
      } catch (error) {
        console.error("Error updating domain list:", error);
      }

      reset();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (file.type !== "text/plain") {
          alert("Only .txt files are allowed!");
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          if (typeof reader.result === "string") {
            const base64String = reader.result.split(",")[1];
            setValue("domains", base64String);
          }
        };
      }
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg w-96">
          <h2 className="text-xl font-bold mb-4">Edit List</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter list name"
                className="mt-1 block w-full border border-gray-300 rounded p-2"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="domains"
                className="block text-sm font-medium text-gray-700"
              >
                Upload New File (.txt only)
              </label>
              <input
                id="domains"
                type="file"
                accept=".txt"
                className="mt-1 block w-full border border-gray-300 rounded p-2"
                onChange={handleFileChange}
              />
              {selectedData?.domains && (
                <div className="text-xs text-gray-500 mt-2">
                  <strong>Current Domains (base64):</strong>
                  <div className="break-words max-h-20 overflow-y-auto border border-gray-200 p-2 rounded bg-gray-50">
                    {selectedData.domains}
                  </div>
                </div>
              )}
              <input
                type="hidden"
                {...register("domains", { required: "Domains is required" })}
              />
              {errors.domains && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.domains.message}
                </p>
              )}
            </div>

            <div className="flex gap-x-2 justify-end">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400"
              >
                Close
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400"
              >
                Update List
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <div className="text-xl font-medium text-gray-700 ">Domain List</div>
        <button
          className="bg-blue-500 text-white px-4 py-3 text-xs rounded-md"
          onClick={() => setIsOpen(true)}
        >
          New Domain List
        </button>
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
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(val) => col.toggleVisibility(!!val)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Upload Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Upload Domain List</h2>
            <input
              type="text"
              placeholder="Enter Name"
              className="w-full p-2 border rounded-md mb-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              accept=".txt"
              type="file"
              className="w-full p-2 border rounded-md mb-3"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="flex justify-end space-x-3">
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={handleUpload}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedData && (
        <EditList
          loaddata={fetchData}
          selectedData={selectedData}
          setShowEditModal={setShowEditModal}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedData && (
        <div className="fixed z-[999] inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h3>Are you sure you want to delete {selectedData.name}?</h3>
            <div className="pt-5 px-4">
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="ml-3 bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
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
            )}
          </TableBody>
        </Table>

      </div>
        <div className="flex items-center  space-x-2 px-4 py-3">
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
          <span className="flex items-center gap-1">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </span>
        </div>
    </div>
  );
}
