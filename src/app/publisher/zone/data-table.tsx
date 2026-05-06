"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
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
import {
  ArrowUpDown,
  BarChart3,
  FileCode,
  Pause,
  Pencil,
  Play,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

type ZoneType = "All" | "POP" | "Banner" | "VAST";

type AddType = "POP" | "Banner";

type CombinedZoneRow = {
  type: "POP" | "Banner" | "VAST";
  id: string;
  name: string;
  feedAuth: string;
  placeSizeId: string;
  isActive: boolean;
};

type BannerZoneDetails = {
  id: string;
  name: string;
  placesize_id: string;
  passback_tag?: string;
  passback_url?: string;
};

type PopCodeForm = {
  triggerValue: number;
  query: string;
  cookie: number;
  subid: string;
};

type PopEditForm = {
  zoneName: string;
};

type BannerEditForm = {
  zoneName: string;
  placementSize: number;
  passbackAdTag: string;
  passbackUrl: string;
};

type BannerSize = {
  id: number;
  width: number;
  height: number;
};

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

const toStr = (v: unknown) => (v == null ? "" : String(v));

const toCsvValue = (v: unknown) => {
  const s = toStr(v);
  return `"${s.replace(/"/g, '""')}"`;
};

export function DataTableDemo() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [zoneType, setZoneType] = React.useState<ZoneType>("All");
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState<CombinedZoneRow[]>([]);
  const [bannerList] = React.useState<BannerSize[]>(BANNER_SIZES);
  const [baselineActiveByKey, setBaselineActiveByKey] = React.useState<
    Record<string, boolean>
  >({});
  const [pendingActiveByKey, setPendingActiveByKey] = React.useState<
    Record<string, boolean>
  >({});
  const [isSavingActive, setIsSavingActive] = React.useState(false);

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [addType, setAddType] = React.useState<AddType>("POP");
  const [isCreating, setIsCreating] = React.useState(false);

  React.useEffect(() => {
    const t = searchParams?.get("addZone");
    if (t !== "POP" && t !== "Banner") return;
    setAddType(t);
    setIsAddOpen(true);
    router.replace("/publisher/zone");
  }, [router, searchParams]);

  const [popZoneName, setPopZoneName] = React.useState("");

  const [bannerZoneName, setBannerZoneName] = React.useState("");
  const [bannerPlacementSize, setBannerPlacementSize] = React.useState("");
  const [bannerPassbackTag, setBannerPassbackTag] = React.useState("");
  const [bannerPassbackUrl, setBannerPassbackUrl] = React.useState("");

  const [bannerSizeSearch, setBannerSizeSearch] = React.useState("");
  const normalized = React.useCallback((s: string) => {
    return s.toLowerCase().replace(/[×x]/g, "x").replace(/\s+/g, "");
  }, []);
  const filteredBannerSizes = React.useMemo(() => {
    const q = normalized(bannerSizeSearch);
    if (!q) return bannerList;
    return bannerList.filter((b) => {
      const w = Number(b.width);
      const h = Number(b.height);
      const a = `${w}x${h}`;
      const b2 = `${h}x${w}`;
      return a.includes(q) || b2.includes(q);
    });
  }, [bannerList, bannerSizeSearch, normalized]);

  const [isPopCodeOpen, setIsPopCodeOpen] = React.useState(false);
  const [isPopEditOpen, setIsPopEditOpen] = React.useState(false);
  const [isBannerCodeOpen, setIsBannerCodeOpen] = React.useState(false);
  const [isBannerEditOpen, setIsBannerEditOpen] = React.useState(false);

  const [popCode, setPopCode] = React.useState("");
  const [popCodeByZoneId, setPopCodeByZoneId] = React.useState<
    Record<string, string>
  >({});
  const [bannerCode, setBannerCode] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const [selectedPopRow, setSelectedPopRow] =
    React.useState<CombinedZoneRow | null>(null);
  const [selectedBannerRow, setSelectedBannerRow] =
    React.useState<CombinedZoneRow | null>(null);
  const [bannerDetails, setBannerDetails] =
    React.useState<BannerZoneDetails | null>(null);
  const [initiateType, setInitiateType] = React.useState<"click" | "interval">(
    "click",
  );

  const {
    register: registerPopCode,
    handleSubmit: handleSubmitPopCode,
    reset: resetPopCode,
    formState: { errors: popCodeErrors },
  } = useForm<PopCodeForm>({
    defaultValues: {
      triggerValue: 1,
      query: "",
      cookie: 1,
      subid: "",
    },
  });

  const {
    register: registerPopEdit,
    handleSubmit: handleSubmitPopEdit,
    reset: resetPopEdit,
    formState: { errors: popEditErrors },
  } = useForm<PopEditForm>();

  const {
    register: registerBannerEdit,
    handleSubmit: handleSubmitBannerEdit,
    reset: resetBannerEdit,
    watch: watchBannerEdit,
    setValue: setValueBannerEdit,
    formState: { errors: bannerEditErrors },
  } = useForm<BannerEditForm>();

  const auth = useAuth();
  const mytoken = auth?.token;

  const zoneKey = React.useCallback((row: CombinedZoneRow) => {
    return `${row.type}:${row.id}`;
  }, []);

  const toggleActiveLocal = React.useCallback(
    (row: CombinedZoneRow) => {
      const key = zoneKey(row);
      const nextActive = !row.isActive;
      const baseline = baselineActiveByKey[key] ?? row.isActive;

      setData((prev) =>
        prev.map((z) =>
          zoneKey(z) === key ? { ...z, isActive: nextActive } : z,
        ),
      );

      setPendingActiveByKey((prev) => {
        const next = { ...prev };
        if (nextActive === baseline) {
          delete next[key];
        } else {
          next[key] = nextActive;
        }
        return next;
      });
    },
    [baselineActiveByKey, zoneKey],
  );

  const savePendingActive = React.useCallback(async () => {
    if (!mytoken) return;
    const entries = Object.entries(pendingActiveByKey);
    if (!entries.length) return;

    setIsSavingActive(true);
    try {
      await Promise.all(
        entries.map(async ([key, desiredActive]) => {
          const [type, id] = key.split(":");

          const res = await fetch("/api/zone-active", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type,
              id,
              is_active: desiredActive,
              token: mytoken,
            }),
          });

          console.log("savePendingActive", res);
          if (!res.ok) {
            const msg = await res.text().catch(() => "");
            throw new Error(`Failed to update ${key}: ${res.status} ${msg}`);
          }
        }),
      );

      setBaselineActiveByKey((prev) => {
        const next = { ...prev };
        for (const [key, desiredActive] of entries) {
          next[key] = desiredActive;
        }
        return next;
      });
      setPendingActiveByKey({});
    } catch (e) {
      console.error("Failed to save zone active changes:", e);
    } finally {
      setIsSavingActive(false);
    }
  }, [mytoken, pendingActiveByKey]);

  const hasPendingActiveChanges = React.useMemo(() => {
    return Object.keys(pendingActiveByKey).length > 0;
  }, [pendingActiveByKey]);

  const openAdd = (t: AddType) => {
    setAddType(t);
    setIsAddOpen(true);
  };

  const resetAddForms = () => {
    setPopZoneName("");
    setBannerZoneName("");
    setBannerPlacementSize("");
    setBannerPassbackTag("");
    setBannerPassbackUrl("");
  };

  const handleCreate = async () => {
    if (!auth?.publisherData?.id) return;

    setIsCreating(true);
    try {
      if (addType === "POP") {
        const payload = {
          description: popZoneName,
          publisher_id: auth.publisherData.id,
        };

        const createRes = await fetch("/api/popzone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: payload }),
        });

        if (!createRes.ok) {
          const msg = await createRes.text().catch(() => "");
          console.error("/api/popzone create failed", {
            status: createRes.status,
            statusText: createRes.statusText,
            body: msg,
            payload,
          });
          throw new Error(`POP zone create failed: ${createRes.status} ${msg}`);
        }

        const createJson = await createRes.json().catch(() => ({}));
        const createdId = toStr(createJson?.response?.created);

        let createdRow: CombinedZoneRow | null = null;
        if (createdId) {
          try {
            const feedRes = await axios.get(
              `https://panel.adsaro.com/publisher/api/Feed/${createdId}?version=4&token=${mytoken}`,
            );
            const r = feedRes?.data?.response?.rows?.[createdId];
            createdRow = {
              type: "POP",
              id: toStr(r?.id || createdId),
              name: toStr(r?.description || popZoneName),
              feedAuth: toStr(r?.auth),
              placeSizeId: "",
              isActive: Boolean(r?.is_active ?? true),
            };
          } catch (e) {
            console.error("Failed to fetch created POP zone:", e);
          }
        }

        setIsAddOpen(false);
        resetAddForms();

        if (createdRow) {
          setData((prev) => {
            const exists = prev.some(
              (z) => z.type === "POP" && z.id === createdRow!.id,
            );
            if (exists) return prev;
            return [createdRow!, ...prev];
          });
          openPopCode(createdRow);
        } else {
          fetchData();
        }

        return;
      } else {
        if (!mytoken) {
          console.error("Missing token: cannot create banner zone");
          throw new Error("Missing token");
        }

        const payload = {
          token: mytoken,
          publisher_id: auth.publisherData.id,
          passback_tag: bannerPassbackTag,
          passback_url: bannerPassbackUrl,
          placesize_id: Number(bannerPlacementSize),
          name: bannerZoneName,
        };

        const createRes = await fetch("/api/bannerzone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: payload }),
        });

        if (!createRes.ok) {
          const msg = await createRes.text().catch(() => "");
          console.error("/api/bannerzone create failed", {
            status: createRes.status,
            statusText: createRes.statusText,
            body: msg,
            payload,
          });
          throw new Error(
            `Banner zone create failed: ${createRes.status} ${msg}`,
          );
        }

        const createJson = await createRes.json().catch(() => ({}));
        console.log("/api/bannerzone create ok", createJson);
      }

      setIsAddOpen(false);
      resetAddForms();
      fetchData();
    } catch (e) {
      console.error("Failed to create zone:", e);
    } finally {
      setIsCreating(false);
    }
  };

  const openPopCode = (row: CombinedZoneRow) => {
    setSelectedPopRow(row);
    setPopCode(popCodeByZoneId[row.id] ?? "");
    setCopied(false);
    resetPopCode({ triggerValue: 1, query: "", cookie: 1, subid: "" });
    setInitiateType("click");
    setIsPopCodeOpen(true);
  };

  const openPopEdit = (row: CombinedZoneRow) => {
    setSelectedPopRow(row);
    resetPopEdit({ zoneName: row.name });
    setIsPopEditOpen(true);
  };

  const openBannerCode = async (row: CombinedZoneRow) => {
    setSelectedBannerRow(row);
    setBannerCode("");
    setCopied(false);

    const selectedSize = bannerList.find(
      (b) => Number(b.id) === Number(row.placeSizeId),
    );
    if (!selectedSize) {
      setIsBannerCodeOpen(true);
      return;
    }

    try {
      const { width, height } = selectedSize;
      const response = await axios.get(
        `https://panel.adsaro.com/admin/api/banner_code?type=js_ext&size=${width}x${height}&id=${row.id}&version=4&userToken=1wDtEkEz2ykyOdyx`,
      );
      setBannerCode(response.data?.response?.code || "");
    } catch (e) {
      console.error("Failed to load banner code:", e);
      setBannerCode("");
    } finally {
      setIsBannerCodeOpen(true);
    }
  };

  const openBannerEdit = async (row: CombinedZoneRow) => {
    setSelectedBannerRow(row);
    setBannerDetails(null);
    setIsBannerEditOpen(true);

    try {
      const response = await axios.get(
        `https://panel.adsaro.com/admin/api/CpmZone/${row.id}?version=4&userToken=1wDtEkEz2ykyOdyx`,
      );
      const details = response?.data?.response?.rows?.[row.id] as
        | BannerZoneDetails
        | undefined;
      if (details) {
        setBannerDetails(details);
        resetBannerEdit({
          zoneName: details?.name || "",
          placementSize: Number(details?.placesize_id || 0),
          passbackAdTag: details?.passback_tag || "",
          passbackUrl: details?.passback_url || "",
        });
      }
    } catch (e) {
      console.error("Failed to load banner zone details:", e);
    }
  };

  const submitPopEdit: SubmitHandler<PopEditForm> = async (form) => {
    if (!selectedPopRow) return;
    try {
      const payload = {
        token: auth?.token,
        publisherData: auth?.publisherData,
        description: form.zoneName,
        id: selectedPopRow.id,
      };
      await fetch("/api/popzone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
      });
      setIsPopEditOpen(false);
      fetchData();
      resetPopEdit();
    } catch (e) {
      console.error("Failed to update pop zone:", e);
    }
  };

  const submitBannerEdit: SubmitHandler<BannerEditForm> = async (form) => {
    if (!selectedBannerRow) return;
    try {
      const payload = {
        token: mytoken,
        id: selectedBannerRow.id,
        changedata: {
          publisher_id: auth?.publisherData?.id,
          name: form.zoneName,
          passback_tag: form.passbackAdTag,
          placesize_id: Number(form.placementSize),
          passback_url: form.passbackUrl,
        },
      };
      await fetch("/api/bannerzone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
      });
      setIsBannerEditOpen(false);
      fetchData();
      resetBannerEdit();
    } catch (e) {
      console.error("Failed to update banner zone:", e);
    }
  };

  const submitPopCode: SubmitHandler<PopCodeForm> = async (form) => {
    if (!selectedPopRow) return;

    const scriptContent = `
        window.adk_pdisp = {
          h: '{host}',
          f: ${selectedPopRow.id},
          a: '${selectedPopRow.feedAuth}',
          ${initiateType === "click" ? "ps" : "in"}: [${form.triggerValue}],
          s: '${form.subid}',
          q: [${form.query}],
          t: ${form.cookie},
          ${initiateType === "click" ? "cin: 4," : ""}
        };
      `;

    const fullScript = `
        <script>
          ${scriptContent}
        </script>
        <script src="//static.saroadexchange.com/tabu/display.js"></script>
      `;

    setPopCode(fullScript);
    setPopCodeByZoneId((prev) => ({ ...prev, [selectedPopRow.id]: fullScript }));
  };

  const columns = React.useMemo<ColumnDef<CombinedZoneRow>[]>(() => {
    const cols: ColumnDef<CombinedZoneRow>[] = [];

    cols.push({
      accessorKey: "type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Zone Type <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-gray-800">{row.getValue("type")}</div>
      ),
    });

    cols.push(
      {
        accessorKey: "id",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Id <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium text-gray-800">{row.getValue("id")}</div>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="lowercase">{row.getValue("name")}</div>
        ),
      },
    );

    if (zoneType === "All" || zoneType === "POP") {
      cols.push({
        accessorKey: "feedAuth",
        header: () => <div className="">Feed Auth</div>,
        cell: ({ row }) => (
          <div className="font-medium text-gray-800">
            {toStr(row.getValue("feedAuth"))}
          </div>
        ),
      });
    }

    if (zoneType === "All" || zoneType === "Banner") {
      cols.push({
        accessorKey: "placeSizeId",
        header: () => <div className="">Place Size</div>,
        cell: ({ row }) => {
          const id = Number(row.getValue("placeSizeId"));
          const placeSize = bannerList.find((b) => Number(b.id) === id);
          return (
            <div className="font-medium text-gray-800">
              {placeSize
                ? `${Number(placeSize.width)}×${Number(placeSize.height)}`
                : toStr(row.getValue("placeSizeId"))}
            </div>
          );
        },
      });
    }

    cols.push({
      id: "status",
      header: () => <div className="">Status</div>,
      enableSorting: false,
      cell: ({ row }) => {
        const original = row.original as CombinedZoneRow;
        return original.isActive ? (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700">
            Active
          </span>
        ) : (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
            Inactive
          </span>
        );
      },
    });

    cols.push({
      id: "actions",
      header: () => <div className="">Action</div>,
      enableHiding: false,
      cell: ({ row }) => {
        const original = row.original as CombinedZoneRow;
        const isPop = original.type === "POP";
        const activeKey = `${original.type}:${original.id}`;
        const toggleTitle = original.isActive ? "Disable" : "Enable";

        return (
          <div className="flex items-center gap-1">
            {!isPop ? (
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                title={toggleTitle}
                disabled={isSavingActive}
                onClick={() => toggleActiveLocal(original)}
              >
                {original.isActive ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            ) : null}

            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              title="Generate Script Code"
              onClick={() =>
                isPop ? openPopCode(original) : openBannerCode(original)
              }
            >
              <FileCode className="h-4 w-4 text-yellow-500" />
            </Button>

            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              title="Edit"
              onClick={() =>
                isPop ? openPopEdit(original) : openBannerEdit(original)
              }
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {original.type === "Banner" ? (
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                title="Reports"
                onClick={() =>
                  router.push(
                    "/publisher/report?reportType=Display&groupBy=Date",
                  )
                }
              >
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </Button>
            ) : null}
          </div>
        );
      },
    });

    return cols;
  }, [zoneType, bannerList, router, isSavingActive, toggleActiveLocal]);

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

  const fetchData = React.useCallback(async () => {
    if (!mytoken) return;

    setIsLoading(true);
    try {
      const requests: Promise<any>[] = [];
      if (zoneType === "All" || zoneType === "POP") {
        requests.push(
          axios.get(
            `https://panel.adsaro.com/publisher/api/Feed/?version=4&token=${mytoken}`,
          ),
        );
      }
      if (zoneType === "All" || zoneType === "Banner") {
        requests.push(
          axios.get(
            `https://panel.adsaro.com/publisher/api/CpmZones/?version=5&token=${mytoken}`,
          ),
        );
      }

      if (zoneType === "All" || zoneType === "VAST") {
        requests.push(
          axios.get(
            `https://panel.adsaro.com/publisher/api/CpmVastZones/?version=5&token=${mytoken}`,
          ),
        );
      }

      const res = await Promise.all(requests);

      let idx = 0;
      const popRes =
        zoneType === "All" || zoneType === "POP" ? res[idx++] : null;
      const displayRes =
        zoneType === "All" || zoneType === "Banner" ? res[idx++] : null;
      const vastRes =
        zoneType === "All" || zoneType === "VAST" ? res[idx++] : null;

      const popRowsObj = popRes?.data?.response?.rows || {};
      const displayRowsObj = displayRes?.data?.response?.rows || {};
      const vastRowsObj = vastRes?.data?.response?.rows || {};

      const popRows = Object.values(popRowsObj) as any[];
      const displayRows = Object.values(displayRowsObj) as any[];
      const vastRows = Object.values(vastRowsObj) as any[];

      const combined: CombinedZoneRow[] = [];

      if (zoneType === "All" || zoneType === "POP") {
        for (const r of popRows) {
          const isActive = Boolean(r?.is_active);
          combined.push({
            type: "POP",
            id: toStr(r?.id),
            name: toStr(r?.description),
            feedAuth: toStr(r?.auth),
            placeSizeId: "",
            isActive,
          });
        }
      }

      if (zoneType === "All" || zoneType === "Banner") {
        for (const r of displayRows) {
          const sizeId = Number(r?.placesize_id);
          const isActive = Boolean(r?.is_active);
          combined.push({
            type: "Banner",
            id: toStr(r?.id),
            name: toStr(r?.name),
            feedAuth: "",
            placeSizeId: toStr(r?.placesize_id),
            isActive,
          });
        }
      }

      if (zoneType === "All" || zoneType === "VAST") {
        for (const r of vastRows) {
          const isActive = Boolean(r?.is_active);
          combined.push({
            type: "VAST",
            id: toStr(r?.id),
            name: toStr(r?.name),
            feedAuth: "",
            placeSizeId: "",
            isActive,
          });
        }
      }

      setData(combined);
      const baseline: Record<string, boolean> = {};
      for (const z of combined) {
        baseline[`${z.type}:${z.id}`] = z.isActive;
      }
      setBaselineActiveByKey(baseline);
      setPendingActiveByKey({});
    } catch (e) {
      console.error("Error fetching zones:", e);
      setData([]);
      setBaselineActiveByKey({});
      setPendingActiveByKey({});
    } finally {
      setIsLoading(false);
    }
  }, [mytoken, zoneType]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const exportCsv = React.useCallback(() => {
    const rows = table.getFilteredRowModel().rows.map((r) => r.original);
    const header = ["zone_type", "id", "name", "feed_auth", "place_size_id"];

    const csv = [
      header.map(toCsvValue).join(","),
      ...rows.map((r) =>
        [r.type, r.id, r.name, r.feedAuth, r.placeSizeId]
          .map(toCsvValue)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "zones.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [table]);

  return (
    <div className="w-full mt-14 max-sm:px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
        <nav className="flex flex-wrap items-center text-sm pl-3 text-gray-500 gap-y-1">
          <a
            href="/publisher/dashboard"
            className="hover:text-gray-700 font-medium transition-colors"
          >
            Home
          </a>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800 font-semibold">Zones</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <Input
              placeholder="Search .."
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="w-full sm:w-[260px]"
            />
          </div>

          <div className="">
            <Button
              className="ml-auto
                inline-flex items-center justify-center gap-2 h-9 px-4 w-full sm:w-auto
                text-sm font-medium text-white
                bg-[#6a6bcf] rounded-lg shadow-sm
                hover:bg-[#5a5bc4] hover:text-white hover:shadow-md hover:-translate-y-[1px]
                transition-all duration-300
              "
              variant="outline"
              onClick={exportCsv}
              disabled={isLoading}
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) resetAddForms();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {addType === "POP" ? "Add New Pop Zone" : "Add New Banner Zone"}
            </DialogTitle>
          </DialogHeader>

          {addType === "POP" ? (
            <div className="space-y-3">
              <div>
                <Label className="block mb-1 text-sm">Zone Name</Label>
                <Input
                  value={popZoneName}
                  onChange={(e) => setPopZoneName(e.target.value)}
                  placeholder="Enter zone name"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddOpen(false);
                    resetAddForms();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={isCreating || !popZoneName.trim()}
                >
                  {isCreating ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label className="block mb-1 text-sm">
                  Zone Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={bannerZoneName}
                  onChange={(e) => setBannerZoneName(e.target.value)}
                  placeholder="Enter zone name"
                />
              </div>

              <div>
                <Label className="block mb-1 text-sm">
                  Placement Size <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={bannerPlacementSize}
                  onValueChange={setBannerPlacementSize}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select placement size" />
                  </SelectTrigger>
                  <SelectContent>
                    <div
                      className="p-2"
                      onKeyDownCapture={(e) => e.stopPropagation()}
                      onPointerDownCapture={(e) => e.stopPropagation()}
                    >
                      <Input
                        value={bannerSizeSearch}
                        onChange={(e) => setBannerSizeSearch(e.target.value)}
                        placeholder="Search size (e.g. 300x250)"
                      />
                    </div>
                    {bannerList.length > 0 ? (
                      filteredBannerSizes.length > 0 ? (
                        filteredBannerSizes.map((b) => {
                          return (
                            <SelectItem key={String(b.id)} value={String(b.id)}>
                              {Number(b.width)}×{Number(b.height)}
                            </SelectItem>
                          );
                        })
                      ) : (
                        <SelectItem value="__no_matches" disabled>
                          No matches
                        </SelectItem>
                      )
                    ) : (
                      <SelectItem value="__loading" disabled>
                        Loading...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block mb-1 text-sm">Passback Tag</Label>
                <Textarea
                  value={bannerPassbackTag}
                  onChange={(e) => setBannerPassbackTag(e.target.value)}
                  placeholder="Enter passback tag"
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label className="block mb-1 text-sm">Passback Url</Label>
                <Input
                  value={bannerPassbackUrl}
                  onChange={(e) => setBannerPassbackUrl(e.target.value)}
                  placeholder="Enter passback url"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddOpen(false);
                    resetAddForms();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={
                    isCreating ||
                    !bannerZoneName.trim() ||
                    !bannerPlacementSize
                  }
                >
                  {isCreating ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="mb-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3 lg:justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-end gap-3 w-full">
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Type
              </label>
              <select
                value={zoneType}
                onChange={(e) => setZoneType(e.target.value as ZoneType)}
                className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="POP">POP</option>
                <option value="Banner">Banner</option>
                <option value="VAST">VAST</option>
              </select>
            </div>

            <button
              onClick={() => {
                setZoneType("All");
                table.getColumn("name")?.setFilterValue("");
              }}
              disabled={isLoading}
              className="h-[34px] px-3 text-sm bg-[#6a6bcf] hover:text-[#6a6bcf] rounded hover:bg-white text-white border border-[#6a6bcf] disabled:opacity-50 w-full sm:w-auto"
            >
              Clear Filters
            </button>

            <Button
              className="
                inline-flex items-center gap-2 h-9 px-4
                text-sm font-medium text-white
                bg-[#6a6bcf] rounded-lg shadow-sm
                hover:bg-[#5a5bc4] hover:shadow-md hover:-translate-y-[1px]
                transition-all duration-300
              "
              variant="outline"
              disabled={!hasPendingActiveChanges || isSavingActive}
              onClick={savePendingActive}
              title={
                hasPendingActiveChanges
                  ? "Save active/inactive changes"
                  : "No pending changes"
              }
            >
              {isSavingActive ? "Saving..." : "Save"}
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="
                inline-flex items-center gap-2 h-9 px-4
                text-sm font-medium text-white
                bg-[#6a6bcf] rounded-lg shadow-sm
                hover:bg-[#5a5bc4] hover:shadow-md hover:-translate-y-[1px]
                transition-all duration-300
              "
                >
                  Add
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openAdd("POP")}>
                  POP 
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openAdd("Banner")}>
                  Banner
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="border rounded-md bg-white overflow-x-auto">
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
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
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

      <div className="flex items-center py-4 space-x-2">
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

      <Dialog
        open={isPopCodeOpen}
        onOpenChange={(open) => {
          setIsPopCodeOpen(open);
          if (!open) {
            setSelectedPopRow(null);
            setPopCode("");
            resetPopCode({ triggerValue: 1, query: "", cookie: 1, subid: "" });
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Popup Script</DialogTitle>
          </DialogHeader>

          {popCode ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="block font-semibold">Script</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (popCode) {
                      navigator.clipboard.writeText(popCode);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                >
                  Copy
                </Button>
              </div>
              {copied ? (
                <div className="text-sm font-medium text-green-600">Copied!</div>
              ) : null}
              <div className="border bg-gray-50 max-h-60 overflow-auto rounded">
                <pre className="p-3 text-sm whitespace-pre-wrap break-words">
                  {popCode}
                </pre>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmitPopCode(submitPopCode)}
              className="space-y-3"
            >
              <div>
                <Label className="text-base font-medium mb-2 block">
                  Initiate Popup
                </Label>
                <RadioGroup
                  defaultValue="click"
                  onValueChange={(value) =>
                    setInitiateType(value as "click" | "interval")
                  }
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
                  className="w-full"
                  {...registerPopCode("triggerValue", {
                    required: "This field is required",
                    min: { value: 1, message: "Must be at least 1" },
                    valueAsNumber: true,
                  })}
                />
                {popCodeErrors.triggerValue && (
                  <p className="text-sm text-red-500 mt-1">
                    {popCodeErrors.triggerValue.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="subid"
                  className="block text-sm font-medium mb-1"
                >
                  Subid
                </Label>
                <Input
                  id="subid"
                  className="w-full"
                  {...registerPopCode("subid")}
                />
              </div>

              <div>
                <Label
                  htmlFor="cookie"
                  className="block text-sm font-medium mb-1"
                >
                  Cookie Lifetime (in hours)
                </Label>
                <Input
                  id="cookie"
                  type="number"
                  className="w-full"
                  {...registerPopCode("cookie", {
                    required: "Cookie lifetime is required",
                    valueAsNumber: true,
                  })}
                />
                {popCodeErrors.cookie && (
                  <p className="text-sm text-red-500 mt-1">
                    {popCodeErrors.cookie.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="query"
                  className="block text-sm font-medium mb-1"
                >
                  Query
                </Label>
                <Textarea
                  id="query"
                  className="w-full"
                  {...registerPopCode("query")}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit">Generate Script</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isBannerCodeOpen}
        onOpenChange={(open) => {
          setIsBannerCodeOpen(open);
          if (!open) {
            setSelectedBannerRow(null);
            setBannerCode("");
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Banner Code</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="block font-semibold">Script</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (bannerCode) {
                    navigator.clipboard.writeText(bannerCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
              >
                Copy
              </Button>
            </div>
            {copied ? (
              <div className="text-sm font-medium text-green-600">Copied!</div>
            ) : null}
            <div className="border bg-gray-50 max-h-60 overflow-auto rounded">
              <pre className="p-3 text-sm whitespace-pre-wrap break-words">
                {bannerCode || "Loading..."}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isPopEditOpen}
        onOpenChange={(open) => {
          setIsPopEditOpen(open);
          if (!open) {
            setSelectedPopRow(null);
            resetPopEdit();
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Pop Zone</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmitPopEdit(submitPopEdit)}
            className="space-y-3"
          >
            <div>
              <Label className="block mb-1 text-sm">Zone Name</Label>
              <Input
                id="zoneName"
                type="text"
                className="w-full"
                {...registerPopEdit("zoneName", {
                  required: "Zone Name is required",
                })}
              />
              {popEditErrors.zoneName && (
                <p className="mt-1 text-sm text-red-500">
                  * {popEditErrors.zoneName.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPopEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isBannerEditOpen}
        onOpenChange={(open) => {
          setIsBannerEditOpen(open);
          if (!open) {
            setSelectedBannerRow(null);
            setBannerDetails(null);
            resetBannerEdit();
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Banner Zone</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmitBannerEdit(submitBannerEdit)}
            className="space-y-3"
          >
            <div>
              <Label className="block mb-1 text-sm">
                Zone Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="zoneName"
                type="text"
                className="w-full"
                {...registerBannerEdit("zoneName", {
                  required: "Zone Name is required",
                })}
              />
              {bannerEditErrors.zoneName && (
                <p className="mt-1 text-sm text-red-500">
                  * {bannerEditErrors.zoneName.message}
                </p>
              )}
            </div>

            <div>
              <Label className="block mb-1 text-sm">
                Placement Size <span className="text-red-500">*</span>
              </Label>
              <input
                type="hidden"
                {...registerBannerEdit("placementSize", {
                  required: "Placement size is required",
                  valueAsNumber: true,
                })}
              />
              <Select
                value={
                  watchBannerEdit("placementSize")
                    ? String(watchBannerEdit("placementSize"))
                    : ""
                }
                onValueChange={(v) =>
                  setValueBannerEdit("placementSize", Number(v), {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select placement size" />
                </SelectTrigger>
                <SelectContent>
                  <div
                    className="p-2"
                    onKeyDownCapture={(e) => e.stopPropagation()}
                    onPointerDownCapture={(e) => e.stopPropagation()}
                  >
                    <Input
                      value={bannerSizeSearch}
                      onChange={(e) => setBannerSizeSearch(e.target.value)}
                      placeholder="Search size (e.g. 300x250)"
                    />
                  </div>
                  {bannerList.length > 0 ? (
                    filteredBannerSizes.length > 0 ? (
                      filteredBannerSizes.map((b) => {
                        return (
                          <SelectItem key={String(b.id)} value={String(b.id)}>
                            {Number(b.width)}×{Number(b.height)}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="__no_matches" disabled>
                        No matches
                      </SelectItem>
                    )
                  ) : (
                    <SelectItem value="__loading" disabled>
                      Loading...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {bannerEditErrors.placementSize && (
                <p className="mt-1 text-sm text-red-500">
                  * {bannerEditErrors.placementSize.message}
                </p>
              )}
            </div>

            <div>
              <Label className="block mb-1 text-sm">Passback Tag</Label>
              <Textarea
                id="passbackAdTag"
                rows={3}
                className="w-full"
                {...registerBannerEdit("passbackAdTag")}
              />
            </div>

            <div>
              <Label className="block mb-1 text-sm">Passback Url</Label>
              <Input
                id="passbackUrl"
                type="text"
                className="w-full"
                {...registerBannerEdit("passbackUrl")}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBannerEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DataTableDemo;
