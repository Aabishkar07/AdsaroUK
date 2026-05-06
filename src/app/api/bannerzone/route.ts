import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("mybody", JSON.stringify(body));

    const token = body?.data?.token;
    if (!token) {
      return NextResponse.json(
        { error: "Missing token" },
        { status: 400 }
      );
    }

    const forwarded = { ...(body?.data ?? {}) };
    delete (forwarded as any).token;

    const response = await fetch(
      `https://panel.adsaro.com/admin/api/CpmZone/?version=4&userToken=1wDtEkEz2ykyOdyx`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(forwarded),
      }
    );

    const text = await response.text().catch(() => "");
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }
    console.log("donedata", data);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch datas" + error },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const editid = body.data.id;
    const editData = body.data.changedata;
    console.log("editid", editid);
    console.log("editData", editData);

    const forwarded = { ...(editData ?? {}) };
    delete (forwarded as any).token;

    const response = await fetch(
      `https://panel.adsaro.com/admin/api/CpmZone/${editid}?version=4&userToken=1wDtEkEz2ykyOdyx`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(forwarded),
      }
    );

    const text = await response.text().catch(() => "");
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }
    console.log("donedata", data);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch datas" + error },
      { status: 500 }
    );
  }
}
