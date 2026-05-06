export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const version = searchParams.get("version") || "5";

    if (!token) {
      return new Response(JSON.stringify({ status: "ERROR", message: "Missing token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const upstreamUrl = `https://panel.adsaro.com/advertiser/api/OfferNew/?version=${encodeURIComponent(
      version
    )}&token=${encodeURIComponent(token)}`;

    const upstream = await fetch(upstreamUrl, { method: "GET" });
    const text = await upstream.text();

    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text } as unknown;
    }

    return new Response(JSON.stringify(body), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Proxy error";
    return new Response(JSON.stringify({ status: "ERROR", message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
