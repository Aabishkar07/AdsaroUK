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
import { ArrowUpDown, ChevronDown, Edit, Trash2, Plus } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useAuth } from "@/context/context";
import { toast } from "sonner";
import EditList from "./edit/EditList";

interface DomainList {
  id: string;
  name: string;
  readonly?: string;
  token?: string;
  expires?: string;
}

type TableMeta = {
  handleEdit: (row: DomainList) => void;
  handleDelete: (row: DomainList) => void;
};

export const columns: ColumnDef<DomainList, unknown>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const domainList = row.original;
      const { handleEdit, handleDelete } = (table.options.meta as TableMeta);

      return (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(domainList)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(domainList)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      );
    },
  },
];

export function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [data, setData] = React.useState<DomainList[]>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [selectedData, setSelectedData] = React.useState<DomainList | null>(
    null
  );
  const [name, setName] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState("");
  const [uploadError, setUploadError] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const [fileContent, setFileContent] = React.useState<string>("");

  const auth = useAuth();
  const mytoken = auth?.token;

  const handleEdit = (row: DomainList) => {
    setSelectedData(row);
    setShowEditModal(true);
  };

  const handleDelete = (row: DomainList) => {
    setSelectedData(row);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedData && mytoken) {
      try {
        await axios.delete(
          `https://panel.adsaro.com/advertiser/api/DomainList/${selectedData.id}?version=4&token=${mytoken}`
        );
        toast.success("Domain list deleted successfully!");
        setShowDeleteModal(false);
        setSelectedData(null);
        fetchData();
      } catch (error) {
        console.error("Error deleting data:", error);
        toast.error("Failed to delete domain list. Please try again.");
      }
    }
  };

  const table = useReactTable<DomainList>({
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
      handleEdit,
      handleDelete,
    },
  });

  const fetchData = React.useCallback(async () => {
    if (!mytoken) return;

    try {
      const response = await axios.get(
        `https://panel.adsaro.com/advertiser/api/DomainList/?version=4&token=${mytoken}`
      );
      const rowsArray = Object.values(
        response.data.response?.rows || {}
      ) as DomainList[];
      setData(rowsArray);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [mytoken]);

  React.useEffect(() => {
    if (mytoken) {
      fetchData();
    }
  }, [mytoken, fetchData]);

  const validateAndProcessDomains = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const content = reader.result as string;
          const lines = content
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

          // Validate each line as a domain
          const validDomains: string[] = [];
          const invalidLines: string[] = [];

          for (const line of lines) {
            // Skip empty lines and comments
            if (!line || line.startsWith("#") || line.startsWith("//")) {
              continue;
            }

            // Basic domain validation regex
            const domainRegex =
              /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;

            if (domainRegex.test(line)) {
              validDomains.push(line.toLowerCase());
            } else {
              invalidLines.push(line);
            }
          }

          if (invalidLines.length > 0) {
            const errorMessage = `Invalid domain names found: ${invalidLines
              .slice(0, 3)
              .join(", ")}${
              invalidLines.length > 3
                ? ` and ${invalidLines.length - 3} more`
                : ""
            }. Please ensure all lines contain valid domain names only.`;
            reject(new Error(errorMessage));
            return;
          }

          if (validDomains.length === 0) {
            reject(
              new Error(
                "No valid domains found in the file. Please ensure the file contains valid domain names."
              )
            );
            return;
          }

          // Convert valid domains to base64
          const domainsText = validDomains.join("\n");
          const base64 = btoa(domainsText);
          resolve(base64);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setFileError(""); // Clear previous errors
    setUploadError(""); // Clear upload errors

    if (selectedFile) {
      // Read and display file content
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFileContent(content);
      };
      reader.readAsText(selectedFile);
    } else {
      setFileContent("");
    }
  };

  const handleUpload = async () => {
    if (!file || !name || !mytoken) {
      setUploadError("Please enter a name and select a file.");
      return;
    }

    setUploadError(""); // Clear previous errors
    setIsUploading(true); // Set loading state

    try {
      console.log(
        "Processing file:",
        file.name,
        "Size:",
        file.size,
        "Type:",
        file.type
      );
      const base64File = await validateAndProcessDomains(file);
      console.log(
        "File processed successfully, base64 length:",
        base64File.length
      );

      // API request payload
      const payload = { name, domains: base64File, token: mytoken };

      console.log("Sending Payload:", {
        name,
        domains: "[base64 data]",
        token: mytoken ? "[token present]" : "[no token]",
      });

      // Send request to Next.js API route
      const response = await axios.post("/api/domainlist", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("API Response:", response.data);
      console.log("Response structure:", {
        success: response.data.success,
        dataStatus: response.data.data?.status,
        dataSuccess: response.data.data?.success,
        hasData: !!response.data.data,
      });

      // Check for success - the external API might return different success indicators
      const isSuccess =
        response.data.success &&
        (response.data.data?.status === "Success" ||
          response.data.data?.status === "success" ||
          response.data.data?.status === "OK" ||
          response.data.data?.status === "ok" ||
          response.data.data?.success === true ||
          (response.data.data && !response.data.data.status)); // Some APIs don't return status field on success

      console.log("Success check result:", isSuccess);

      if (isSuccess) {
        toast.success("Domain list uploaded successfully!");
        setShowModal(false);
        setName("");
        setFile(null);
        setFileError("");
        setUploadError("");
        setFileContent("");
        fetchData();
      } else {
        // More specific error handling
        const errorMessage =
          response.data.data?.message ||
          response.data.message ||
          "Upload failed. Please try again.";
        toast.error(errorMessage);
        setUploadError(errorMessage);
        console.error("Upload failed:", response.data);
      }
    } catch (error) {
      console.error("Upload error:", error);

      if (axios.isAxiosError(error)) {
        // Handle axios-specific errors
        if (error.response) {
          // Server responded with error status
          const errorMessage =
            error.response.data?.data?.message ||
            error.response.data?.message ||
            `Server error: ${error.response.status}`;
          toast.error(errorMessage);
          setUploadError(errorMessage);
        } else if (error.request) {
          // Request was made but no response received
          const errorMessage =
            "Network error: Unable to connect to server. Please check your connection.";
          toast.error(errorMessage);
          setUploadError(errorMessage);
        } else {
          // Something else happened
          const errorMessage = "Request failed. Please try again.";
          toast.error(errorMessage);
          setUploadError(errorMessage);
        }
      } else if (error instanceof Error) {
        // File validation errors
        toast.error(error.message);
        setFileError(error.message);
      } else {
        const errorMessage = "An unexpected error occurred. Please try again.";
        toast.error(errorMessage);
        setUploadError(errorMessage);
      }
    } finally {
      setIsUploading(false); // Clear loading state
    }
  };

  return (
    <div className="w-full">
      <div className="p-4 bg-white rounded-lg shadow-md mb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">
            Domain Lists
          </h2>
          <p className="text-sm text-gray-500">
            Manage your domain lists for targeting campaigns
          </p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Filter by name..."
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Domain List
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
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
          </div>
        </div>
      </div>

      <div className="border rounded-md">
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

      {/* New Domain List Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Upload Domain List</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain List (.txt only)
                </label>
                <Input type="file" accept=".txt" onChange={handleFileChange} />
                <p className="text-xs text-gray-500 mt-1">
                  Each line should contain one domain name (e.g., example.com)
                </p>
                {fileError && (
                  <p className="text-red-500 text-sm mt-1">{fileError}</p>
                )}

                {/* Display file content */}
                {fileContent && (
                  <div className="mt-3 p-3 bg-gray-50 border rounded-md max-h-32 overflow-y-auto">
                    <p className="text-xs text-gray-600 mb-2">
                      Selected file: {file?.name}
                    </p>
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                      {fileContent}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {uploadError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{uploadError}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setName("");
                  setFile(null);
                  setFileError("");
                  setUploadError("");
                  setFileContent("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure you want to delete {selectedData.name}?
            </h3>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedData(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
