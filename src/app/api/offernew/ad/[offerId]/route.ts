export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ offerId: string }> }
) {
  try {
    const { offerId } = await ctx.params;
    console.log("offerId", offerId);
    if (!offerId) {
      return new Response(
        JSON.stringify({
          status: "ERROR",
          message: "Missing offerId in route params",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const payload = await req.json();
    // Forward JSON payload directly
    const upstreamUrl = `https://panel.adsaro.com/admin/api/OfferNew/Ad/${offerId}?userToken=1wDtEkEz2ykyOdyx`;

    const upstream = await fetch(upstreamUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await upstream.text();
    // Try to parse JSON; if not JSON, return raw text
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text } as unknown;
    }
    console.log("[OfferNew/Ad upstream] status=", upstream.status, "body=", body);

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
