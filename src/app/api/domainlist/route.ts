import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // const { name, domains } = await req.json();

    const body = await req.json();
    const { name, domains, token } = body; // Extract fields
    
    // Validate required fields
    if (!name || !domains || !token) {
      return NextResponse.json({ 
        success: false, 
        data: { 
          status: "Error", 
          message: `Missing required fields: ${!name ? 'name' : ''} ${!domains ? 'domains' : ''} ${!token ? 'token' : ''}`.trim()
        } 
      }, { status: 400 });
    }

    // ✅ Log payload for debugging
    console.log("Received Payload:", { name, domains });

    const apiResponse = await fetch(
      `https://panel.adsaro.com/advertiser/api/DomainList/?version=4&token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domains }),
      }
    );

    const data = await apiResponse.json();

    console.log("External API Response:", data);

    if (!apiResponse.ok) {
      return NextResponse.json({ 
        success: false, 
        data: data || { status: "Error", message: "External API request failed" } 
      }, { status: apiResponse.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { 
        success: false, 
        data: { 
          status: "Error", 
          message: "Internal Server Error: " + (error instanceof Error ? error.message : "Unknown error") 
        } 
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    console.log("put");

    const body = await req.json();
    console.log("body body", body);

    const response = await fetch(
      `https://panel.adsaro.com/advertiser/api/DomainList/${body.id}?version=4&token=${body.token}`,
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
