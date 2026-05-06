

import React from "react";
import { useAuth } from "@/context/context";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { Chart } from "react-google-charts";
import Link from "next/link";

export function SectionCards() {
  const auth = useAuth();
  const mytoken = auth?.token;

  const formatYmd = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const toNumber = (v: unknown): number => {
    if (v === null || v === undefined || v === "") return 0;
    if (typeof v === "number") return Number.isFinite(v) ? v : 0;
    const s = String(v).trim();
    if (!s) return 0;
    const n = Number(s.replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const [loading, setLoading] = React.useState(false);
  const [zonesTotal, setZonesTotal] = React.useState<number>(0);
  const [feedsTotal, setFeedsTotal] = React.useState<number>(0);
  const [websitesTotal, setWebsitesTotal] = React.useState<number>(0);
  const [todayRevenue, setTodayRevenue] = React.useState<number>(0);
  const [avgDailyThisMonth, setAvgDailyThisMonth] = React.useState<number>(0);
  const [avgDailyLastMonth, setAvgDailyLastMonth] = React.useState<number>(0);
  
  // Month-over-month comparison for zones
  const [zonesTotalThisMonth, setZonesTotalThisMonth] = React.useState<number>(0);
  const [zonesTotalLastMonth, setZonesTotalLastMonth] = React.useState<number>(0);

  const [geoCountryRows, setGeoCountryRows] = React.useState<
    Array<{ country: string; impressions: number; clicks: number; traffic: number }>
  >([]);
  const [geoCountryLoading, setGeoCountryLoading] = React.useState(false);
  const [geoFromDate, setGeoFromDate] = React.useState<string>("");
  const [geoToDate, setGeoToDate] = React.useState<string>("");
  const [geoYearPreset, setGeoYearPreset] = React.useState<
    "this_year" | "last_year" | "this_month" | "last_month"
  >("this_year");

  type ActiveZoneRow = {
    type: "POP" | "Banner";
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date | null;
  };

  const [activeZones, setActiveZones] = React.useState<ActiveZoneRow[]>([]);

  type NotificationType = "INFO" | "WARNING" | "ERROR";

  interface NotificationRow {
    id: number;
    type: NotificationType;
    created: string;
    read: string | null;
    subject: string;
    body: string;
  }

  const [notifications, setNotifications] = React.useState<NotificationRow[]>(
    [],
  );
  const [notificationsLoading, setNotificationsLoading] = React.useState(false);
  const [notificationsError, setNotificationsError] = React.useState<
    string | null
  >(null);
  const [selectedNotification, setSelectedNotification] =
    React.useState<NotificationRow | null>(null);

  const [revenueRange, setRevenueRange] = React.useState<
    "this_month" | "last_month" | "last_year"
  >("last_month");
  const [revenueSeriesLoading, setRevenueSeriesLoading] = React.useState(false);
  const [revenueSeries, setRevenueSeries] = React.useState<
    Array<{ label: string; revenue: number }>
  >([]);

  const [formatTooltip, setFormatTooltip] = React.useState<{
    visible: boolean;
    x: number;
    y: number;
    name: "POP" | "Banner";
    value: string;
    colorClass: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    name: "POP",
    value: "0",
    colorClass: "bg-blue-600",
  });

  React.useEffect(() => {
    if (!mytoken) return;

    const now = new Date();
    const today = formatYmd(now);

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthFrom = formatYmd(thisMonthStart);
    const thisMonthTo = today;
    const daysElapsed = now.getDate();

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthFrom = formatYmd(lastMonthStart);
    const lastMonthTo = formatYmd(lastMonthEnd);
    const lastMonthDays = lastMonthEnd.getDate();

    const sumRevenueRows = (
      rowsObj: Record<string, any>,
      revenueKey: string,
    ): number => {
      const rows = Object.values(rowsObj || {});
      return rows.reduce((sum, r: any) => sum + toNumber(r?.[revenueKey]), 0);
    };

    const fetchReportRevenue = async (fromDate: string, toDate: string) => {
      const popUrl = `https://panel.adsaro.com/publisher/api/FeedReports/date?version=4&token=${mytoken}&filters=date:${fromDate}_${toDate}`;
      const displayUrl = `https://panel.adsaro.com/publisher/api/ZoneReports/date?version=4&token=${mytoken}&filters=date:${fromDate}_${toDate}`;

      const [popRes, displayRes] = await Promise.all([
        axios.get(popUrl),
        axios.get(displayUrl),
      ]);

      const popRowsObj = popRes?.data?.response?.list?.rows || {};
      const displayRowsObj = displayRes?.data?.response?.list?.rows || {};

      const popRevenue = sumRevenueRows(popRowsObj, "pub_revenue");
      const displayRevenue = sumRevenueRows(displayRowsObj, "rtb_pub_revenue");
      return popRevenue + displayRevenue;
    };

    const parseToDate = (v: unknown): Date | null => {
      if (v == null) return null;
      if (v instanceof Date) return Number.isFinite(v.getTime()) ? v : null;

      if (typeof v === "number") {
        const ms = v < 1e12 ? v * 1000 : v;
        const d = new Date(ms);
        return Number.isFinite(d.getTime()) ? d : null;
      }

      const s = String(v).trim();
      if (!s) return null;

      const m = s.match(
        /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/,
      );
      if (m) {
        const year = Number(m[1]);
        const month = Number(m[2]);
        const day = Number(m[3]);
        const hour = Number(m[4]);
        const minute = Number(m[5]);
        const second = Number(m[6]);
        if (
          Number.isFinite(year) &&
          Number.isFinite(month) &&
          Number.isFinite(day) &&
          Number.isFinite(hour) &&
          Number.isFinite(minute) &&
          Number.isFinite(second)
        ) {
          const d = new Date(year, month - 1, day, hour, minute, second);
          return Number.isFinite(d.getTime()) ? d : null;
        }
      }

      if (/^\d+$/.test(s)) {
        const n = Number(s);
        if (Number.isFinite(n)) {
          const ms = n < 1e12 ? n * 1000 : n;
          const d = new Date(ms);
          return Number.isFinite(d.getTime()) ? d : null;
        }
      }

      const d = new Date(s);
      return Number.isFinite(d.getTime()) ? d : null;
    };

    const getCreatedDate = (row: any): Date | null => {
      const candidates = [
        row?.created_at,
        row?.created,
        row?.created_on,
        row?.created_date,
        row?.timestamp,
        row?.add_date,
        row?.date_created,
      ];
      for (const c of candidates) {
        const d = parseToDate(c);
        if (d) return d;
      }
      return null;
    };

    const run = async () => {
      setLoading(true);
      try {
        const zonesUrl = `https://panel.adsaro.com/publisher/api/CpmZones/?version=5&token=${mytoken}`;
        const feedsUrl = `https://panel.adsaro.com/publisher/api/Feed/?version=5&token=${mytoken}`;
        const accountUrl = `https://panel.adsaro.com/publisher/api/Account/?version=5&token=${mytoken}`;

        const [zonesRes, feedsRes, accountRes, todayRev, thisMonthRev, lastMonthRev] =
          await Promise.all([
            axios.get(zonesUrl),
            axios.get(feedsUrl),
            axios.get(accountUrl),
            fetchReportRevenue(today, today),
            fetchReportRevenue(thisMonthFrom, thisMonthTo),
            fetchReportRevenue(lastMonthFrom, lastMonthTo),
          ]);

        setZonesTotal(toNumber(zonesRes?.data?.response?.total));
        setFeedsTotal(toNumber(feedsRes?.data?.response?.total));

        const accountRowsObj = accountRes?.data?.response?.rows || {};
        const accountRows = Object.values(accountRowsObj) as any[];
        const websitesCount = accountRows.reduce((count, r) => {
          const website = r?.website == null ? "" : String(r.website).trim();
          return website ? count + 1 : count;
        }, 0);
        setWebsitesTotal(websitesCount);

        setTodayRevenue(todayRev);

        const avgThis = daysElapsed > 0 ? thisMonthRev / daysElapsed : 0;
        const avgLast = lastMonthDays > 0 ? lastMonthRev / lastMonthDays : 0;
        setAvgDailyThisMonth(Number.isFinite(avgThis) ? avgThis : 0);
        setAvgDailyLastMonth(Number.isFinite(avgLast) ? avgLast : 0);

        const popRowsObj = feedsRes?.data?.response?.rows || {};
        const bannerRowsObj = zonesRes?.data?.response?.rows || {};

        const popRows = Object.values(popRowsObj) as any[];
        const bannerRows = Object.values(bannerRowsObj) as any[];

        // Calculate zones created this month vs last month
        let thisMonthZones = 0;
        let lastMonthZones = 0;
        
        const thisMonthStartTime = thisMonthStart.getTime();
        const lastMonthStartTime = lastMonthStart.getTime();
        const lastMonthEndTime = lastMonthEnd.getTime();
        
        for (const r of popRows) {
          const createdDate = getCreatedDate(r);
          if (createdDate) {
            const createdTime = createdDate.getTime();
            if (createdTime >= thisMonthStartTime) {
              thisMonthZones++;
            }
            if (createdTime >= lastMonthStartTime && createdTime <= lastMonthEndTime) {
              lastMonthZones++;
            }
          }
        }
        
        for (const r of bannerRows) {
          const createdDate = getCreatedDate(r);
          if (createdDate) {
            const createdTime = createdDate.getTime();
            if (createdTime >= thisMonthStartTime) {
              thisMonthZones++;
            }
            if (createdTime >= lastMonthStartTime && createdTime <= lastMonthEndTime) {
              lastMonthZones++;
            }
          }
        }
        
        setZonesTotalThisMonth(thisMonthZones);
        setZonesTotalLastMonth(lastMonthZones);

        const combinedActive: ActiveZoneRow[] = [];

        for (const r of popRows) {
          const isActive = Boolean(r?.is_active);
          if (!isActive) continue;
          combinedActive.push({
            type: "POP",
            id: r?.id == null ? "" : String(r.id),
            name: r?.description == null ? "-" : String(r.description),
            isActive,
            createdAt: getCreatedDate(r),
          });
        }

        for (const r of bannerRows) {
          const isActive = Boolean(r?.is_active);
          if (!isActive) continue;
          combinedActive.push({
            type: "Banner",
            id: r?.id == null ? "" : String(r.id),
            name: r?.name == null ? "-" : String(r.name),
            isActive,
            createdAt: getCreatedDate(r),
          });
        }

        const toIdNum = (id: string) => {
          const n = Number(id);
          return Number.isFinite(n) ? n : 0;
        };

        const sorted = [...combinedActive].sort((a, b) => {
          const at = a.createdAt?.getTime() ?? null;
          const bt = b.createdAt?.getTime() ?? null;
          if (at != null && bt != null) return bt - at;
          if (at != null && bt == null) return -1;
          if (at == null && bt != null) return 1;
          return toIdNum(b.id) - toIdNum(a.id);
        });

        setActiveZones(sorted.slice(0, 4));
      } catch (e) {
        console.error("Publisher dashboard cards fetch error:", e);
        setZonesTotal(0);
        setFeedsTotal(0);
        setWebsitesTotal(0);
        setTodayRevenue(0);
        setAvgDailyThisMonth(0);
        setAvgDailyLastMonth(0);
        setZonesTotalThisMonth(0);
        setZonesTotalLastMonth(0);
        setActiveZones([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [mytoken, auth?.publisherData?.website]);

  React.useEffect(() => {
    if (!mytoken) {
      setGeoCountryRows([]);
      setGeoFromDate("");
      setGeoToDate("");
      return;
    }

    const toNumber2 = (v: unknown): number => {
      if (v === null || v === undefined || v === "") return 0;
      if (typeof v === "number") return Number.isFinite(v) ? v : 0;
      const s = String(v).trim();
      const normalized = s.replace(/,/g, "").replace(/%/g, "");
      const n = parseFloat(normalized);
      return Number.isFinite(n) ? n : 0;
    };

    const run = async () => {
      setGeoCountryLoading(true);
      try {
        const now = new Date();
        const thisYear = now.getFullYear();

        const lastMonthStart = new Date(thisYear, now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(thisYear, now.getMonth(), 0);

        const fromDate =
          geoYearPreset === "this_month"
            ? `${thisYear}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
            : geoYearPreset === "last_month"
              ? formatYmd(lastMonthStart)
              : geoYearPreset === "this_year"
                ? `${thisYear}-01-01`
                : `${thisYear - 1}-01-01`;
        const toDate =
          geoYearPreset === "this_month"
            ? formatYmd(now)
            : geoYearPreset === "last_month"
              ? formatYmd(lastMonthEnd)
              : geoYearPreset === "this_year"
                ? formatYmd(now)
                : `${thisYear - 1}-12-31`;

        setGeoFromDate(fromDate);
        setGeoToDate(toDate);

        const popUrl = `https://panel.adsaro.com/publisher/api/FeedReports/country?version=4&token=${mytoken}&filters=date:${fromDate}_${toDate}`;
        const displayUrl = `https://panel.adsaro.com/publisher/api/ZoneReports/country?version=5&token=${mytoken}&filters=date:${fromDate}_${toDate}`;

        const [popRes, displayRes] = await Promise.all([
          axios.get(popUrl),
          axios.get(displayUrl),
        ]);

        const popRowsObj = popRes?.data?.response?.list?.rows || {};
        const displayRowsObj = displayRes?.data?.response?.list?.rows || {};

        const popRows = Object.values(popRowsObj) as any[];
        const displayRows = Object.values(displayRowsObj) as any[];

        const byCountry = new Map<
          string,
          { country: string; impressions: number; clicks: number; traffic: number }
        >();

        const add = (country: string, impressions: number, clicks: number) => {
          const traffic = impressions + clicks;
          const existing = byCountry.get(country);
          if (!existing) {
            byCountry.set(country, { country, impressions, clicks, traffic });
          } else {
            existing.impressions += impressions;
            existing.clicks += clicks;
            existing.traffic += traffic;
          }
        };

        for (const r of popRows) {
          const countryRaw = r?.country ?? r?.country_name ?? r?.country_code;
          const country =
            countryRaw == null || String(countryRaw).trim() === ""
              ? null
              : String(countryRaw).trim();
          if (!country) continue;

          const impressions = toNumber2(r?.pub_pixel_impressions);
          const clicks = toNumber2(r?.pub_clicks);
          add(country, impressions, clicks);
        }

        for (const r of displayRows) {
          const countryRaw = r?.country ?? r?.country_name ?? r?.country_code;
          const country =
            countryRaw == null || String(countryRaw).trim() === ""
              ? null
              : String(countryRaw).trim();
          if (!country) continue;

          const impressions = toNumber2(r?.rtb_pub_impressions ?? r?.rtb_pub_gross);
          const clicks = toNumber2(r?.rtb_pub_clicks);
          add(country, impressions, clicks);
        }

        const merged = Array.from(byCountry.values()).sort(
          (a, b) => b.traffic - a.traffic,
        );
        setGeoCountryRows(merged);
      } catch (e) {
        console.error("Publisher GeoChart country report fetch error:", e);
        setGeoCountryRows([]);
        setGeoFromDate("");
        setGeoToDate("");
      } finally {
        setGeoCountryLoading(false);
      }
    };

    run();
  }, [mytoken, geoYearPreset]);

  React.useEffect(() => {
    if (!mytoken) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setNotificationsLoading(true);
        setNotificationsError(null);

        const url = `https://panel.adsaro.com/publisher/api/Notifications/?version=4&token=${mytoken}`;
        const response = await axios.get(url);
        let rows = response?.data?.response?.rows;

        if (rows && typeof rows === "object" && !Array.isArray(rows)) {
          rows = Object.values(rows);
        }

        const arr = Array.isArray(rows) ? (rows as NotificationRow[]) : [];
        const sorted = [...arr].sort((a, b) =>
          String(b.created).localeCompare(String(a.created)),
        );
        setNotifications(sorted);
      } catch (e) {
        console.error("Error fetching publisher notifications:", e);
        setNotifications([]);
        setNotificationsError("Failed to load notifications");
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, [mytoken]);

  React.useEffect(() => {
    if (!mytoken) {
      setRevenueSeries([]);
      return;
    }

    const formatYmd = (d: Date): string => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const getSpendDateRange = (range: typeof revenueRange) => {
      const now = new Date();
      const thisYear = now.getFullYear();

      if (range === "this_month") {
        const from = new Date(thisYear, now.getMonth(), 1);
        return { fromDate: formatYmd(from), toDate: formatYmd(now) };
      }

      if (range === "last_month") {
        const from = new Date(thisYear, now.getMonth() - 1, 1);
        const to = new Date(thisYear, now.getMonth(), 0);
        return { fromDate: formatYmd(from), toDate: formatYmd(to) };
      }

      return {
        fromDate: `${thisYear - 1}-01-01`,
        toDate: `${thisYear - 1}-12-31`,
      };
    };

    const run = async () => {
      setRevenueSeriesLoading(true);
      try {
        const { fromDate, toDate } = getSpendDateRange(revenueRange);

        const popUrl = `https://panel.adsaro.com/publisher/api/FeedReports/date?version=4&token=${mytoken}&filters=date:${fromDate}_${toDate}`;
        const displayUrl = `https://panel.adsaro.com/publisher/api/ZoneReports/date?version=4&token=${mytoken}&filters=date:${fromDate}_${toDate}`;

        const [popRes, displayRes] = await Promise.all([
          axios.get(popUrl),
          axios.get(displayUrl),
        ]);

        const popRowsObj = popRes?.data?.response?.list?.rows || {};
        const displayRowsObj = displayRes?.data?.response?.list?.rows || {};

        const bucket = new Map<string, number>();

        const addRow = (r: any, revenueKey: string) => {
          const rawDate = r?.date;
          const dateLabel =
            rawDate == null || String(rawDate).trim() === ""
              ? null
              : String(rawDate).slice(0, 10);
          if (!dateLabel) return;

          const key =
            revenueRange === "last_year" ? dateLabel.slice(0, 7) : dateLabel;
          const rev = toNumber(r?.[revenueKey]);
          bucket.set(key, (bucket.get(key) || 0) + rev);
        };

        for (const r of Object.values(popRowsObj)) {
          addRow(r, "pub_revenue");
        }

        for (const r of Object.values(displayRowsObj)) {
          addRow(r, "rtb_pub_revenue");
        }

        const points = Array.from(bucket.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([label, revenue]) => ({
            label,
            revenue: Number.isFinite(revenue) ? revenue : 0,
          }));

        setRevenueSeries(points);
      } catch (e) {
        console.error("Publisher revenue series fetch error:", e);
        setRevenueSeries([]);
      } finally {
        setRevenueSeriesLoading(false);
      }
    };

    run();
  }, [mytoken, revenueRange]);

  const changePct = React.useMemo(() => {
    if (!avgDailyLastMonth) return 0;
    return ((avgDailyThisMonth - avgDailyLastMonth) / avgDailyLastMonth) * 100;
  }, [avgDailyThisMonth, avgDailyLastMonth]);

  const changeLabel = React.useMemo(() => {
    const n = Number.isFinite(changePct) ? changePct : 0;
    const sign = n > 0 ? "+" : "";
    return `${sign}${n.toFixed(2)}%`;
  }, [changePct]);

  const changeClass = changePct >= 0 ? "text-green-600" : "text-red-600";

  const combinedZoneFeedTotal = React.useMemo(() => {
    return toNumber(zonesTotal) + toNumber(feedsTotal);
  }, [zonesTotal, feedsTotal]);
  
  // Calculate zone comparison
  const zoneChangePct = React.useMemo(() => {
    if (!zonesTotalLastMonth) return 0;
    return ((zonesTotalThisMonth - zonesTotalLastMonth) / zonesTotalLastMonth) * 100;
  }, [zonesTotalThisMonth, zonesTotalLastMonth]);

  const zoneChangeLabel = React.useMemo(() => {
    const n = Number.isFinite(zoneChangePct) ? zoneChangePct : 0;
    const sign = n > 0 ? "+" : "";
    return `${sign}${n.toFixed(0)}%`;
  }, [zoneChangePct]);

  const zoneChangeClass = zoneChangePct >= 0 ? "text-green-600" : "text-red-600";

  const revenueChartData = React.useMemo(() => {
    const labelHeader = revenueRange === "last_year" ? "Month" : "Date";
    const header: any[] = [labelHeader, "Revenue"];
    if (!revenueSeries.length) return [header, ["-", 0]];
    return [header, ...revenueSeries.map((p) => [p.label, p.revenue])];
  }, [revenueSeries, revenueRange]);

  const revenueChartOptions = React.useMemo(() => {
    return {
      legend: { position: "none" },
      backgroundColor: "transparent",
      chartArea: { left: 60, right: 20, top: 20, bottom: 60 },
      hAxis: {
        title: revenueRange === "last_year" ? "Month" : "Date",
        textStyle: { fontSize: 11 },
      },
      vAxis: {
        title: "Revenue",
        textStyle: { fontSize: 11 },
      },
      colors: ["#2563eb"],
    } as any;
  }, [revenueRange]);

  const formatPieData = React.useMemo(() => {
    return [
      ["Format", "Count"],
      ["POP", toNumber(feedsTotal)],
      ["Banner", toNumber(zonesTotal)],
    ];
  }, [feedsTotal, zonesTotal]);

  const formatPieOptions = React.useMemo(() => {
    return {
      legend: { position: "none" },
      pieHole: 0.65,
      backgroundColor: "transparent",
      chartArea: { left: 10, top: 10, width: "95%", height: "95%" },
      slices: {
        0: { color: "#2563eb" },
        1: { color: "#f97316" },
      },
      pieSliceText: "none",
      tooltip: { text: "value" },
    } as any;
  }, []);

  const formatSegments = React.useMemo(() => {
    const pop = toNumber(feedsTotal);
    const banner = toNumber(zonesTotal);
    const total = pop + banner;
    return [
      {
        name: "POP" as const,
        value: pop,
        pct: total > 0 ? pop / total : 0,
        stroke: "#2563eb",
        colorClass: "bg-blue-600",
      },
      {
        name: "Banner" as const,
        value: banner,
        pct: total > 0 ? banner / total : 0,
        stroke: "#f97316",
        colorClass: "bg-orange-500",
      },
    ];
  }, [feedsTotal, zonesTotal]);

  const geoChartData = React.useMemo(() => {
    const header: any[] = ["Country", "Traffic"];
    if (!geoCountryRows.length) return [header, ["-", 0]];
    return [
      header,
      ...geoCountryRows.map((r) => [r.country, toNumber(r.traffic)]),
    ];
  }, [geoCountryRows]);

  const topMetrics = React.useMemo(
    () => [
      {
        title: "Zones",
        value: combinedZoneFeedTotal.toLocaleString(),
        showComparison: true,
        comparisonValue: zonesTotalThisMonth,
        comparisonLabel: zoneChangeLabel,
        comparisonClass: zoneChangeClass,
        comparisonText: `Compare to last month (${zonesTotalLastMonth})`,
      },
      {
        title: "Websites",
        value: websitesTotal.toLocaleString(),
        showComparison: false,
        comparisonValue: 0,
        comparisonLabel: "",
        comparisonClass: "",
        comparisonText: "Total websites in account",
      },
    ],
    [combinedZoneFeedTotal, websitesTotal, zonesTotalThisMonth, zonesTotalLastMonth, zoneChangeLabel, zoneChangeClass],
  );

  return (

    <div className="px-6 space-y-4 py-6">
     

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm">Loading ...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {topMetrics.map((m, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <p className="text-xs text-gray-600 font-medium mb-1">{m.title}</p>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-2xl font-semibold text-gray-900">{m.value}</h3>
                {m.showComparison && m.comparisonLabel && (
                  <span className={`text-sm font-semibold ${m.comparisonClass}`}>
                    {m.comparisonLabel}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{m.comparisonText}</p>
            </div>
          ))}

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <p className="text-xs text-gray-600 font-medium mb-1">
              Today's Revenue 
            </p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-semibold text-gray-900">
                {`$${todayRevenue.toFixed(4)}`}
              </h3>
              <span className="text-xs text-gray-500">
                {formatYmd(new Date())}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <p className="text-xs text-gray-600 font-medium mb-1">
              Avg Daily Revenue 
            </p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-semibold text-gray-900">
                {`$${avgDailyThisMonth.toFixed(4)}`}
              </h3>
              <span className={`text-sm font-semibold ${changeClass}`}>
                {changeLabel}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              vs last month avg ${avgDailyLastMonth.toFixed(4)}
            </p>
          </div>



          <div className="lg:col-span-4 flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 lg:basis-[65%]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">
                  Total Revenue
                </p>
                {/* <h3 className="text-2xl font-semibold text-gray-900">
                  {revenueRange === "this_month"
                    ? "This Month"
                    : revenueRange === "last_month"
                      ? "Last Month"
                      : "Last Year"}
                </h3> */}
              </div>

              <select
                value={revenueRange}
                onChange={(e) =>
                  setRevenueRange(
                    e.target.value as "this_month" | "last_month" | "last_year",
                  )
                }
                className="border border-gray-300 px-2 py-1.5 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="last_year">Last Year</option>
              </select>
            </div>

            {revenueSeriesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading chart...</span>
                </div>
              </div>
            ) : (
              <Chart
                chartType="ColumnChart"
                width="100%"
                height="360px"
                data={revenueChartData}
                options={revenueChartOptions}
              />
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 lg:basis-[35%]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">
                  Zones by Format
                </p>
                {/* <h3 className="text-lg font-semibold text-gray-900">
                  POP vs Banner
                </h3> */}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-none">
                  {formatTooltip.visible ? (
                    <div
                      className="absolute z-20 pointer-events-none"
                      style={{ left: formatTooltip.x, top: formatTooltip.y }}
                    >
                      <div className="bg-gray-900 text-white border border-gray-700 shadow-xl rounded-lg px-3 py-2 text-xs min-w-[120px] animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3 h-3 rounded-full ${formatTooltip.colorClass}`}
                            ></span>
                            <span className="font-medium">{formatTooltip.name}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 pl-5">
                            <span className="text-gray-400 text-[10px]">Count:</span>
                            <span className="font-bold text-sm">
                              {formatTooltip.value}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <svg
                    className="w-full h-auto"
                    viewBox="0 0 400 240"
                    onMouseLeave={() =>
                      setFormatTooltip((p) => ({ ...p, visible: false }))
                    }
                  >
                    <path
                      d="M 50 200 A 150 150 0 0 1 350 200"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="45"
                      strokeLinecap="round"
                    />

                    {(() => {
                      const circumference = Math.PI * 150;
                      let previousLength = 0;
                      return formatSegments.map((seg) => {
                        const segmentLength = circumference * (seg.pct || 0);
                        const offset = previousLength;
                        previousLength += segmentLength;

                        return (
                          <path
                            key={seg.name}
                            d="M 50 200 A 150 150 0 0 1 350 200"
                            fill="none"
                            stroke={seg.stroke}
                            strokeWidth="45"
                            strokeLinecap="round"
                            strokeDasharray={`${segmentLength} ${circumference}`}
                            strokeDashoffset={-offset}
                            className="cursor-pointer transition-all duration-300 hover:stroke-[50] hover:brightness-110"
                            onMouseEnter={(e) => {
                              const svgRect = (
                                e.currentTarget.closest("svg") as SVGElement
                              ).getBoundingClientRect();
                              setFormatTooltip({
                                visible: true,
                                x: e.clientX - svgRect.left + 10,
                                y: e.clientY - svgRect.top - 10,
                                name: seg.name,
                                value: toNumber(seg.value).toLocaleString(),
                                colorClass: seg.colorClass,
                              });
                            }}
                            onMouseMove={(e) => {
                              const svgRect = (
                                e.currentTarget.closest("svg") as SVGElement
                              ).getBoundingClientRect();
                              setFormatTooltip((prev) => ({
                                ...prev,
                                x: e.clientX - svgRect.left + 10,
                                y: e.clientY - svgRect.top - 10,
                              }));
                            }}
                          />
                        );
                      });
                    })()}
                  </svg>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-sm bg-blue-600" />
                    <span className="text-xs font-medium text-gray-700">POP</span>
                  </div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {toNumber(feedsTotal).toLocaleString()}
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-sm bg-orange-500" />
                    <span className="text-xs font-medium text-gray-700">Banner</span>
                  </div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {toNumber(zonesTotal).toLocaleString()}
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                  <div className="text-xs font-medium text-gray-700">Total</div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {(toNumber(feedsTotal) + toNumber(zonesTotal)).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          </div>


          <div className="w-full lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-600 font-medium">
                    {geoFromDate && geoToDate
                      ? `Report Range: ${geoFromDate} to ${geoToDate}`
                      : "Report Range: -"}
                  </div>
                  <select
                    value={geoYearPreset}
                    onChange={(e) =>
                      setGeoYearPreset(
                        e.target.value as
                          | "this_year"
                          | "last_year"
                          | "this_month"
                          | "last_month",
                      )
                    }
                    className="p-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="this_year">This Year</option>
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="last_year">Last Year</option>
                  </select>
                </div>
                {geoCountryLoading ? (
                  <div className="text-xs text-gray-500">Loading...</div>
                ) : null}
              </div>

              {!geoCountryLoading && geoCountryRows.length === 0 ? (
                <div className="text-sm text-gray-600 mb-2">
                  No country data found for this range.
                </div>
              ) : null}

              <div className="w-full h-[360px]">
                <Chart
                  chartType="GeoChart"
                  width="100%"
                  height="100%"
                  data={geoChartData}
                  options={{
                    legend: "none",
                    backgroundColor: "transparent",
                    datalessRegionColor: "#f3f4f6",
                    colorAxis: { colors: ["#dbeafe", "#2563eb"] },
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 h-full min-h-0">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 h-full min-h-0 flex flex-col">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex gap-2">
                  Active Zones
                </h3>
              </div>
              <div>
                <Link href="/publisher/zone">
                  <button className="text-sm text-white hover:text-slate-100 font-medium bg-[#6a6bcf] px-3 py-1.5 rounded">
                    View More
                  </button>
                </Link>
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : activeZones.length === 0 ? (
                <div className="text-sm text-gray-500">No active zones</div>
              ) : (
                activeZones.map((z) => {
                  const badgeCls =
                    z.type === "POP"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-orange-100 text-orange-700";
                  return (
                    <div
                      key={`${z.type}:${z.id}:${z.name}`}
                      className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {z.name || "-"}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Zone ID: {z.id || "-"}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${badgeCls}`}
                        >
                          {z.type}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700">
                          ACTIVE
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 h-full min-h-0 flex flex-col">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex gap-2">
                  <svg
                    className="mt-1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#000000"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
                    <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
                  </svg>
                  Notification
                </h3>
              </div>
              <div>
                <Link href="/publisher/notification">
                  <button className="text-sm text-white hover:text-slate-100 font-medium bg-[#6a6bcf] px-3 py-1.5 rounded">
                    View More
                  </button>
                </Link>
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-auto">
              {notificationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : notificationsError ? (
                <div className="text-sm text-red-600">{notificationsError}</div>
              ) : notifications.length === 0 ? (
                <div className="text-sm text-gray-500">No notifications</div>
              ) : (
                notifications.slice(0, 3).map((n) => {
                  const badgeCls =
                    n.type === "ERROR"
                      ? "bg-red-100 text-red-700"
                      : n.type === "WARNING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700";
                  const isUnread = n.read == null;
                  return (
                    <div
                      key={n.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded ${badgeCls}`}
                          >
                            {n.type}
                          </span>
                          {isUnread ? (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700">
                              NEW
                            </span>
                          ) : null}
                        </div>
                        <div className="text-sm font-medium text-gray-900 truncate mt-1">
                          {n.subject}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {n.created}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedNotification(n)}
                        className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-200 hover:bg-gray-50"
                        aria-label="View notification"
                        title="View"
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
                          className="text-gray-700"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
            </div>
          </div>
        </div>
      )}

      {selectedNotification ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedNotification(null)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-[min(720px,92vw)] max-h-[80vh] overflow-auto bg-white rounded-xl shadow-xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100">
              <div className="min-w-0">
                <div className="text-xs text-gray-500">
                  {selectedNotification.created}
                </div>
                <div className="text-base font-semibold text-gray-900 truncate">
                  {selectedNotification.subject}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-200 hover:bg-gray-50"
                aria-label="Close"
                title="Close"
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
                  className="text-gray-700"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-4">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: selectedNotification.body,
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

    </div>


  )
}
