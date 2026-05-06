"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/context/context";
import { Loader2 } from "lucide-react";
import {
  buildAdvertiserReportUrls,
  normalizeAdvertiserReportRows,
} from "@/lib/advertiser-reporting";
import axios from "axios";
import { Chart } from "react-google-charts";

type CampaignType =
  | "CPC"
  | "CPV"
  | "NATIVE"
  | "DISPLAY"
  | "PUSH"
  | "FLOATING_PUSH"
  | "CALENDAR_PUSH"
  | "VIDEO";

type ChannelDatum = {
  name: CampaignType;
  color: string;
  stroke: string;
  percentage: string;
  spend: string;
};

type DonutSegment = {
  name: CampaignType;
  stroke: string;
  dasharray: string;
  dashoffset: number;
};

type SpendPoint = {
  label: string;
  spend: number;
};

export default function AdvertiserSectionCards() {
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
    const normalized = s.replace(/,/g, "").replace(/%/g, "");
    const n = parseFloat(normalized);
    return Number.isFinite(n) ? n : 0;
  };

  const campaignTypeLabel = (t: CampaignType | string): string => {
    if (t === "CPC") return "POP";
    if (t === "DISPLAY") return "Display";
    return t;
  };

  const [data, setData] = useState<any>(null);
  const [campaignData, setCampaignData] = useState<any>(null);
  const [creativeData, setCreativeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accountLoaded, setAccountLoaded] = useState(false);
  const [spendTimeRange, setSpendTimeRange] = useState<
    "this_month" | "last_month" | "last_year"
  >("last_month");
  const [totalTraffic, setTotalTraffic] = useState(0);
  const [totalTrafficLoading, setTotalTrafficLoading] = useState(false);
  const [reportSpendData, setReportSpendData] = useState<SpendPoint[]>([]);
  const [reportSpendLoading, setReportSpendLoading] = useState(false);
  const [avgSpendThisMonth, setAvgSpendThisMonth] = useState(0);
  const [avgSpendLastMonth, setAvgSpendLastMonth] = useState(0);
  const [donutTooltip, setDonutTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    name: string;
    color: string;
    value: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    name: "",
    color: "bg-gray-300",
    value: "0.00",
  });

  const [geoCountryRows, setGeoCountryRows] = useState<
    Array<{ country: string; impressions: number; clicks: number; traffic: number }>
  >([]);
  const [geoCountryLoading, setGeoCountryLoading] = useState(false);
  const [geoFromDate, setGeoFromDate] = useState<string>("");
  const [geoToDate, setGeoToDate] = useState<string>("");
  const [geoYearPreset, setGeoYearPreset] = useState<
    "this_year" | "last_year" | "this_month" | "last_month"
  >("this_year");

  const [lineYearPreset, setLineYearPreset] = useState<
    "this_year" | "last_year" | "this_month" | "last_month"
  >("last_month");
  const [lineFromDate, setLineFromDate] = useState<string>("");
  const [lineToDate, setLineToDate] = useState<string>("");
  const [lineLoading, setLineLoading] = useState(false);
  const [lineTimeRows, setLineTimeRows] = useState<
    Array<{ bucket: string; impressions: number; clicks: number }>
  >([]);

  const getSpendDateRange = (range: typeof spendTimeRange) => {
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

  useEffect(() => {
    if (!mytoken) {
      setGeoCountryRows([]);
      return;
    }

    const toNumber = (v: unknown): number => {
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

        const urls = buildAdvertiserReportUrls({
          reportType: "All",
          groupBy: "country",
          token: mytoken,
          fromDate,
          toDate,
        });

        const results = await Promise.all(
          urls.map(async ({ url, reportType }) => {
            const res = await axios.get(url);
            const rows = normalizeAdvertiserReportRows<Record<string, unknown>>(
              res.data,
            );
            return rows.map((r) => ({ ...r, report_source: reportType }));
          }),
        );

        const allRows = results.flat() as Array<Record<string, unknown>>;
        const byCountry = new Map<
          string,
          { country: string; impressions: number; clicks: number; traffic: number }
        >();

        for (const r of allRows) {
          const countryRaw =
            (r as any)?.country ??
            (r as any)?.country_name ??
            (r as any)?.country_code;
          const country =
            countryRaw == null || String(countryRaw).trim() === ""
              ? null
              : String(countryRaw).trim();
          if (!country) continue;

          const impressions = toNumber((r as any)?.adv_impressions);
          const clicks = toNumber((r as any)?.adv_clicks);
          const traffic = impressions + clicks;

          const existing = byCountry.get(country);
          if (!existing) {
            byCountry.set(country, {
              country,
              impressions,
              clicks,
              traffic,
            });
          } else {
            existing.impressions += impressions;
            existing.clicks += clicks;
            existing.traffic += traffic;
          }
        }

        const merged = Array.from(byCountry.values()).sort(
          (a, b) => b.traffic - a.traffic,
        );
        setGeoCountryRows(merged);
      } catch (e) {
        console.error("GeoChart country report fetch error:", e);
        setGeoCountryRows([]);
        setGeoFromDate("");
        setGeoToDate("");
      } finally {
        setGeoCountryLoading(false);
      }
    };

    run();
  }, [mytoken, geoYearPreset]);

  useEffect(() => {
    if (!mytoken) {
      setLineTimeRows([]);
      setLineFromDate("");
      setLineToDate("");
      return;
    }

    const formatYmd = (d: Date): string => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const run = async () => {
      setLineLoading(true);
      try {
        const now = new Date();
        const thisYear = now.getFullYear();

        const lastMonthStart = new Date(thisYear, now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(thisYear, now.getMonth(), 0);

        const fromDate =
          lineYearPreset === "this_month"
            ? `${thisYear}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
            : lineYearPreset === "last_month"
              ? formatYmd(lastMonthStart)
            : lineYearPreset === "this_year"
              ? `${thisYear}-01-01`
              : `${thisYear - 1}-01-01`;
        const toDate =
          lineYearPreset === "this_month"
            ? formatYmd(now)
            : lineYearPreset === "last_month"
              ? formatYmd(lastMonthEnd)
            : lineYearPreset === "this_year"
              ? formatYmd(now)
              : `${thisYear - 1}-12-31`;

        setLineFromDate(fromDate);
        setLineToDate(toDate);

        const urls = buildAdvertiserReportUrls({
          reportType: "All",
          groupBy: "date",
          token: mytoken,
          fromDate,
          toDate,
        });

        const results = await Promise.all(
          urls.map(async ({ url, reportType }) => {
            const res = await axios.get(url);
            const rows = normalizeAdvertiserReportRows<Record<string, unknown>>(
              res.data,
            );
            return rows.map((r) => ({ ...r, report_source: reportType }));
          }),
        );

        const allRows = results.flat() as Array<Record<string, unknown>>;
        const byBucket = new Map<
          string,
          { bucket: string; impressions: number; clicks: number }
        >();

        for (const r of allRows) {
          const dateRaw = (r as any)?.date;
          const dateStr =
            dateRaw == null || String(dateRaw).trim() === ""
              ? null
              : String(dateRaw).slice(0, 10);
          if (!dateStr) continue;

          const bucket =
            lineYearPreset === "this_month" || lineYearPreset === "last_month"
              ? dateStr
              : dateStr.slice(0, 7);
          if (!bucket) continue;

          const impressions = toNumber((r as any)?.adv_impressions);
          const clicks = toNumber((r as any)?.adv_clicks);

          const existing = byBucket.get(bucket);
          if (!existing) {
            byBucket.set(bucket, { bucket, impressions, clicks });
          } else {
            existing.impressions += impressions;
            existing.clicks += clicks;
          }
        }

        const merged = Array.from(byBucket.values()).sort((a, b) =>
          a.bucket.localeCompare(b.bucket),
        );
        setLineTimeRows(merged);
      } catch (e) {
        console.error("LineChart monthly report fetch error:", e);
        setLineTimeRows([]);
        setLineFromDate("");
        setLineToDate("");
      } finally {
        setLineLoading(false);
      }
    };

    run();
  }, [mytoken, lineYearPreset]);

  const geoChartData = useMemo(() => {
    const header: any[] = [
      "Country",
      "Traffic",
      { role: "tooltip", type: "string" },
    ];

    if (!geoCountryRows.length) {
      return [header, ["United States", 0, "No country data for selected range"]];
    }

    return [
      header,
      ...geoCountryRows.map((r) => [
        r.country,
        r.traffic,
        `${r.country}\nImpressions: ${r.impressions.toLocaleString()}\nClicks: ${r.clicks.toLocaleString()}\nTraffic: ${r.traffic.toLocaleString()}`,
      ]),
    ];
  }, [geoCountryRows]);

  const lineChartData = useMemo(() => {
    const headerLabel = lineYearPreset === "this_month" ? "Date" : "Month";
    const header: any[] = [headerLabel, "Impressions", "Clicks"];
    if (!lineTimeRows.length) return [header, ["-", 0, 0]];
    return [
      header,
      ...lineTimeRows.map((r) => [r.bucket, r.impressions, r.clicks]),
    ];
  }, [lineTimeRows, lineYearPreset]);

  const lineChartOptions = useMemo(() => {
    return {
      title: "Traffic Trend (Monthly)",
      legend: { position: "bottom" },
      backgroundColor: "transparent",
      chartArea: { left: 60, right: 20, top: 50, bottom: 60 },
      hAxis: { title: "Time" },
      vAxis: { title: "Count" },
      series: {
        0: { color: "#2563eb" },
        1: { color: "#f97316" },
      },
    } as any;
  }, []);

  // Fetch data progressively for faster loading
  useEffect(() => {
    if (!mytoken) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    const fetchAllData = async () => {
      try {
        // Fetch account data first (most important for initial display)
        const accountPromise = fetch(
          `https://panel.adsaro.com/advertiser/api/Account?version=4&token=${mytoken}`,
          { signal: controller.signal },
        ).then((res) => res.json());

        // Start other requests in parallel but don't wait
        const campaignPromise = fetch(
          `https://panel.adsaro.com/advertiser/api/Campaign/?version=5&token=${mytoken}`,
          { signal: controller.signal },
        ).then((res) => res.json());

        const creativePromise = fetch(
          `https://panel.adsaro.com/advertiser/api/OfferNew/?version=5&token=${mytoken}`,
          { signal: controller.signal },
        ).then((res) => res.json());

        // Process account data immediately when it arrives
        const accountResult = await accountPromise;
        if (
          isActive &&
          accountResult.status === "OK" &&
          accountResult.response?.rows?.[0]
        ) {
          setData(accountResult.response.rows[0]);
          setAccountLoaded(true);
          setLoading(false); // Show UI with account data immediately
        }

        // Process campaign data when it arrives
        campaignPromise
          .then((campaignResult) => {
            if (isActive && campaignResult.status === "OK") {
              setCampaignData(campaignResult.response);
            }
          })
          .catch((err) => {
            if (isActive && err?.name !== "AbortError") {
              console.error("Campaign fetch error:", err);
            }
          });

        // Process creative data when it arrives
        creativePromise
          .then((creativeResult) => {
            if (isActive && creativeResult.status === "OK") {
              setCreativeData(creativeResult.response);
            }
          })
          .catch((err) => {
            if (isActive && err?.name !== "AbortError") {
              console.error("Creative fetch error:", err);
            }
          });
      } catch (err: any) {
        const errText = typeof err === "string" ? err : (err?.message ?? "");
        if (!isActive || controller.signal.aborted) return;
        if (err?.name === "AbortError") return;
        if (
          errText.includes("Component unmounted") ||
          errText.includes("token changed")
        )
          return;

        console.error("Error fetching data:", err);
        auth?.logout();
        if (isActive) setLoading(false);
      }
    };

    fetchAllData();

    return () => {
      isActive = false;
      controller.abort("Component unmounted or token changed");
    };
  }, [mytoken]);

  useEffect(() => {
    if (!mytoken) return;

    const formatYmd = (d: Date): string => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const daysInMonth = (year: number, monthIndex: number): number => {
      return new Date(year, monthIndex + 1, 0).getDate();
    };

    const fetchMonthSpend = async (
      from: string,
      to: string,
    ): Promise<number> => {
      const urls = buildAdvertiserReportUrls({
        reportType: "All",
        groupBy: "date",
        token: mytoken,
        fromDate: from,
        toDate: to,
      });

      const results = await Promise.all(
        urls.map(async ({ url }) => {
          const res = await fetch(url);
          const json = await res.json();
          const rows =
            normalizeAdvertiserReportRows<Record<string, unknown>>(json);
          return rows.reduce((sum, r) => {
            const raw = (r as any)?.adv_cost;
            const n =
              raw == null
                ? 0
                : typeof raw === "number"
                  ? raw
                  : parseFloat(String(raw));
            return sum + (Number.isFinite(n) ? n : 0);
          }, 0);
        }),
      );

      return results.reduce((a, b) => a + b, 0);
    };

    const run = async () => {
      try {
        const now = new Date();

        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthEnd = now; // up to today
        const thisMonthDaysElapsed = now.getDate();

        const lastMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1,
        );
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const lastMonthDays = daysInMonth(
          lastMonthStart.getFullYear(),
          lastMonthStart.getMonth(),
        );

        const [thisMonthSpend, lastMonthSpend] = await Promise.all([
          fetchMonthSpend(formatYmd(thisMonthStart), formatYmd(thisMonthEnd)),
          fetchMonthSpend(formatYmd(lastMonthStart), formatYmd(lastMonthEnd)),
        ]);

        const avgThis =
          thisMonthDaysElapsed > 0 ? thisMonthSpend / thisMonthDaysElapsed : 0;
        const avgLast = lastMonthDays > 0 ? lastMonthSpend / lastMonthDays : 0;

        setAvgSpendThisMonth(Number.isFinite(avgThis) ? avgThis : 0);
        setAvgSpendLastMonth(Number.isFinite(avgLast) ? avgLast : 0);
      } catch (e) {
        console.error("Avg Daily Spend fetch error:", e);
        setAvgSpendThisMonth(0);
        setAvgSpendLastMonth(0);
      }
    };

    run();
  }, [mytoken]);

  useEffect(() => {
    if (!mytoken) {
      setTotalTraffic(0);
      return;
    }

    const controller = new AbortController();

    const formatYmd = (d: Date): string => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const run = async () => {
      setTotalTrafficLoading(true);
      try {
        const now = new Date();
        const toDate = formatYmd(now);
        const from = new Date(now);
        from.setDate(from.getDate() - 365);
        const fromDate = formatYmd(from);

        const urls = buildAdvertiserReportUrls({
          reportType: "All",
          groupBy: "date",
          token: mytoken,
          fromDate,
          toDate,
        });

        const results = await Promise.all(
          urls.map(async ({ url }) => {
            const res = await fetch(url, { signal: controller.signal });
            const json = await res.json();
            const rows =
              normalizeAdvertiserReportRows<Record<string, unknown>>(json);
            return rows.reduce((sum, r) => {
              const impressionsRaw = (r as any)?.adv_impressions;
              const clicksRaw = (r as any)?.adv_clicks;

              const impressions = toNumber(impressionsRaw);
              const clicks = toNumber(clicksRaw);
              return sum + impressions + clicks;
            }, 0);
          }),
        );

        const total = results.reduce((a, b) => a + b, 0);
        setTotalTraffic(Number.isFinite(total) ? total : 0);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        console.error("Total Traffic fetch error:", e);
        setTotalTraffic(0);
      } finally {
        setTotalTrafficLoading(false);
      }
    };

    run();

    return () => {
      controller.abort();
    };
  }, [mytoken]);

  useEffect(() => {
    if (!mytoken) {
      setReportSpendData([]);
      return;
    }

    const controller = new AbortController();

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
      const normalized = s.replace(/,/g, "").replace(/%/g, "");
      const n = parseFloat(normalized);
      return Number.isFinite(n) ? n : 0;
    };

    const run = async () => {
      setReportSpendLoading(true);
      try {
        const { fromDate, toDate } = getSpendDateRange(spendTimeRange);

        const urls = buildAdvertiserReportUrls({
          reportType: "All",
          groupBy: "date",
          token: mytoken,
          fromDate,
          toDate,
        });

        const results = await Promise.all(
          urls.map(async ({ url }) => {
            const res = await fetch(url, { signal: controller.signal });
            const json = await res.json();
            const rows =
              normalizeAdvertiserReportRows<Record<string, unknown>>(json);
            return rows;
          }),
        );

        const allRows = results.flat();
        const bucket = new Map<string, number>();

        for (const r of allRows) {
          const rawDate = (r as any)?.date;
          const dateLabel =
            rawDate == null || String(rawDate).trim() === ""
              ? null
              : String(rawDate).slice(0, 10);
          if (!dateLabel) continue;

          const cost = toNumber((r as any)?.adv_cost);
          if (spendTimeRange === "last_year") {
            const monthLabel = dateLabel.slice(0, 7); // YYYY-MM
            bucket.set(monthLabel, (bucket.get(monthLabel) || 0) + cost);
          } else {
            bucket.set(dateLabel, (bucket.get(dateLabel) || 0) + cost);
          }
        }

        const points: SpendPoint[] = Array.from(bucket.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([label, spend]) => ({
            label,
            spend: Number.isFinite(spend) ? spend : 0,
          }));

        setReportSpendData(points);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        console.error("Report spend series fetch error:", e);
        setReportSpendData([]);
      } finally {
        setReportSpendLoading(false);
      }
    };

    run();

    return () => {
      controller.abort();
    };
  }, [mytoken, spendTimeRange]);

  // Real data from API with fallbacks
  const totalSpend = data?.total_spend || 0;
  const spendYesterday = data?.spend_yesterday || 0;
  const remainBalance = data?.remain_balance || 0;
  const balance = data?.balance || 0;

  const activeCampaignRows = useMemo(() => {
    const rows = campaignData?.rows;
    if (!rows || typeof rows !== "object") return [] as any[];
    const arr = Object.values(rows) as any[];
    return arr.filter((c) => c?.is_active === true);
  }, [campaignData]);

  // Calculate campaign and creative counts
  const totalCampaigns = campaignData?.total || 0;

  const { createdThisMonth, createdLastMonth, createdDelta } = useMemo(() => {
    const parseToDate = (v: unknown): Date | null => {
      if (v == null) return null;
      if (v instanceof Date) return Number.isFinite(v.getTime()) ? v : null;

      if (typeof v === "number") {
        // Heuristic: seconds vs milliseconds
        const ms = v < 1e12 ? v * 1000 : v;
        const d = new Date(ms);
        return Number.isFinite(d.getTime()) ? d : null;
      }

      const s = String(v).trim();
      if (!s) return null;

      // Format: "YYYY-MM-DD HH:mm:ss" (common in this API)
      // Parse manually to avoid cross-browser Date parsing issues.
      const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
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

      // numeric timestamps as strings
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

    const getCreatedDate = (campaign: any): Date | null => {
      // Try common fields seen in Adsaro APIs
      const candidates = [
        campaign?.created_at,
        campaign?.created,
        campaign?.created_on,
        campaign?.created_date,
        campaign?.timestamp,
        campaign?.add_date,
        campaign?.date_created,
      ];

      for (const c of candidates) {
        const d = parseToDate(c);
        if (d) return d;
      }
      return null;
    };

    const rows: any[] = campaignData?.rows
      ? Object.values(campaignData.rows)
      : [];

    const now = new Date();
    const thisMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
    const nextMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      0,
      0,
      0,
      0,
    );
    const lastMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
      0,
      0,
      0,
      0,
    );

    let thisMonthCount = 0;
    let lastMonthCount = 0;

    for (const campaign of rows) {
      const created = getCreatedDate(campaign);
      if (!created) continue;

      const t = created.getTime();
      if (t >= thisMonthStart.getTime() && t < nextMonthStart.getTime()) {
        thisMonthCount += 1;
      } else if (
        t >= lastMonthStart.getTime() &&
        t < thisMonthStart.getTime()
      ) {
        lastMonthCount += 1;
      }
    }

    return {
      createdThisMonth: thisMonthCount,
      createdLastMonth: lastMonthCount,
      createdDelta: thisMonthCount - lastMonthCount,
    };
  }, [campaignData]);

  const {
    approvedCreatives,
    unapprovedCreatives,
    approvedDelta,
    unapprovedDelta,
  } = useMemo(() => {
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

      const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
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

    const now = new Date();
    const thisMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
    const nextMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      0,
      0,
      0,
      0,
    );
    const lastMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
      0,
      0,
      0,
      0,
    );

    let approved = 0;
    let unapproved = 0;
    let approvedThisMonth = 0;
    let unapprovedThisMonth = 0;
    let approvedLastMonth = 0;
    let unapprovedLastMonth = 0;

    if (creativeData?.rows) {
      Object.values(creativeData.rows).forEach((offer: any) => {
        const offerTime = parseToDate(offer?.timestamp);
        const t = offerTime?.getTime();
        const inThisMonth =
          t != null &&
          t >= thisMonthStart.getTime() &&
          t < nextMonthStart.getTime();
        const inLastMonth =
          t != null &&
          t >= lastMonthStart.getTime() &&
          t < thisMonthStart.getTime();

        if (offer?.Ad?.value) {
          Object.values(offer.Ad.value).forEach((creative: any) => {
            const isApproved = creative?.approval_status === "APPROVED";

            if (isApproved) {
              approved++;
              if (inThisMonth) approvedThisMonth++;
              if (inLastMonth) approvedLastMonth++;
            } else {
              unapproved++;
              if (inThisMonth) unapprovedThisMonth++;
              if (inLastMonth) unapprovedLastMonth++;
            }
          });
        }
      });
    }

    return {
      approvedCreatives: approved,
      unapprovedCreatives: unapproved,
      approvedDelta: approvedThisMonth - approvedLastMonth,
      unapprovedDelta: unapprovedThisMonth - unapprovedLastMonth,
    };
  }, [creativeData]);

  const activeCampaigns = useMemo(() => {
    if (!campaignData?.rows) return 0;
    return Object.values(campaignData.rows).filter((c: any) => c?.is_active)
      .length;
  }, [campaignData]);

  const spendData = useMemo(() => {
    return reportSpendData;
  }, [reportSpendData]);

  const spendChartData = useMemo(() => {
    const header: any[] = ["Date", "Spend"];
    if (!spendData.length) return [header, ["-", 0]];
    return [
      header,
      ...spendData.map((d) => [String(d.label ?? "-"), Number(d.spend) || 0]),
    ];
  }, [spendData]);

  type NotificationType = "INFO" | "WARNING" | "ERROR";

  interface NotificationRow {
    id: number;
    type: NotificationType;
    created: string;
    read: string | null;
    subject: string;
    body: string;
  }

  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(
    null,
  );
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationRow | null>(null);

  const fetchNotifications = async (start?: string, end?: string) => {
    if (!mytoken) return;
    try {
      setNotificationsLoading(true);
      setNotificationsError(null);

      let url = `https://panel.adsaro.com/advertiser/api/Notifications/?version=4&token=${mytoken}`;
      if (start && end) {
        url += `&startDate=${start}&endDate=${end}`;
      }

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
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      setNotificationsError("Failed to load notifications");
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if (!mytoken) return;
    fetchNotifications();
  }, [mytoken]);

  // Calculate metrics based on real data
  const avgDailySpend = (avgSpendThisMonth || 0).toFixed(2);
  const avgDailySpendChange = useMemo(() => {
    const delta = (avgSpendThisMonth || 0) - (avgSpendLastMonth || 0);
    if (!Number.isFinite(delta)) return "";
    if (delta === 0) return "0.0%";
    const absFixed = Math.abs(delta).toFixed(2);
    return delta > 0 ? `+${absFixed}` : `-${absFixed}`;
  }, [avgSpendThisMonth, avgSpendLastMonth]);

  const createdCampaignsChange = useMemo(() => {
    if (!campaignData?.rows) return "";
    if (createdDelta === 0) return "0.0%";
    return createdDelta > 0 ? `+${createdDelta}` : `${createdDelta}`;
  }, [campaignData, createdDelta]);

  const approvedCreativesChange = useMemo(() => {
    if (!creativeData?.rows) return "";
    if (approvedDelta === 0) return "0.0%";
    return approvedDelta > 0 ? `+${approvedDelta}` : `${approvedDelta}`;
  }, [creativeData, approvedDelta]);

  const unapprovedCreativesChange = useMemo(() => {
    if (!creativeData?.rows) return "";
    if (unapprovedDelta === 0) return "0.0%";
    return unapprovedDelta > 0 ? `+${unapprovedDelta}` : `${unapprovedDelta}`;
  }, [creativeData, unapprovedDelta]);

  const topMetrics = [
    {
      title: "Created Campaigns",
      value: totalCampaigns.toString(),
      change: createdCampaignsChange,
      color: "blue",
    },
    {
      title: "Unapproved Creatives",
      value: unapprovedCreatives.toString(),
      change: unapprovedCreativesChange,
      color: "orange",
    },
    {
      title: "Approved Creatives",
      value: approvedCreatives.toString(),
      change: approvedCreativesChange,
      color: "green",
    },
    {
      title: "Avg Daily Spend",
      value: `${avgDailySpend}`,
      change: avgDailySpendChange,
      color: "purple",
    },
  ];

  const channelData: ChannelDatum[] = useMemo(() => {
    const typeConfig: Record<
      CampaignType,
      { color: string; stroke: string; spend: number }
    > = {
      CPC: { color: "bg-blue-500", stroke: "#3b82f6", spend: 0 },
      CPV: { color: "bg-indigo-500", stroke: "#6366f1", spend: 0 },
      NATIVE: { color: "bg-red-400", stroke: "#f87171", spend: 0 },
      DISPLAY: { color: "bg-sky-400", stroke: "#38bdf8", spend: 0 },
      PUSH: { color: "bg-yellow-400", stroke: "#facc15", spend: 0 },
      FLOATING_PUSH: { color: "bg-orange-400", stroke: "#fb923c", spend: 0 },
      CALENDAR_PUSH: { color: "bg-amber-500", stroke: "#f59e0b", spend: 0 },
      VIDEO: { color: "bg-cyan-400", stroke: "#22d3ee", spend: 0 },
    };

    if (campaignData?.rows) {
      Object.values(campaignData.rows).forEach((campaign: any) => {
        const type = campaign?.type as CampaignType | undefined;
        const cost = Number(campaign?.cost_total) || 0;
        if (type && typeConfig[type]) {
          typeConfig[type].spend += cost;
        }
      });
    }

    const totalCampaignSpend = Object.values(typeConfig).reduce(
      (sum, item) => sum + item.spend,
      0,
    );

    const order: CampaignType[] = [
      "CPC",
      // "CPV",
      "NATIVE",
      "DISPLAY",
      "PUSH",
      // "FLOATING_PUSH",
      // "CALENDAR_PUSH",
      "VIDEO",
    ];

    return order.map((key): ChannelDatum => {
      const item = typeConfig[key];
      const percentage =
        totalCampaignSpend > 0 ? (item.spend / totalCampaignSpend) * 100 : 0;
      return {
        name: key,
        color: item.color,
        stroke: item.stroke,
        percentage: percentage.toFixed(1),
        spend: item.spend.toFixed(2),
      };
    });
  }, [campaignData]);

  type PricingModel = "CPM" | "CPC" | "CPV";

  type PricingModelDatum = {
    name: PricingModel;
    color: string;
    percentage: string;
    spend: string;
  };

  const pricingModelData: PricingModelDatum[] = useMemo(() => {
    const modelConfig: Record<PricingModel, { color: string; spend: number }> =
      {
        CPM: { color: "bg-purple-500", spend: 0 },
        CPC: { color: "bg-blue-500", spend: 0 },
        CPV: { color: "bg-indigo-500", spend: 0 },
      };

    if (campaignData?.rows) {
      Object.values(campaignData.rows).forEach((campaign: any) => {
        const modelRaw = campaign?.pricing_model;
        const model = String(modelRaw ?? "").toUpperCase() as PricingModel;
        const cost = Number(campaign?.cost_total) || 0;

        if (model && modelConfig[model]) {
          modelConfig[model].spend += cost;
        }
      });
    }

    const totalSpendByModel = Object.values(modelConfig).reduce(
      (sum, item) => sum + item.spend,
      0,
    );

    const order: PricingModel[] = ["CPM", "CPC", "CPV"];
    return order.map((key) => {
      const item = modelConfig[key];
      const pct =
        totalSpendByModel > 0 ? (item.spend / totalSpendByModel) * 100 : 0;
      return {
        name: key,
        color: item.color,
        percentage: pct.toFixed(1),
        spend: item.spend.toFixed(2),
      };
    });
  }, [campaignData]);

  const visibleChannelData: ChannelDatum[] = useMemo(() => {
    return channelData.filter((c) => {
      const pct = Number(c.percentage) || 0;
      const spend = Number(c.spend) || 0;
      return pct > 0 && spend > 0;
    });
  }, [channelData]);

  const donutSegments: DonutSegment[] = useMemo(() => {
    const radius = 75;
    const circumference = 2 * Math.PI * radius;

    let offset = 0;
    return visibleChannelData.map((c): DonutSegment => {
      const pct = Number(c.percentage) || 0;
      const length = (pct / 100) * circumference;
      const segment = {
        name: c.name,
        stroke: c.stroke,
        dasharray: `${length} ${circumference}`,
        dashoffset: -offset,
      };
      offset += length;
      return segment;
    });
  }, [visibleChannelData]);

  const channelByName = useMemo(() => {
    return new Map(visibleChannelData.map((c) => [c.name, c] as const));
  }, [visibleChannelData]);

  const formatTraffic = (num: any) => {
    if (!Number.isFinite(num)) return "0";

    if (num >= 1_000_000) {
      return Math.round(num / 1_000_000) + "M";
    }
    if (num >= 1_000) {
      return Math.round(num / 1_000) + "K";
    }
    return Math.round(num).toString();
  };

  // Loading state - show immediately with account data
  if (loading) {
    return (
      <div className="px-8 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading ....</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="px-8 py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 space-y-4">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topMetrics.map((metric, idx) => (
          <div
            key={idx}
            className="
              bg-white rounded-md border border-gray-100 px-5 py-7
              shadow-sm
              transition-all duration-300 ease-out
              hover:-translate-y-1 hover:shadow-2xl hover:border-gray-200
              hover:scale-[1.02]
              relative overflow-hidden
            "
          >
            {/* soft hover glow */}
            <div
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none
                            bg-gradient-to-r from-red-50 via-transparent to-transparent"
            />

            <div className="relative">
              <div className="flex items-start justify-between mb-2">
                <p className="text-black text-md font-semibold tracking-wide">
                  {metric.title}
                </p>
              </div>

              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-bold text-gray-900 transition-transform duration-300 hover:scale-105">
                  {metric.value}
                </h3>

                {metric.change ? (
                  <span
                    className={`
                      text-sm font-medium mb-1 transition-colors duration-300
                      ${
                        metric.change.startsWith("+")
                          ? "text-green-500"
                          : metric.change === "0.0%"
                            ? "text-gray-400"
                            : "text-red-500"
                      }
                    `}
                  >
                    {metric.change}
                  </span>
                ) : null}
              </div>

              {metric.change ? (
                <p className="text-gray-400 text-sm mt-1">
                  Compare to last month
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-600 font-medium mb-1">Total Spend</p>
              <h3 className="text-3xl font-semibold text-gray-900">
                ${totalSpend.toFixed(3)}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Accumulated spend</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={spendTimeRange}
                onChange={(e) =>
                  setSpendTimeRange(
                    e.target.value as "this_month" | "last_month" | "last_year",
                  )
                }
              >
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="last_year">Last Year</option>
              </select>
            </div>
          </div>

          <div className="relative h-[400px]">
            {reportSpendLoading ? (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : null}
            {!reportSpendLoading && spendData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-sm text-gray-500">No data available</div>
              </div>
            ) : null}
            <div className="w-full h-full">
              <Chart
                chartType="ColumnChart"
                width="100%"
                height="100%"
                data={spendChartData}
                options={{
                  legend: { position: "none" },
                  backgroundColor: "transparent",
                  chartArea: { left: 50, right: 20, top: 10, bottom: 50 },
                  hAxis: { textStyle: { fontSize: 10, color: "#6b7280" } },
                  vAxis: { textStyle: { fontSize: 10, color: "#6b7280" } },
                  colors: ["#3b82f6"],
                }}
              />
            </div>
          </div>
        </div>

        {/* Ads by Formats - Donut Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-700 text-base font-semibold">
                Spend by Format
              </p>
            </div>
          </div>

          {/* Show loading state if campaign data not loaded yet */}
          {!campaignData ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Semi-Circle Chart */}
              <div className="flex justify-center mb-8">
                <div className="relative w-full max-w-md">
                  {/* Hover Tooltip */}
                  {donutTooltip.visible && (
                    <div
                      className="absolute z-20 pointer-events-none"
                      style={{
                        left: donutTooltip.x,
                        top: donutTooltip.y,
                      }}
                    >
                      <div className="bg-gray-900 text-white border border-gray-700 shadow-xl rounded-lg px-3 py-2 text-xs min-w-[120px] animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3 h-3 rounded-full ${donutTooltip.color}`}
                            ></span>
                            <span className="font-medium">
                              {campaignTypeLabel(donutTooltip.name)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3 pl-5">
                            <span className="text-gray-400 text-[10px]">
                              Spend:
                            </span>
                            <span className="font-bold text-sm">
                              {donutTooltip.value}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <svg
                    className="w-full h-auto"
                    viewBox="0 0 400 240"
                    onMouseLeave={() =>
                      setDonutTooltip((p) => ({ ...p, visible: false }))
                    }
                  >
                    <defs>
                      {/* Gradient definitions for each segment */}
                      <linearGradient
                        id="segment-gradient-1"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="currentColor"
                          stopOpacity="1"
                        />
                        <stop
                          offset="100%"
                          stopColor="currentColor"
                          stopOpacity="0.8"
                        />
                      </linearGradient>

                      {/* Shadow filter */}
                      <filter
                        id="semi-shadow"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                      >
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                        <feOffset dx="0" dy="2" result="offsetblur" />
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.15" />
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Background Semi-Circle */}
                    <path
                      d="M 50 200 A 150 150 0 0 1 350 200"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="45"
                      strokeLinecap="round"
                    />

                    {/* Colored Segments */}
                    {donutSegments.map((seg: DonutSegment, idx: number) => {
                      const datum = channelByName.get(seg.name);
                      // Calculate semi-circle specific values
                      const circumference = Math.PI * 150; // Half circle circumference
                      const percentage =
                        parseFloat(datum?.percentage || "0") / 100;
                      const segmentLength = circumference * percentage;

                      // Calculate offset for semi-circle positioning
                      let previousLength = 0;
                      for (let i = 0; i < idx; i++) {
                        const prevDatum = channelByName.get(
                          donutSegments[i].name,
                        );
                        previousLength +=
                          circumference *
                          (parseFloat(prevDatum?.percentage || "0") / 100);
                      }

                      return (
                        <g key={seg.name}>
                          {/* Glow effect on hover */}
                          <path
                            d="M 50 200 A 150 150 0 0 1 350 200"
                            fill="none"
                            stroke={seg.stroke}
                            strokeWidth="50"
                            strokeLinecap="round"
                            strokeDasharray={`${segmentLength} ${circumference}`}
                            strokeDashoffset={-previousLength}
                            className="opacity-0 transition-opacity duration-300 hover:opacity-30"
                            style={{ filter: "blur(6px)" }}
                          />

                          {/* Main segment - always visible with color */}
                          <path
                            d="M 50 200 A 150 150 0 0 1 350 200"
                            fill="none"
                            stroke={seg.stroke}
                            strokeWidth="45"
                            strokeLinecap="round"
                            strokeDasharray={`${segmentLength} ${circumference}`}
                            strokeDashoffset={-previousLength}
                            className="cursor-pointer transition-all duration-300 hover:stroke-[50] hover:brightness-110"
                            style={{
                              filter: "url(#semi-shadow)",
                              opacity: 1,
                            }}
                            onMouseEnter={(e) => {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              const svgRect = (
                                e.currentTarget.closest("svg") as SVGElement
                              ).getBoundingClientRect();
                              setDonutTooltip({
                                visible: true,
                                x: e.clientX - svgRect.left + 10,
                                y: e.clientY - svgRect.top - 10,
                                name: datum?.name ?? seg.name,
                                color: datum?.color ?? "bg-gray-300",
                                value: `$${datum?.spend ?? "0.00"}`,
                              });
                            }}
                            onMouseMove={(e) => {
                              const svgRect = (
                                e.currentTarget.closest("svg") as SVGElement
                              ).getBoundingClientRect();
                              setDonutTooltip((prev) => ({
                                ...prev,
                                x: e.clientX - svgRect.left + 10,
                                y: e.clientY - svgRect.top - 10,
                              }));
                            }}
                          />
                        </g>
                      );
                    })}

                    {/* Center Text */}
                    {/* <text
                      x="200"
                      y="190"
                      textAnchor="middle"
                      fontSize="32"
                      fill="#111827"
                      fontWeight="700"
                      className="animate-in fade-in duration-700"
                    >
                      ${totalSpend.toFixed(0)}
                    </text>
                    <text
                      x="200"
                      y="215"
                      textAnchor="middle"
                      fontSize="14"
                      fill="#6b7280"
                      fontWeight="500"
                      className="animate-in fade-in duration-700 delay-150"
                    >
                      Total Spend
                    </text> */}
                  </svg>
                </div>
              </div>

              {/* Legend - Enhanced with visible data */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {channelData.map((channel: ChannelDatum, idx: number) => (
                  <div
                    key={idx}
                    className="group relative flex flex-col gap-2 text-xs p-3 bg-gradient-to-br from-gray-50 to-white hover:from-white hover:to-gray-50 cursor-pointer rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105 border border-gray-100 hover:border-gray-300"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setDonutTooltip({
                        visible: true,
                        x: rect.left - rect.left + rect.width / 2,
                        y: rect.top - rect.top - 10,
                        name: channel.name,
                        color: channel.color,
                        value: `$${channel.spend}`,
                      });
                    }}
                    onMouseLeave={() =>
                      setDonutTooltip((p) => ({ ...p, visible: false }))
                    }
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-3 rounded ${channel.color} transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg`}
                      ></div>
                      <span className="text-gray-700 text-xs font-semibold group-hover:text-gray-900 transition-colors">
                        {campaignTypeLabel(channel.name)}
                      </span>
                    </div>

                    {/* Always visible data */}
                    {/* <div className="flex items-center justify-between pl-10">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-gray-900">
                          ${channel.spend}
                        </span>
                        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 group-hover:bg-gray-200 px-2 py-0.5 rounded-full inline-block w-fit transition-colors">
                          {channel.percentage}% of total
                        </span>
                      </div>
                    </div> */}
                  </div>
                ))}
              </div>

              {/* Summary stats */}
              {/* <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <p className="text-xs text-blue-600 font-medium mb-1">Active Channels</p>
                  <p className="text-2xl font-bold text-blue-900">{channelData.length}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100/50 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                  <p className="text-xs text-green-600 font-medium mb-1">Avg per Channel</p>
                  <p className="text-2xl font-bold text-green-900">
                    ${(totalSpend / Math.max(channelData.length, 1)).toFixed(0)}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                  <p className="text-xs text-purple-600 font-medium mb-1">Top Format</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {channelData.reduce((max, ch) =>
                      parseFloat(ch.spend) > parseFloat(max.spend) ? ch : max,
                      channelData[0]
                    )?.name.substring(0, 10) || "N/A"}
                  </p>
                </div>
              </div> */}
            </>
          )}
        </div>
      </div>

         {/* Format Performance Cards */}
      <div className="grid grid-cols-12 gap-4">
        {/* 50% – Format Performance */}
        <div className="col-span-12 lg:col-span-6">
          {/* Your existing Format Performance card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
             Campaign Types
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              <div className="p-5">
                <div className="flex items-start mb-2 gap-3">
                  {/* SVG Icon */}
                 

                  <div>
                    <div className="text-md text-gray-500">Total Received</div>
                    <div className="text-3xl font-bold text-gray-900 mb-3">
                      {totalTrafficLoading
                        ? "-"
    : `${formatTraffic(totalTraffic)} Traffics`}
                    </div>
                  </div>
                </div>
                {/* <div className="h-2 w-full bg-red-400 rounded-full overflow-hidden"></div> */}
              </div>

              {pricingModelData.map((model) => {
                const percentage = Number(model.percentage) || 0;

                // Default colors
                let iconColor = "stroke-gray-400";
                let barColor = "bg-gray-300";
                let bgColor = "bg-gray-300";
                let icon = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="28"
  height="28"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#000000"
  stroke-width="1.25"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M7 13v-8a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v7a1 1 0 0 0 1 1h3a4 4 0 0 1 4 4v1a2 2 0 0 0 4 0v-5h3a2 2 0 0 0 2 -2l-1 -5a2 3 0 0 0 -2 -2h-7a3 3 0 0 0 -3 3" />
</svg>`;

                // Decide colors based on percentage
                if (percentage > 0 && percentage < 10) {
                  iconColor = "stroke-red-500";
                  barColor = "bg-red-500";
                  bgColor = "bg-red-100";
                } else if (percentage >= 10 && percentage < 50) {
                  iconColor = "stroke-yellow-500";
                  barColor = "bg-yellow-500";
                  bgColor = "bg-yellow-100";
                  icon = "";
                } else if (percentage >= 50) {
                  iconColor = "stroke-green-500";
                  barColor = "bg-green-500";
                  bgColor = "bg-green-100";
                }

                return (
                  <div
                    key={model.name}
                    className="bg-white shadow-md rounded-xl p-5 border border-gray-100"
                  >
                    <div className="flex items-start mb-2 gap-3">
                      {/* SVG Icon */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center ${bgColor}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`w-6 h-6 ${iconColor}`}
                        >
                          <path d="M7 11v8a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3a4 4 0 0 0 4-4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1-2 2h-7a3 3 0 0 1-3-3" />
                        </svg>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">
                          {model.name}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-3">
                          <span className={iconColor}>
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`${barColor} h-full rounded-full transition-all duration-500`}
                        style={{
                          width: `${Math.min(Math.max(percentage, 0), 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

   <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 h-full">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex gap-2">
               
                  Active Campaign
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {!campaignData ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : activeCampaignRows.length === 0 ? (
                <div className="text-sm text-gray-500">No active campaigns</div>
              ) : (
                activeCampaignRows.slice(0, 4).map((c) => {
                  const id = c?.id;
                  const name = c?.name;
                  const budgetTotalRaw = c?.budget_total;
                  const budgetTotal =
                    budgetTotalRaw == null
                      ? null
                      : typeof budgetTotalRaw === "number"
                        ? budgetTotalRaw
                        : parseFloat(String(budgetTotalRaw));
                  return (
                    <div
                      key={id != null ? String(id) : String(name)}
                      className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {name || "-"}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Budget Total: {budgetTotal == null || Number.isNaN(budgetTotal) ? "-" : `$${budgetTotal.toLocaleString()}`}
                        </div>
                      </div>

                      <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700">
                        ACTIVE
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>


        {/* 25% – Active Campaign */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 h-full">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex gap-2">
                  <svg
                    className="mt-1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#000000"
                    stroke-width="1.25"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
                    <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
                  </svg>
                  Notification
                </h3>
              </div>
              <div className="">
                <button className="text-sm text-white hover:text-slate-100 font-medium bg-[#6a6bcf] px-3 py-1.5 rounded">
                  View More
                </button>
              </div>
            </div>

            <div className="space-y-3">
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

        {/* 25% – Logs */}
        {/* <div className="col-span-12 lg:col-span-3">
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Logs
      </h3>

        <div className="flex justify-between">
          <span className="text-gray-500">Budget updated</span>
          <span className="text-gray-400">5h ago</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Ad paused</span>
          <span className="text-gray-400">1d ago</span>
        </div>
      </div>
    </div>
  </div> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
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
              chartEvents={[
                {
                  eventName: "select",
                  callback: ({ chartWrapper }) => {
                    if (!chartWrapper) return;
                    const chart = chartWrapper.getChart();
                    const selection = chart.getSelection();
                    if (!selection?.length) return;

                    const rowIndex = selection[0]?.row;
                    if (typeof rowIndex !== "number") return;

                    const row = geoChartData[rowIndex + 1] as
                      | [string, number]
                      | undefined;
                    const region = row?.[0];
                    if (!region) return;

                    console.log("Selected : " + region);
                  },
                },
              ]}
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

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-600 font-medium">
                {lineFromDate && lineToDate
                  ? `Report Range: ${lineFromDate} to ${lineToDate}`
                  : "Report Range: -"}
              </div>
              <select
                value={lineYearPreset}
                onChange={(e) =>
                  setLineYearPreset(
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
            {lineLoading ? (
              <div className="text-xs text-gray-500">Loading...</div>
            ) : null}
          </div>
          {!lineLoading && lineTimeRows.length === 0 ? (
            <div className="text-sm text-gray-600 mb-2">
              No monthly data found for this range.
            </div>
          ) : null}
          <div className="w-full h-[360px]">
            <Chart
              chartType="LineChart"
              width="100%"
              height="100%"
              data={lineChartData}
              options={lineChartOptions}
            />
          </div>
        </div>
      </div>

      {/* Campaign and Creative Summary */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Campaign Summary
          </h3>
          {!campaignData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Campaigns</span>
                <span className="text-lg font-bold text-blue-600">
                  {totalCampaigns}
                </span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Campaigns</span>
                <span className="text-lg font-bold text-green-600">
                  {activeCampaigns}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Creative Summary
          </h3>
          {!creativeData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Approved Creatives
                </span>
                <span className="text-lg font-bold text-green-600">
                  {approvedCreatives}
                </span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Unapproved Creatives
                </span>
                <span className="text-lg font-bold text-orange-600">
                  {unapprovedCreatives}
                </span>
              </div>
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
}
