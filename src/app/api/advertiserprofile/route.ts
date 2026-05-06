import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {token } = body; 

       
        const response = await fetch(`https://panel.adsaro.com/advertiser/api/Campaign/?version=4&token=${token}&range=0-10`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in POST handler:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}


export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const storedToken = body?.storedToken ?? body?.token ?? body?.data?.token;
        const data = body?.data;

        if (!storedToken) {
            return NextResponse.json(
                { status: "Error", message: "Invalid Session" },
                { status: 401 }
            );
        }

        const response = await fetch(`https://panel.adsaro.com/advertiser/api/Account/216346?version=4&token=${storedToken}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: data.name,
                email: data.email ,
                company: data.company ,
                phone: data?.phone,
                password_current: data?.password_current,
                password_repeat	: data?.password_repeat	,
                password: data?.password,
            }),
        });

        const updatedData = await response.json();
        if (!response.ok) {
            // Handle API validation errors
            return NextResponse.json(
                {
                    status: updatedData?.status ?? "Error",
                    message: updatedData?.message || "Validation error occurred",
                },
                { status: response.status }
            );
        }
        return NextResponse.json(updatedData);
    } catch (error) {
        console.error("Error in PUT handler:", error);
        return NextResponse.json({ error: "Failed to update data" }, { status: 500 });
    }
}