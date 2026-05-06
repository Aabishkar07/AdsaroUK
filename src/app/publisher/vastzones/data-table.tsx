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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";

interface BannerSize {
  id: number;
  width: number;
  height: number;
}
type FormValues = {
  zoneName: string;
  enabled: boolean;
  mimeTypes: string[];
  duration: number | null;
  width: number | null;
  height: number | null;
};

interface VastZoneData {
  id: string;
  name: string;
  is_active: boolean;
  // placesize_id: string;
}


interface FormData {
  zoneName: string;
  duration: number | null;
  width: number | null;
  height: number | null;
}

export function DataTableDemo() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const auth = useAuth();

  const mytoken = auth?.token;
  // const [bannerList, setBannerList] = useState<BannerSize[]>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [data, setData] = useState<VastZoneData[]>([]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const columns: ColumnDef<VastZoneData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    {
      accessorKey: "id",
      header: () => <div className="">Id</div>,
      cell: ({ row }) => {
        return <div className="font-medium ">{row.getValue("id")}</div>;
      },
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
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("name")}</div>
      ),
    },

    // {
    //   accessorKey: "placesize_id",
    //   header: () => <div className="">Place Size</div>,
    //   cell: ({ row }) => {
    //     const placeSize = bannerList.find(
    //       (item) => item.id === row.getValue("placesize_id")
    //     );
    //     return (
    //       <div className="font-medium">
    //         {placeSize ? placeSize.width : row.getValue("placesize_id")}*
    //         {placeSize ? placeSize.height : row.getValue("placesize_id")}
    //       </div>
    //     );
    //   },
    // },

    {
      id: "actions",
      header: () => <div className="">Action</div>,
      enableHiding: false,
      cell: ({ row }) => {
        // const payment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-8 h-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {/* <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payment.id)}
              >
                Copy payment ID
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openBannerCodePopup(row.original)}
              >
                Get Banner Code
              </DropdownMenuItem>
              <DropdownMenuItem>View payment details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        `https://panel.adsaro.com/publisher/api/CpmVastZones/?version=4&token=${mytoken}`
      );
      const rowsArray = Object.values(
        response.data.response?.rows || {}
      ) as VastZoneData[];
      setData(rowsArray);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const loadBannerSize = async () => {
    try {
      const url = `https://panel.adsaro.com/admin/api/CpmBannerSize/?version=4&userToken=1wDtEkEz2ykyOdyx`;
      const response = await axios.get(url);
      const rows = response.data?.response?.rows;

      if (rows && typeof rows === "object") {
        const bannerArray = Object.values(rows) as BannerSize[];
        console.log(bannerArray);
      } else {
        console.warn("Invalid data format:", rows);
      }
    } catch (error) {
      console.error("Failed to load Banner:", error);
    }
  };
  useEffect(() => {
    if (mytoken) {
      fetchData();
    }
    loadBannerSize();
  }, [mytoken, auth.publisherData]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [bannerscript, setScript] = useState("");
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [addedZoneData, setAddedZoneData] = useState<FormData | null>(null);
  // const [tooltipVisible, setTooltipVisible] = useState(false);
  // const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      zoneName: "",
      enabled: true,
      mimeTypes: ["MP4", "WEBM", "WMV", "SWF"],
      duration: 0,
      width: 0,
      height: 0,
    },
  });
  const selectedMimeTypes = watch("mimeTypes");
  const mimeTypes = ["FLV", "MP4", "WEBM", "WMV", "SWF", "JAVASCRIPT"];
  const openModal = () => {
    setIsModalOpen(true);
    setCurrentStep(1);
    setAddedZoneData(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStep(1);
    setAddedZoneData(null);
    reset();
  };

  const toggleMimeType = (type: string) => {
    const current = selectedMimeTypes || [];
    if (current.includes(type)) {
      setValue(
        "mimeTypes",
        current.filter((t) => t !== type)
      );
    } else {
      setValue("mimeTypes", [...current, type]);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log(data);
    // const mydata = {
    //   publisher_id: auth.publisherData?.id,
    //   passback_tag: data.passbackAdTag,
    //   passback_url: data.passbackUrl,
    //   name: data.zoneName,
    // };

    // try {
    //   const response = await fetch("/api/bannerzone", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ data: mydata }),
    //   });

    //   const result = await response.json();
    //   // const createdId = result.response.created;

      
    //   fetchData();
    //   setAddedZoneData(data);
    //   setCurrentStep(2);
    //   reset();
    // } catch (err) {
    //   console.error("Error submitting banner zone:", err);
    // }
  };

  const openBannerCodePopup = (row: VastZoneData) => {
    console.log("row", row);

    // const selectedSize = bannerList.find(
    //   (b) => b.id === Number(row.placesize_id)
    // );
    // if (selectedSize) {
    //   const { width, height } = selectedSize;
    //   axios
    //     .get(
    //       `https://panel.adsaro.com/admin/api/banner_code?type=js_ext&size=${width}x${height}&id=${row.id}&version=4&userToken=1wDtEkEz2ykyOdyx`
    //     )
    //     .then((response) => {
    //       setScript(response.data.response.code);
    //       setIsPopupOpen(true);
    //     });
    // }
  };

  return (
    <div className="w-full p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xl font-bold text-purple-600">Vast Zone</div>
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
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-4 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between pb-2 mb-1 border-b">
              <h2 className="text-xl font-bold">
                {currentStep === 1
                  ? "Add New Vast Zone"
                  : "Zone Successfully Created"}
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
                  {/* General Section */}
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">General</h2>

                    {/* Zone Name */}
                    <div>
                      <Label htmlFor="zoneName" className="block mb-1 text-sm">
                        Zone Name
                      </Label>
                      <Input
                        id="zoneName"
                        placeholder="Enter zone name"
                        {...register("zoneName")}
                      />
                      {errors.zoneName && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.zoneName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Video Section */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Video</h2>

                    {/* MIME Types */}
                    <div>
                      <Label className="block mb-2 text-sm">MIME Types</Label>
                      <div className="flex flex-wrap gap-4">
                        {mimeTypes.map((type) => (
                          <div
                            key={type}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={type}
                              checked={selectedMimeTypes?.includes(type)}
                              onCheckedChange={() => toggleMimeType(type)}
                            />
                            <Label htmlFor={type}>{type}</Label>
                          </div>
                        ))}
                      </div>
                      {errors.mimeTypes && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.mimeTypes.message}
                        </p>
                      )}
                    </div>

                    {/* Duration */}
                    <div>
                      <Label htmlFor="duration" className="block mb-1 text-sm">
                        Max Video Duration (min)
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        {...register("duration")}
                      />
                      {errors.duration && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.duration.message}
                        </p>
                      )}
                    </div>

                    {/* Player Width */}
                    <div>
                      <Label htmlFor="width" className="block mb-1 text-sm">
                        Player Width
                      </Label>
                      <Input id="width" type="number" {...register("width")} />
                      {errors.width && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.width.message}
                        </p>
                      )}
                    </div>

                    {/* Player Height */}
                    <div>
                      <Label htmlFor="height" className="block mb-1 text-sm">
                        Player Height
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        {...register("height")}
                      />
                      {errors.height && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.height.message}
                        </p>
                      )}
                    </div>
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
                  onSubmit={(e) => {
                    e.preventDefault();
                    closeModal();
                  }}
                  className="space-y-2"
                >
                  <div className="space-y-2">
                    <p>
                      <strong>Zone Name:</strong> {addedZoneData.zoneName}
                    </p>
                    <p>
                      <strong>Placement Size:</strong>{" "}
                      {/* {
                        bannerList.find(
                          (b) => b.id === Number(addedZoneData.placementSize)
                        )?.width
                      }
                      ×
                      {
                        bannerList.find(
                          (b) => b.id === Number(addedZoneData.placementSize)
                        )?.height
                      } */}
                    </p>
                    <p>
                      <strong>Passback URL:</strong> 
                      {/* {addedZoneData.passbackUrl} */}
                    </p>
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold">Script</label>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <button
                          type="button"
                          className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
                          // onClick={() => {
                          //   if (bannerscript) {
                          //     navigator.clipboard.writeText(bannerscript);
                          //     setCopied(true);
                          //     setTimeout(() => setCopied(false), 2000);
                          //   }
                          // }}
                        >
                          Copy
                        </button>
                        {/* {copied && (
                          <span className="ml-2 text-sm font-medium text-green-600 transition-opacity duration-300">
                            Copied!
                          </span>
                        )} */}
                      </div>
                      {/* <pre className="p-3 overflow-auto text-sm whitespace-pre-wrap border bg-gray-50 max-h-60">
                        {bannerscript || "Loading..."}
                      </pre> */}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">Done</Button>
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
              <h2 className="text-xl font-bold">Banner Code</h2>
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
                    // onClick={() => {
                    //   if (bannerscript) {
                    //     navigator.clipboard.writeText(bannerscript);
                    //     setCopied(true);
                    //     setTimeout(() => setCopied(false), 2000);
                    //   }
                    // }}
                  >
                    Copy
                  </button>
                  {/* {copied && (
                    <span className="ml-2 text-sm font-medium text-green-600 transition-opacity duration-300">
                      Copied!
                    </span>
                  )} */}
                </div>
                {/* <pre className="p-3 overflow-auto text-sm whitespace-pre-wrap border bg-gray-50 max-h-60">
                  {bannerscript || "Loading..."}
                </pre> */}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setIsPopupOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
