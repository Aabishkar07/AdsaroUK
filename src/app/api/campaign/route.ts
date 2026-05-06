import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("campaign mybody", JSON.stringify(body));
    const alldata = body?.data;
    // return false;
    const response = await fetch(
      `https://panel.adsaro.com/advertiser/api/Campaign/?version=4&token=${alldata?.token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(alldata.collectdata),
      }
    );

    const text = await response.text().catch(() => "");
    const contentType = response.headers.get("content-type") || "";

    let data: unknown = null;
    try {
      if (contentType.includes("application/json")) {
        data = text ? JSON.parse(text) : null;
      } else {
        // Upstream sometimes returns HTML error pages; don't attempt JSON.parse.
        data = { raw: text };
      }
    } catch {
      data = { raw: text };
    }

    console.log("donedata", data);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch datas" + error },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    console.log("campaign update body", JSON.stringify(body));
    const alldata = body?.data;
    
    const response = await fetch(
      `https://panel.adsaro.com/advertiser/api/Campaign/${alldata?.id}?version=4&token=${alldata?.token}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(alldata.collectdata),
      }
    );

    const text = await response.text().catch(() => "");
    const contentType = response.headers.get("content-type") || "";

    let data: unknown = null;
    try {
      if (contentType.includes("application/json")) {
        data = text ? JSON.parse(text) : null;
      } else {
        data = { raw: text };
      }
    } catch {
      data = { raw: text };
    }

    console.log("donedata", data);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch datas" + error },
      { status: 500 }
    );
  }
}