export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const version = searchParams.get("version") || "4";

    if (!id || !token) {
      return new Response(
        JSON.stringify({ status: "ERROR", message: "Missing id or token" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const upstreamUrl = `https://panel.adsaro.com/advertiser/api/OfferAd/${id}?version=${version}&token=${encodeURIComponent(
      token
    )}`;

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
    return new Response(
      JSON.stringify({ status: "ERROR", message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const version = searchParams.get("version") || "4";

    if (!id || !token) {
      return new Response(
        JSON.stringify({ status: "ERROR", message: "Missing id or token" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const payload = await req.json();
    const upstreamUrl = `https://panel.adsaro.com/advertiser/api/OfferAd/${id}?version=${version}&token=${token}`;

    const upstream = await fetch(upstreamUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

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
    return new Response(
      JSON.stringify({ status: "ERROR", message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
