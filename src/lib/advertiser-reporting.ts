export type AdvertiserReportType = "XML" | "Display" | "All";
export type AdvertiserReportGroupBy = "date" | "country" | "campaign";

export function buildAdvertiserReportUrl(params: {
  reportType: Exclude<AdvertiserReportType, "All">;
  groupBy: AdvertiserReportGroupBy;
  token: string;
  fromDate: string;
  toDate: string;
}): string {
  const { reportType, groupBy, token, fromDate, toDate } = params;

  const base =
    reportType === "XML" ? "AdvertiserReports" : "CpmAdvertiserReports";

  const safeFrom = encodeURIComponent(fromDate);
  const safeTo = encodeURIComponent(toDate);

  return `https://panel.adsaro.com/advertiser/api/${base}/${groupBy}?version=4&token=${encodeURIComponent(
    token
  )}&filters=date:${safeFrom}_${safeTo}`;
}

export function buildAdvertiserReportUrls(params: {
  reportType: AdvertiserReportType;
  groupBy: AdvertiserReportGroupBy;
  token: string;
  fromDate: string;
  toDate: string;
}): { reportType: Exclude<AdvertiserReportType, "All">; url: string }[] {
  const { reportType, groupBy, token, fromDate, toDate } = params;

  if (reportType === "All") {
    return [
      {
        reportType: "XML",
        url: buildAdvertiserReportUrl({
          reportType: "XML",
          groupBy,
          token,
          fromDate,
          toDate,
        }),
      },
      {
        reportType: "Display",
        url: buildAdvertiserReportUrl({
          reportType: "Display",
          groupBy,
          token,
          fromDate,
          toDate,
        }),
      },
    ];
  }

  return [
    {
      reportType,
      url: buildAdvertiserReportUrl({
        reportType,
        groupBy,
        token,
        fromDate,
        toDate,
      }),
    },
  ];
}

type AnyRecord = Record<string, unknown>;

function isRecord(v: unknown): v is AnyRecord {
  return typeof v === "object" && v !== null;
}

export function normalizeAdvertiserReportRows<T = AnyRecord>(
  apiResponse: unknown
): T[] {
  if (!isRecord(apiResponse)) return [];

  const response = apiResponse["response"];
  if (!isRecord(response)) return [];

  const list = response["list"];
  if (isRecord(list)) {
    const listRows = list["rows"];
    if (isRecord(listRows)) {
      return Object.values(listRows).filter(isRecord) as unknown as T[];
    }

    const listTotal = list["total"];
    if (isRecord(listTotal)) {
      return [listTotal] as unknown as T[];
    }
  }

  const rows = response["rows"];
  if (isRecord(rows)) {
    return Object.values(rows).filter(isRecord) as unknown as T[];
  }

  const total = response["total"];
  if (isRecord(total)) {
    return [total] as unknown as T[];
  }

  const countries = response["countries"];
  if (Array.isArray(countries)) {
    return countries.filter(isRecord) as unknown as T[];
  }

  const campaigns = response["campaigns"];
  if (Array.isArray(campaigns)) {
    return campaigns.filter(isRecord) as unknown as T[];
  }

  return [];
}
