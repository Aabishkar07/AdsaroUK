import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Extract token from query string or Authorization header
    const { searchParams } = new URL(req.url);
    const tokenFromQuery = searchParams.get("token");
    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization");
    const bearerFromHeader =
      authHeader && authHeader.toLowerCase().startsWith("bearer ")
        ? authHeader.slice(7)
        : undefined;
    const token = tokenFromQuery || bearerFromHeader;

    if (!token) {
      return NextResponse.json(
        { status: "Error", message: "Missing token for Files Service" },
        { status: 400 }
      );
    }

    // Read incoming multipart form data
    const inForm = await req.formData();
    const file = inForm.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { status: "Error", message: "Missing 'file' field" },
        { status: 400 }
      );
    }

    // Forward to external Files Service as multipart/form-data
    const outForm = new FormData();
    // Copy filename if available
    const filename = file instanceof File ? file.name : "upload";
    outForm.append("file", file, filename);

    const externalUrl = `https://panel.adsaro.com/advertiser/api/files?token=${encodeURIComponent(
      token
    )}`;
    const upstream = await fetch(externalUrl, {
      method: "POST",
      body: outForm,
      // Do NOT set Content-Type manually; let fetch set the multipart boundary
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });

    const responseText = await upstream.text();

    // Pass through status and body as-is; some services return plain text File ID
    return new Response(responseText, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") || "text/plain; charset=utf-8",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { status: "Error", message: `Files proxy failed: ${msg}` },
      { status: 500 }
    );
  }
}
