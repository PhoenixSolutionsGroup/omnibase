import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ project_id: string }> }
) {
  try {
    const { project_id } = await params;
    const searchParams = request.nextUrl.searchParams;

    const service = searchParams.get("service");
    const cloudRunService = searchParams.get("cloud_run_service");
    const limit = searchParams.get("limit") || "50";
    const before = searchParams.get("before");
    const after = searchParams.get("after");

    if (!service || !cloudRunService) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const cookieHeader = Array.from(cookieStore.getAll())
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const apiUrl =
      process.env.MANAGED_HOSTING_API_URL || "http://localhost:8002";
    const url = new URL(`${apiUrl}/api/v1/projects/${project_id}/logs`);
    url.searchParams.set("service", service);
    url.searchParams.set("cloud_run_service", cloudRunService);
    url.searchParams.set("limit", limit);

    // Add cursor-based pagination parameters
    if (before) {
      url.searchParams.set("before", before);
    }
    if (after) {
      url.searchParams.set("after", after);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch logs: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in logs API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
