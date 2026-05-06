export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log("🎯 Payload:", payload);

    const upstream = await fetch(
      "https://panel.adsaro.com/admin/api/OfferAd/?version=4&userToken=1wDtEkEz2ykyOdyx",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await upstream.json().catch(async () => ({ raw: await upstream.text() }));

    return new Response(JSON.stringify(data), {
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
