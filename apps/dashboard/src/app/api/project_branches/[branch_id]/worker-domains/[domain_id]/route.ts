import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const MANAGED_HOSTING_API_URL = process.env.MANAGED_HOSTING_API_URL;

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ branch_id: string; domain_id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const cookieHeader = Array.from(cookieStore.getAll())
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const { branch_id, domain_id } = await params;

    const response = await fetch(
      `${MANAGED_HOSTING_API_URL}/api/v1/project_branches/${branch_id}/worker-domains/${domain_id}`,
      { method: "DELETE", headers: { Cookie: cookieHeader } }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error deleting domain:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ branch_id: string; domain_id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const cookieHeader = Array.from(cookieStore.getAll())
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const { branch_id, domain_id } = await params;

    const response = await fetch(
      `${MANAGED_HOSTING_API_URL}/api/v1/project_branches/${branch_id}/worker-domains/${domain_id}/retry`,
      { method: "POST", headers: { Cookie: cookieHeader } }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error retrying domain validation:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}