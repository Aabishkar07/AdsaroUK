import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("🚀 DEVICE-TARGETING API ROUTE CALLED");
    
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
    const offerId = alldata?.id;
    console.log("🎯 Offer ID for edit:", offerId ? offerId : "NONE (create/update without id)");

    if (!token) {
      console.error("❌ NO TOKEN PROVIDED");
      return NextResponse.json({ status: "Error", message: "Token is required" }, { status: 400 });
    }

    if (!collectdata) {
      console.error("❌ NO COLLECTDATA PROVIDED");
      return NextResponse.json({ status: "Error", message: "Collectdata is required" }, { status: 400 });
    }

    // If an Offer ID is provided, treat this as an edit/update call and use PUT to OfferNew/{id}
    if (offerId) {
      const putUrl = `https://panel.adsaro.com/advertiser/api/OfferNew/${offerId}?version=6&token=${token}`;
      console.log("🌐 Calling external API (PUT):", putUrl);
      console.log("📤 Sending RAW collectdata payload:", JSON.stringify(collectdata, null, 2));

      try {
        const putRes = await fetch(putUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          // Important: API expects raw collectdata at the root, not wrapped
          body: JSON.stringify(collectdata),
        });
        const putBody = await putRes.json().catch(() => ({}));
        console.log("📥 External API PUT status:", putRes.status);
        console.log("📥 External API PUT body:", JSON.stringify(putBody, null, 2));

        const ok = putBody?.response?.status === "OK" || putBody?.status === "OK";
        if (ok) {
          console.log("✅ EXTERNAL API PUT SUCCESS!");
          return NextResponse.json(putBody);
        }

        // Fallback to POST if PUT didn't return OK
        console.warn("⚠️ PUT did not return OK. Retrying with POST...");
        const postRes = await fetch(putUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          // Important: API expects raw collectdata at the root, not wrapped
          body: JSON.stringify(collectdata),
        });
        const postBody = await postRes.json().catch(() => ({}));
        console.log("📥 External API POST (fallback) status:", postRes.status);
        console.log("📥 External API POST (fallback) body:", JSON.stringify(postBody, null, 2));
        return NextResponse.json(postBody);
      } catch (err) {
        console.error("❌ ERROR DURING PUT/POST (OfferNew/{id}) UPDATE:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error during PUT/POST";
        return NextResponse.json({ status: "Error", message: errorMessage }, { status: 500 });
      }
    }

    // Default behavior: POST to OfferNew without ID (create/update pattern)
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
    console.log("📥 External API response body2:", JSON.stringify(result, null, 2));

    if (result.status === "OK") {
      console.log("✅ EXTERNAL API SUCCESS!");
    } else {
      console.error("❌ EXTERNAL API FAILED:", result.message);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ ERROR IN DEVICE-TARGETING ROUTE:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ status: "Error", message: errorMessage }, { status: 500 });
  }
}