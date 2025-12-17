import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const MANAGED_HOSTING_API_URL = process.env.MANAGED_HOSTING_API_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ project_id: string }> }
) {
  try {
    const cookieStore = await cookies();

    // Forward cookies to the managed host API
    const cookieHeader = Array.from(cookieStore.getAll())
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const { project_id } = await params;

    // Get query parameters from the request
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const realTime = searchParams.get("real_time");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: "start_date and end_date are required" },
        { status: 400 }
      );
    }

    // Build the URL with query parameters
    const queryString = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      ...(realTime && { real_time: realTime }),
    }).toString();

    // Make GET request to managed host API
    const response = await fetch(
      `${MANAGED_HOSTING_API_URL}/api/v1/projects/${project_id}/usage?${queryString}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieHeader,
        },
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to fetch usage data" }));
      return NextResponse.json(
        { message: error.message || "Failed to fetch usage data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching usage data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
