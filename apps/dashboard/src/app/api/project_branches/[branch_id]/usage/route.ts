import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const MANAGED_HOSTING_API_URL = process.env.MANAGED_HOSTING_API_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ branch_id: string }> }
) {
  try {
    const cookieStore = await cookies();

    const cookieHeader = Array.from(cookieStore.getAll())
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const { branch_id } = await params;

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const qs = new URLSearchParams();
    if (start) qs.set("start", start);
    if (end) qs.set("end", end);
    const qsStr = qs.toString();

    const response = await fetch(
      `${MANAGED_HOSTING_API_URL}/api/v1/project_branches/${branch_id}/usage${qsStr ? `?${qsStr}` : ""}`,
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
