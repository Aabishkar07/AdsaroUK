import { NextResponse } from "next/server";

// app/api/contact/route.ts
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, subject, message } = body || {};
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const endpoint = "https://adsaro.net/api/contact";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let resp: Response;
    try {
      resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, email, subject, message }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const raw = await resp.text();
    let parsed = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {}

    if (!resp.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            (parsed && (parsed.message || parsed.error)) ||
            `Upstream error (${resp.status})`,
          errors: parsed?.errors || null,
          upstream: { status: resp.status, body: parsed ?? raw },
        },
        { status: resp.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: (parsed && parsed.message) || "Message sent successfully!",
        data: parsed ?? raw,
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const name = err instanceof Error ? err.name : "Error";
    console.error("/api/contact error:", message);
    return NextResponse.json(
      {
        success: false,
        message: name === "AbortError" ? "Request timed out" : "Server error",
        error: message,
      },
      { status: 500 }
    );
  }
}
