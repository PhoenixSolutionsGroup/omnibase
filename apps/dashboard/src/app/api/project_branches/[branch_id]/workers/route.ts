import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const MANAGED_HOSTING_API_URL = process.env.MANAGED_HOSTING_API_URL;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ branch_id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const cookieHeader = Array.from(cookieStore.getAll())
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const { branch_id } = await params;

    const response = await fetch(
      `${MANAGED_HOSTING_API_URL}/api/v1/project_branches/${branch_id}/workers`,
      {
        headers: { Cookie: cookieHeader },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { message: "Failed to fetch workers" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching workers:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
