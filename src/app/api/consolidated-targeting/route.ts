import { NextResponse } from "next/server";

type DayTime = Record<string, boolean>;
type CollectData = Record<string, unknown> & { day_time?: DayTime };

export async function POST(req: Request) {
  try {
    console.log("🚀 CONSOLIDATED-TARGETING API ROUTE CALLED");

    const body = await req.json();
    console.log("📥 Received request body:", JSON.stringify(body, null, 2));

    const alldata = body?.data;
    console.log("📊 Extracted alldata:", JSON.stringify(alldata, null, 2));

    const token = alldata?.token;
    console.log("🔑 Token available:", token ? "YES" : "NO");
    console.log("🔑 Token value:", token ? `${token.substring(0, 20)}...` : "NONE");

    const collectdata = (alldata?.collectdata ?? {}) as CollectData;
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

         // Log what targeting types are included
     if (collectdata.Location) {
       console.log("📍 Location targeting included:", collectdata.Location);
     }
     if (collectdata.OpsysNew) {
       console.log("💻 Operating system targeting included:", collectdata.OpsysNew);
     }
     if (collectdata.device_types || collectdata.device_brands || collectdata.carriers) {
       console.log("📱 Device targeting included:", {
         device_types: collectdata.device_types,
         device_brands: collectdata.device_brands,
         carriers: collectdata.carriers
       });
     }
     if (collectdata.BrowserNew) {
       console.log("🌐 Browser targeting included:", collectdata.BrowserNew);
     }
     if (collectdata.day_time) {
       console.log("🕐 Time targeting included:", collectdata.day_time);
     }

    // Safety: Remove empty day_time if present
    try {
      const dt: DayTime | undefined = collectdata.day_time;
      if (dt && Object.keys(dt).length === 0) {
        console.warn("⚠️ Removing empty day_time before calling external API");
        delete collectdata.day_time;
      }
    } catch (e) {
      console.warn("⚠️ Could not sanitize day_time in API route:", e);
    }

    const url = `https://panel.adsaro.com/advertiser/api/OfferNew/?version=4&token=${token}`;
    console.log("🌐 Calling external API:", url);
    console.log("📤 Sending consolidated payload to external API:", JSON.stringify(collectdata, null, 2));

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
    console.log("📥 External API response body1:", JSON.stringify(result, null, 2));

    if (result.status === "OK") {
      console.log("✅ EXTERNAL API SUCCESS!");
      console.log("🎉 All targeting types successfully applied in single offer!");
    } else {
      console.error("❌ EXTERNAL API FAILED:", result.message);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ ERROR IN CONSOLIDATED-TARGETING ROUTE:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ status: "Error", message: errorMessage }, { status: 500 });
  }
}
