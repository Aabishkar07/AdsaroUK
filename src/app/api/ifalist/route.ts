import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, ipaddresses, token } = body;
    const ifas = ipaddresses;
    if (!name || !ipaddresses) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // ✅ Log payload for debugging
    console.log("Received Payload:", { name, ipaddresses });

    const apiResponse = await fetch(
      `https://panel.adsaro.com/advertiser/api/IfaList/?version=4&token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, ifas }),
      }
    );

    const data = await apiResponse.json();

    console.log("External API Response:", data);

    if (!apiResponse.ok) {
      return NextResponse.json({ error: data }, { status: apiResponse.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    console.log("put");

    const body = await req.json();
    // const { name, id, ipaddresses, token } = body;
    // const ifas = ipaddresses;
    console.log("body body", body);

    // Try PUT with ID in URL path for updates
    const response = await fetch(
      `https://panel.adsaro.com/advertiser/api/IfaList/${body.id}?version=4&token=${body.token}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body.data),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
     console.error("Server error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}