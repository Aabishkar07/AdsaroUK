import { NextResponse } from "next/server";

type ZoneType = "POP" | "Banner" | "VAST";

type Body = {
  type: ZoneType;
  id: string | number;
  is_active: boolean;
  token: string;
};

  console.log("ZONE ACTIVE ROUTE HIT");


export async function PUT(req: Request) {
  console.log("ZONE ACTIVE ROUTE HIT");


  console.log("ZONE ACTIVE ROUTE HIT", req);
  try {
    const body = await req.json();
    const { type, id, is_active, token } = body;

    if (!type || id === null || id === undefined) {
      return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
    }

    if (typeof is_active !== "boolean") {
      return NextResponse.json({ error: "Missing is_active" }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const normalizedType = type.toUpperCase();

    let url: string;

    if (normalizedType === "POP") {
      url = `https://panel.adsaro.com/publisher/api/Feed/${id}?version=4&token=${token}`;
    } else if (normalizedType === "VAST") {
      url = `https://panel.adsaro.com/publisher/api/CpmVastZones/${id}?version=5&token=${token}`;
    } else {
      url = `https://panel.adsaro.com/publisher/api/CpmZones/${id}?version=5&token=${token}`;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ is_active }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Upstream request failed", status: response.status, data },
        { status: response.status }
      );
    }

    return NextResponse.json(data ?? { ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update zone active", details: String(error) },
      { status: 500 }
    );
  }
}

