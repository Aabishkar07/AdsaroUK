import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("mybody",JSON.stringify(body));
       
        const response = await fetch(`https://panel.adsaro.com/admin/api/Advertiser/?version=4&userToken=1wDtEkEz2ykyOdyx`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(body.data),
        });

        const text = await response.text().catch(() => "");
        const contentType = response.headers.get("content-type") || "";

        let data: unknown = null;
        try {
            if (contentType.includes("application/json")) {
                data = text ? JSON.parse(text) : null;
            } else {
                data = { raw: text };
            }
        } catch {
            data = { raw: text };
        }

        console.log("donedata",data)
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch datas"+error}, { status: 500 });
    }
}
