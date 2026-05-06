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
import { ArrowUpDown, BarChart3, ChevronDown, FileCode, Pencil } from "lucide-react";
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


interface BannerSize {
  id: number;
  width: number;
  height: number;
}

const BANNER_SIZES: BannerSize[] = [
  { id: 6, width: 160, height: 600 },
  { id: 183, width: 200, height: 200 },
  { id: 27, width: 234, height: 60 },
  { id: 176, width: 240, height: 240 },
  { id: 10, width: 250, height: 250 },
  { id: 42, width: 300, height: 50 },
  { id: 110, width: 300, height: 100 },
  { id: 2, width: 300, height: 250 },
  { id: 39, width: 300, height: 300 },
  { id: 65, width: 300, height: 350 },
  { id: 18, width: 300, height: 600 },
  { id: 16, width: 320, height: 50 },
  { id: 44, width: 320, height: 100 },
  { id: 514, width: 320, height: 160 },
  { id: 520, width: 320, height: 180 },
  { id: 131, width: 320, height: 250 },
  { id: 83, width: 320, height: 480 },
  { id: 510, width: 336, height: 250 },
  { id: 32, width: 336, height: 280 },
  { id: 360, width: 340, height: 160 },
  { id: 465, width: 393, height: 292 },
  { id: 3, width: 468, height: 60 },
  { id: 524, width: 600, height: 800 },
  { id: 324, width: 690, height: 250 },
  { id: 4, width: 728, height: 90 },
  { id: 515, width: 760, height: 600 },
  { id: 531, width: 800, height: 67 },
  { id: 12, width: 800, height: 440 },
  { id: 13, width: 800, height: 600 },
  { id: 123, width: 900, height: 90 },
  { id: 108, width: 970, height: 250 },
  { id: 359, width: 980, height: 160 },
  { id: 530, width: 1100, height: 100 },
  { id: 566, width: 1140, height: 90 },
  { id: 529, width: 1200, height: 100 },
  { id: 565, width: 1200, height: 120 },
  { id: 517, width: 1272, height: 66 },
  { id: 516, width: 1280, height: 70 },
  { id: 518, width: 1280, height: 250 },
  { id: 298, width: 1600, height: 168 },
  { id: 126, width: 1920, height: 1080 },
];

interface BannerZoneData {
  id: string;
  name: string;
  is_active: boolean;
  placesize_id: string;
}
interface FormData {
  id: string;
  name: string;
  placesize_id: string;
  zoneName: string;
  placementSize: number;
  passbackAdTag: string;
  passbackUrl: string;
  passback_tag: string;
  passback_url: string;
}

type FormValues = {
  zoneName: string;
  placementSize: number | undefined;
  passbackAdTag: string;
  passbackUrl: string;
};

