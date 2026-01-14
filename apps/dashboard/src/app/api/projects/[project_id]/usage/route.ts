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
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json(
        { message: "start and end are required (RFC3339 format)" },
        { status: 400 }
      );
    }

    // Build the URL with query parameters
    const queryString = new URLSearchParams({
      start,
      end,
    }).toString();

    // Make GET request to managed host API usage-preview endpoint
    const response = await fetch(
      `${MANAGED_HOSTING_API_URL}/api/v1/projects/${project_id}/usage-preview?${queryString}`,
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
