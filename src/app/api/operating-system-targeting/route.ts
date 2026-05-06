import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("🚀 OPERATING-SYSTEM-TARGETING API ROUTE CALLED");
    
    const body = await req.json();
    console.log("📥 Received request body:", JSON.stringify(body, null, 2));
    
    const alldata = body?.data;
    console.log("📊 Extracted alldata:", JSON.stringify(alldata, null, 2));
    
    const token = alldata?.token;
    console.log("🔑 Token available:", token ? "YES" : "NO");
    console.log("🔑 Token value:", token ? `${token.substring(0, 20)}...` : "NONE");
    
    const collectdata = alldata?.collectdata;
    console.log("📋 Collectdata available:", collectdata ? "YES" : "NO");
    console.log("📋 Collectdata:", JSON.stringify(collectdata, null, 2));

    if (!token) {
      console.error("❌ NO TOKEN PROVIDED");
      return NextResponse.json({ status: "Error", message: "Token is required" }, { status: 400 });
    }

    if (!collectdata) {
      console.error("❌ NO COLLECTDATA PROVIDED");
      return NextResponse.json({ status: "Error", message: "Collectdata is required" }, { status: 400 });
    }

    const url = `https://panel.adsaro.com/advertiser/api/OfferNew/?version=4&token=${token}`;
    console.log("🌐 Calling external API:", url);
    console.log("📤 Sending payload to external API:", JSON.stringify(collectdata, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(collectdata),
    });

    console.log("📥 External API response status:", response.status);
    console.log("📥 External API response headers:", Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log("📥 External API response body4:", JSON.stringify(result, null, 2));

    if (result.status === "OK") {
      console.log("✅ EXTERNAL API SUCCESS!");
    } else {
      console.error("❌ EXTERNAL API FAILED:", result.message);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ ERROR IN OPERATING-SYSTEM-TARGETING ROUTE:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ status: "Error", message: errorMessage }, { status: 500 });
  }
}
