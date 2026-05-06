import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const apiResponse = await fetch(
      `https://panel.adsaro.com/advertiser/api/AppList/?version=4&token=${token}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json({ error: data }, { status: apiResponse.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, ipaddresses, token } = body;
    const app_bundles = ipaddresses;
    if (!name || !ipaddresses) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // ✅ Log payload for debugging
    console.log("Received Payload:", { name, ipaddresses });

    const apiResponse = await fetch(
      `https://panel.adsaro.com/advertiser/api/AppList/?version=4&token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, app_bundles }),
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
    // const app_bundles = ipaddresses;
    console.log("body body", body);

    const response = await fetch(
      `https://panel.adsaro.com/advertiser/api/AppList/${body.id}?version=4&token=${body.token}`,
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
