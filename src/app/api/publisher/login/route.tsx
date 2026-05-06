import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, password, captcha } = body;

        console.log("Publisher login attempt:", { username, captcha: captcha ? "provided" : "missing" });

        // Validate required fields
        if (!username || !password) {
            return NextResponse.json(
                { 
                    status: "Error",
                    errors: { 
                        globalErrors: "Username and password are required" 
                    }
                },
                { status: 400 }
            );
        }

        if (!captcha) {
            return NextResponse.json(
                { 
                    status: "Error",
                    errors: { 
                        globalErrors: "Please complete the CAPTCHA verification" 
                    }
                },
                { status: 400 }
            );
        }

        // Forward request to external panel API
        const response = await fetch(
            `https://panel.adsaro.com/publisher/login_service?action=login&login=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&captcha=${captcha}`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        const data = await response.json();

        console.log("Publisher login response:", data);

        // Return the response from the panel API
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Publisher login API error:", error);
        return NextResponse.json(
            { 
                status: "Error",
                errors: { 
                    globalErrors: "Internal server error. Please try again later." 
                }
            },
            { status: 500 }
        );
    }
}
