import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("ory_kratos_session");

    if (!sessionCookie) {
      return NextResponse.json(
        { status: 401, error: "Authentication required" },
        { status: 401 }
      );
    }

    const apiUrl =
      process.env.MANAGED_HOSTING_API_URL || "http://localhost:8003";

    const response = await fetch(`${apiUrl}/api/v1/projects/provision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in provision API route:", error);
    return NextResponse.json(
      { status: 500, error: "Internal server error" },
      { status: 500 }
    );
  }
}