export function DataTableDemo() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const auth = useAuth();

  const mytoken = auth?.token;
  const [bannerList] = useState<BannerSize[]>(BANNER_SIZES);
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

    {
      accessorKey: "placesize_id",
      header: () => <div className="">Place Size</div>,
      cell: ({ row }) => {
        const placeSize = bannerList.find(
          (item) => item.id === Number(row.getValue("placesize_id"))
        );
        return (
          <div className="font-medium">
            {placeSize ? placeSize.width : row.getValue("placesize_id")}*
            {placeSize ? placeSize.height : row.getValue("placesize_id")}
          </div>
        );
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
              onClick={() => openBannerCodePopup(row.original)}
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

            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              title="Reports"
              onClick={() => router.push("/publisher/zonereportbydate")}
            >
              <BarChart3 className="h-4 w-4" />
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
        `https://panel.adsaro.com/publisher/api/CpmZones/?version=4&token=${mytoken}`
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
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [addedZoneData, setAddedZoneData] = useState<FormValues | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editData, setEditData] = useState<FormData | null>(null);

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
      placementSize: undefined,
      passbackAdTag: "",
      passbackUrl: "",
    },
  });

  const exportCsv = () => {
    const toCsvValue = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };

    const rows = table.getFilteredRowModel().rows.map((r) => r.original);
    const header = ["id", "name", "placesize_id", "is_active"];
    const csv = [
      header.map(toCsvValue).join(","),
      ...rows.map((r) =>
        [r.id, r.name, r.placesize_id, r.is_active].map(toCsvValue).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bannerzones.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (searchParams?.get("add") === "1") {
      openModal();
      router.replace("/publisher/bannerzones");
    }
  }, [searchParams, router]);

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

  const openEditPopup = async (mydata: FormData) => {
    console.log("mydata", mydata?.id);
    const response = await axios.get(
      `https://panel.adsaro.com/admin/api/CpmZone/${mydata?.id}?version=4&userToken=1wDtEkEz2ykyOdyx`
    );
    console.log("passback_url", response?.data?.response?.rows[mydata?.id]);
    const details = response?.data?.response?.rows?.[mydata?.id] as
      | FormData
      | undefined;
    setEditData(details ?? null);
    setIsEditModalOpen(true);
    reset({
      zoneName: details?.name || "",
      placementSize: details?.placesize_id ? Number(details.placesize_id) : undefined,
      passbackAdTag: details?.passback_tag || "",
      passbackUrl: details?.passback_url || "",
    });
  };

  const closeModal2 = () => {
    setIsEditModalOpen(false);
    reset();
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const mydata = {
      publisher_id: auth.publisherData?.id,
      passback_tag: data.passbackAdTag,
      passback_url: data.passbackUrl,
      placesize_id: Number(data.placementSize),
      name: data.zoneName,
    };

    try {
      const response = await fetch("/api/bannerzone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: mydata }),
      });

      const result = await response.json();
      const createdId = result.response.created;

      const selectedSize = bannerList.find(
        (b) => b.id === Number(data.placementSize)
      );
      if (selectedSize) {
        const { width, height } = selectedSize;

        const script = await axios.get(
          `https://panel.adsaro.com/admin/api/banner_code?type=js_ext&size=${width}x${height}&id=${createdId}&version=4&userToken=1wDtEkEz2ykyOdyx`
        );
        setScript(script.data.response.code);
      }

      fetchData();
      setAddedZoneData(data);
      setCurrentStep(2);
      reset();
    } catch (err) {
      console.error("Error submitting banner zone:", err);
    }
  };

  const openBannerCodePopup = (row: BannerZoneData) => {
    // console.log("row"	,row);
    const selectedSize = bannerList.find(
      (b) => b.id === Number(row.placesize_id)
    );
    if (selectedSize) {
      const { width, height } = selectedSize;
      axios
        .get(
          `https://panel.adsaro.com/admin/api/banner_code?type=js_ext&size=${width}x${height}&id=${row.id}&version=4&userToken=1wDtEkEz2ykyOdyx`
        )
        .then((response) => {
          setScript(response.data.response.code);
          setIsPopupOpen(true);
        });
    }
  };

  const editSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log("data44", data);
    console.log("auth.token", auth.publisherData);
    const mydata = {
      id: editData?.id,
      changedata: {
        publisher_id: auth.publisherData?.id,
        name: data.zoneName,
        passback_tag: data.passbackAdTag,
        placesize_id: Number(data.placementSize),
        passback_url: data.passbackUrl,
      },
    };

    try {
      const response = await fetch("/api/bannerzone", {
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
        <span className="text-gray-800 font-semibold">Bannerzone</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-xl font-bold text-purple-600">Banner Zone</div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-4 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between pb-2 mb-4 border-b">
              <h2 className="text-xl font-bold">
                {currentStep === 1
                  ? "Add New Banner Zone"
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

                  {/* Placement Size */}
                  <div>
                    <Label className="block mb-1 text-sm">
                      {" "}
                      Placement Size
                    </Label>

                    <select
                      id="placementSize"
                      className="w-full p-2 border rounded"
                      {...register("placementSize", {
                        required: "Placement size is required",
                      })}
                    >
                      <option value="">Select Size</option>
                      {bannerList.length > 0 ? (
                        bannerList.map((banners) => (
                          <option key={banners.id} value={banners.id}>
                            {banners.width}×{banners.height}
                          </option>
                        ))
                      ) : (
                        <option disabled>Loading...</option>
                      )}
                    </select>
                    {errors.placementSize && (
                      <p className="mt-1 text-sm text-red-500">
                        * {errors.placementSize.message}
                      </p>
                    )}
                  </div>

                  {/* Passback Ad Tag with Tooltip */}
                  <div className="relative">
                    <Label
                      htmlFor="passbackAdTag"
                      className="block mb-1 text-sm"
                    >
                      Passback Ad Tag{" "}
                      <span
                        className="text-gray-500 cursor-help"
                        onMouseEnter={() => setTooltipVisible(true)}
                        onMouseLeave={() => setTooltipVisible(false)}
                      >
                        ?
                      </span>
                    </Label>
                    {tooltipVisible && (
                      <div className="absolute z-10 p-2 mt-1 text-sm text-white bg-gray-800 rounded shadow w-72">
                        Ad Tag that will be displayed if no banners are
                        available
                      </div>
                    )}
                    <Textarea
                      id="passbackAdTag"
                      rows={3}
                      className="w-full p-2 border rounded"
                      {...register("passbackAdTag")}
                    />
                    <p className="mt-1 text-sm text-gray-600">
                      Available macros:{" "}
                      <code>
                        {`{subid}, {cachebuster}, {pub_zone}, {pub_uri}, {pub_domain}, {pub_redirect}, {pub_*}`}
                      </code>
                    </p>
                  </div>

                  {/* Passback URL */}
                  <div>
                    <Label className="block mb-1 text-sm">Passback URL</Label>
                    <input
                      id="passbackUrl"
                      type="text"
                      
                      className="w-full p-2 border rounded"
                      {...register("passbackUrl")}
                    />
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
                      {
                        bannerList.find(
                          (b) => b.id === Number(addedZoneData.placementSize)
                        )?.width
                      }
                      ×
                      {
                        bannerList.find(
                          (b) => b.id === Number(addedZoneData.placementSize)
                        )?.height
                      }
                    </p>
                    <p>
                      <strong>Passback URL:</strong> {addedZoneData.passbackUrl}
                    </p>
                  </div>

                  <div>
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
              <h2 className="text-xl font-bold">Edit Banner Zone</h2>
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
                    defaultValue={editData?.name}
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

                {/* Placement Size */}
                <div>
                  <Label className="block mb-1 text-sm"> Placement Size</Label>

                  <select
                    id="placementSize"
                    className="w-full p-2 border rounded"
                    {...register("placementSize", {
                      required: "Placement size is required",
                    })}
                  >
                    <option value="">Select Size</option>
                    {bannerList.length > 0 ? (
                      bannerList.map((banners) => (
                        <option
                          key={banners.id}
                          value={banners.id}
                         
                        >
                          {banners.width}×{banners.height}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading...</option>
                    )}
                  </select>
                  {errors.placementSize && (
                    <p className="mt-1 text-sm text-red-500">
                      * {errors.placementSize.message}
                    </p>
                  )}
                </div>

                {/* Passback Ad Tag with Tooltip */}
                <div className="relative">
                  <Label htmlFor="passbackAdTag" className="block mb-1 text-sm">
                    Passback Ad Tag{" "}
                    <span
                      className="text-gray-500 cursor-help"
                      onMouseEnter={() => setTooltipVisible(true)}
                      onMouseLeave={() => setTooltipVisible(false)}
                    >
                      ?
                    </span>
                  </Label>
                  {tooltipVisible && (
                    <div className="absolute z-10 p-2 mt-1 text-sm text-white bg-gray-800 rounded shadow w-72">
                      Ad Tag that will be displayed if no banners are available
                    </div>
                  )}

                  <Textarea
                    id="passbackAdTag"
                    rows={3}
                    defaultValue={editData?.passback_tag}
                    className="w-full p-2 border rounded"
                    {...register("passbackAdTag")}
                  />
                  <p className="mt-1 text-sm text-gray-600">
                    Available macros:{" "}
                    <code>
                      {`{subid}, {cachebuster}, {pub_zone}, {pub_uri}, {pub_domain}, {pub_redirect}, {pub_*}`}
                    </code>
                  </p>
                </div>

                {/* Passback URL */}
                <div>
                  <Label className="block mb-1 text-sm">Passback URL</Label>
                  <input
                    id="passbackUrl"
                    type="text"
                    disabled
                    defaultValue={editData?.passback_url}
                    className="w-full p-2 border rounded"
                    {...register("passbackUrl")}
                  />
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
