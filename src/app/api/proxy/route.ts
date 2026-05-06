import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//     try {
//         const body = await req.json();
//         const {token } = body; 

       
//         const response = await fetch(`https://panel.adsaro.com/publisher/api/Campaign/?version=4&token=${token}&range=0-10`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Accept": "application/json"
//             },
//             body: JSON.stringify(body),
//         });

//         const data = await response.json();
//         return NextResponse.json(data);
//     } catch (error) {
//         return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
//     }
// }


export async function PUT(req: Request) {
    console.log("asd");
    try {
        const { data } = await req.json(); 
        // console.log("storedToken",data.token);

        const response = await fetch(`https://panel.adsaro.com/publisher/api/Account/216346?version=4&token=${data.token}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: data.name,
                email: data.email,
                website: data.website,
                website_descr:data.website_descr,
                company: data.company,
                phone: data?.phone,
                skype_id:data?.skype_id,
                address_state:data?.address_state,
                address_city:data?.address_city,
                address_zip:data?.address_zip,
                address_street:data?.address_street,
                password_current: data?.password_current,
                password_repeat: data?.password_repeat,
                password: data?.password,
            }),
        });

        const text = await response.text().catch(() => "");
        const contentType = response.headers.get("content-type") || "";

        let updatedData: any = null;
        try {
            if (contentType.includes("application/json")) {
                updatedData = text ? JSON.parse(text) : null;
            } else {
                updatedData = { raw: text };
            }
        } catch {
            updatedData = { raw: text };
        }

        if (!response.ok) {
            // Handle API validation errors
            return NextResponse.json(
                { error: updatedData?.message || updatedData?.error || "Validation error occurred", details: updatedData },
                { status: response.status }
            );
        }
        return NextResponse.json(updatedData, { status: response.status });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update data"+error }, { status: 500 });
    }
}