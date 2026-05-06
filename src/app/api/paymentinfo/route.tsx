import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.publisher_id) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    const url =
      "https://panel.adsaro.com/admin/api/PublisherPaymentSetting/?version=4&userToken=1wDtEkEz2ykyOdyx&range=0-10";

    const apiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!apiResponse.ok) {
      return NextResponse.json({ error: "External API Error" }, { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
