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
import { ArrowUpDown, ChevronDown, FileCode, Pencil } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Textarea } from "@/components/ui/textarea";

interface BannerZoneData {
  id: string;
  description: string;
  auth: string;
}

interface FormData {
  zoneName: string;
  description: string;
  triggerValue: string;
  query: number;
  cookie: string;
  subid: string;
  auth: string;
  id: string;
}

export function DataTableDemo() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const auth = useAuth();

  const mytoken = auth?.token;
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [data, setData] = useState<BannerZoneData[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const columns: ColumnDef<BannerZoneData>[] = [
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
      header: () => <div className="">Id</div>,
      cell: ({ row }) => {
        return <div className="font-medium ">{row.getValue("id")}</div>;
      },
    },
    {
      accessorKey: "description",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("description")}</div>
      ),
    },
    {
      accessorKey: "auth",
      header: () => <div className="">Feed Auth</div>,
      cell: ({ row }) => {
        return <div className="font-medium ">{row.getValue("auth")}</div>;
      },
    },

    {
      id: "actions",
      header: () => <div className="">Action</div>,
      enableHiding: false,
      cell: ({ row }) => {
        // const payment = row.original;

        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              title="Generate Script Code"
              onClick={() => openCodePopup(row.original as unknown as FormData)}
            >
              <FileCode className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              title="Edit"
              onClick={() => openEditPopup(row.original as unknown as FormData)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        );
      },
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
        `https://panel.adsaro.com/publisher/api/Feed/?version=4&token=${mytoken}`
      );
      const rowsArray = Object.values(
        response.data.response?.rows || {}
      ) as BannerZoneData[];
      setData(rowsArray);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (mytoken) {
      fetchData();
    }
  }, [mytoken, auth.publisherData]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bannerscript, setScript] = useState("");
  const [popData, setPopData] = useState<FormData | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [addedZoneData, setAddedZoneData] = useState<FormData | null>(null);
  // const [tooltipVisible, setTooltipVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editData, setEditData] = useState<FormData | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const exportCsv = () => {
    const toCsvValue = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };

    const rows = table.getFilteredRowModel().rows.map((r) => r.original);
    const header = ["id", "description", "auth"];
    const csv = [
      header.map(toCsvValue).join(","),
      ...rows.map((r) => [r.id, r.description, r.auth].map(toCsvValue).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "popzones.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const openModal = () => {
    setIsModalOpen(true);
    setCurrentStep(1);
    setAddedZoneData(null);
  };

  useEffect(() => {
    if (searchParams?.get("add") === "1") {
      openModal();
      router.replace("/publisher/popzones");
    }
  }, [searchParams, router]);

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStep(1);
    setAddedZoneData(null);
    reset();
  };
  const closeModal2 = () => {
    setIsEditModalOpen(false);
    reset();
  };
  const [initiateType, setInitiateType] = useState("click");
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const mydata = {
      description: data.zoneName,
      publisher_id: auth?.publisherData?.id,
    };

    try {
      const response = await fetch("/api/popzone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: mydata }),
      });

      const result = await response.json();
      const createdId = result.response.created;

      const feeddata = await axios.get(
        `https://panel.adsaro.com/publisher/api/Feed/${createdId}?version=4&token=${auth?.token}`
      );
      setPopData(feeddata?.data?.response?.rows[createdId]);
      console.log("feeddata", feeddata?.data?.response?.rows[createdId]);

      fetchData();
      setAddedZoneData(data);
      setCurrentStep(2);
      reset();
    } catch (err) {
      console.error("Error submitting banner zone:", err);
    }
  };

  const openEditPopup = async (mydata: FormData) => {
    console.log("mydata", mydata?.id);
    setEditData(mydata);
    setIsEditModalOpen(true);
    reset();
  };

  const editSubmit: SubmitHandler<FormData> = async (data) => {
    console.log("auth.token", auth.publisherData);
    const mydata = {
      token: auth.token,
      publisherData: auth.publisherData,
      description: data.zoneName,
      id: editData?.id,
    };

    try {
      const response = await fetch("/api/popzone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: mydata }),
      });

      // const result = await response.json();
      console.log("asff",response);
      setIsEditModalOpen(false);
      fetchData();
      reset();
    } catch (err) {
      console.error("Error submitting banner zone:", err);
    }
  };

  const openCodePopup = async (mydata: FormData) => {
    setPopData(mydata);
    setIsModalOpen(true);
    setAddedZoneData(mydata);
    setCurrentStep(2);
    reset();
  };

  const onSubmitpopup: SubmitHandler<FormData> = async (popzonedata) => {
    if (popData !== null) {
      const scriptContent = `
        window.adk_pdisp = {
          h: '{host}',
          f: ${popData.id},
          a: '${popData.auth}',
          ${initiateType === "click" ? "ps" : "in"}: [${
        popzonedata.triggerValue
      }],
          s: '${popzonedata.subid}',
          q: [${popzonedata.query}],
          t: ${popzonedata.cookie},
          ${initiateType === "click" ? "cin: 4," : ""}
        };
      `;

      const fullScript = `
        <script>
          ${scriptContent}
        </script>
        <script src="//static.saroadexchange.com/tabu/display.js"></script>
      `;
      setScript(fullScript);
    }

    setIsModalOpen(false);
    setIsPopupOpen(true);
    reset();
  };

  return (
    <div className="w-full p-5">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <button
          onClick={() => router.push("/publisher/zone")}
          className="text-blue-600 hover:underline font-medium"
        >
          Zone
        </button>
        <span>/</span>
        <span className="text-gray-800 font-semibold">Popzone</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-xl font-bold text-purple-600">Pop Zone</div>
        <div>
          <button
            className="flex items-center gap-2 px-4 py-2 text-white transition duration-500 ease-in-out bg-blue-500 border border-blue-500 rounded hover:text-blue-500 hover:bg-transparent"
            onClick={openModal}
          >
            Add New Zone
          </button>
        </div>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Filter names..."
          value={
            (table.getColumn("description")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("description")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        <Button
          variant="outline"
          className="ml-auto"
          onClick={exportCsv}
        >
          Export CSV
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-2">
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

      {/* add banner code */}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed max-sm:p-2 inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-2 sm:p-4 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between pb-2 sm:mb-4 border-b">
              <h2 className="text-xl font-bold">
                {currentStep === 1 ? "Add New Pop Zone" : "Pop Zone"}
              </h2>
              <button
                onClick={closeModal}
                className="text-xl text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto p-2">
              {currentStep === 1 && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  {/* Zone Name */}
                  <div>
                    <Label className="block mb-1 text-sm">Zone Name</Label>
                    <Input
                      id="zoneName"
                      type="text"
                      className="w-full p-2 border rounded"
                      {...register("zoneName", {
                        required: "Zone Name is required",
                      })}
                    />
                    {errors.zoneName && (
                      <p className="mt-1 text-sm text-red-500">
                        * {errors.zoneName.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </form>
              )}

              {/* Step 2 - Summary */}
              {currentStep === 2 && addedZoneData && (
                <form
                  onSubmit={handleSubmit(onSubmitpopup)}
                  className="space-y-2"
                >
                  <div className="space-y-3 sm:space-y-4 p-4 bg-white rounded-2xl shadow-md max-w-xl mx-auto">
                    {/* Initiate Popup */}
                    <div>
                      <Label className="text-base font-medium mb-2 block">
                        Initiate Popup
                      </Label>
                      <RadioGroup
                        defaultValue="click"
                        onValueChange={(value) => setInitiateType(value)}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="click" id="click" />
                          <Label htmlFor="click" className="text-sm">
                            On specific site clicks
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="interval" id="interval" />
                          <Label htmlFor="interval" className="text-sm">
                            Specified interval
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Trigger Value */}
                    <div>
                      <Label
                        htmlFor="triggerValue"
                        className="block text-sm font-medium mb-1"
                      >
                        {initiateType === "click"
                          ? "Number of Site Clicks"
                          : "Popup Interval (in seconds)"}
                      </Label>

                      <Input
                        id="triggerValue"
                        type="number"
                        defaultValue={1}
                        placeholder="e.g. 1"
                        className="w-full"
                        {...register("triggerValue", {
                          required: "This field is required",
                          min: { value: 1, message: "Must be at least 1" },
                        })}
                      />
                      {errors.triggerValue && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.triggerValue.message}
                        </p>
                      )}
                    </div>

                    {/* Subid */}
                    <div>
                      <Label
                        htmlFor="subid"
                        className="block text-sm font-medium mb-1"
                      >
                        Subid
                      </Label>
                      <Input
                        id="subid"
                        placeholder="Enter Subid"
                        className="w-full"
                        {...register(
                          "subid"
                          // , { required: "Subid is required" }
                        )}
                      />
                      {errors.subid && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.subid.message}
                        </p>
                      )}
                    </div>

                    {/* Cookie Lifetime */}
                    <div>
                      <Label
                        htmlFor="cookie"
                        className="block text-sm font-medium mb-1"
                      >
                        Cookie Lifetime (in hours)
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="cookie"
                          type="number"
                          placeholder="e.g. 1"
                          className="w-full"
                          {...register("cookie", {
                            required: "Cookie lifetime is required",
                          })}
                        />
                      </div>
                      {errors.cookie && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.cookie.message}
                        </p>
                      )}
                    </div>

                    {/* Query */}
                    <div>
                      <Label
                        htmlFor="query"
                        className="block text-sm font-medium mb-1"
                      >
                        Query
                      </Label>
                      <Textarea
                        id="query"
                        placeholder="Enter your query..."
                        className="w-full"
                        {...register(
                          "query"
                          // ,{ required: "Query is required", }
                        )}
                      />
                      {errors.query && (
                        <p className="text-sm text  -red-500 mt-1">
                          {errors.query.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">Generate Script</Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-4 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between pb-2 mb-4 border-b">
              <h2 className="text-xl font-bold">Popup Script</h2>
              <button
                onClick={() => setIsPopupOpen(false)} // Close the popup
                className="text-xl text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="block mb-1 font-semibold">Script</label>
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <button
                    type="button"
                    className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
                    onClick={() => {
                      if (bannerscript) {
                        navigator.clipboard.writeText(bannerscript);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                  >
                    Copy
                  </button>
                  {copied && (
                    <span className="ml-2 text-sm font-medium text-green-600 transition-opacity duration-300">
                      Copied!
                    </span>
                  )}
                </div>
                <pre className="p-3 overflow-auto text-sm whitespace-pre-wrap border bg-gray-50 max-h-60">
                  {bannerscript || "Loading..."}
                </pre>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setIsPopupOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/*edit Modal */}
      {isEditModalOpen && (
        <div className="fixed max-sm:p-2 inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-2 sm:p-4 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between pb-2 sm:mb-4 border-b">
              <h2 className="text-xl font-bold">Edit Pop Zone</h2>
              <button
                onClick={closeModal2}
                className="text-xl text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto p-2">
              <form onSubmit={handleSubmit(editSubmit)} className="space-y-3">
                {/* Zone Name */}
                <div>
                  <Label className="block mb-1 text-sm">Zone Name</Label>
                  <Input
                    id="zoneName"
                    type="text"
                    defaultValue={editData?.description}
                    className="w-full p-2 border rounded"
                    {...register("zoneName", {
                      required: "Zone Name is required",
                    })}
                  />
                  {errors.zoneName && (
                    <p className="mt-1 text-sm text-red-500">
                      * {errors.zoneName.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
