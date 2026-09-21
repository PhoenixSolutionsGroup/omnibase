import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const MANAGED_HOSTING_API_URL = process.env.MANAGED_HOSTING_API_URL;

async function forward(
  request: NextRequest,
  params: Promise<{ branch_id: string; name: string }>
) {
  try {
    const cookieStore = await cookies();
    const cookieHeader = Array.from(cookieStore.getAll())
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const { branch_id, name } = await params;

    const response = await fetch(
      `${MANAGED_HOSTING_API_URL}/api/v1/project_branches/${branch_id}/workers/${name}/domains`,
      {
        method: request.method,
        headers: {
          Cookie: cookieHeader,
          "Content-Type": "application/json",
        },
        body:
          request.method === "POST" || request.method === "PUT"
            ? JSON.stringify(await request.json())
            : undefined,
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error forwarding domain request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ branch_id: string; name: string }> }
) {
  return forward(request, params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ branch_id: string; name: string }> }
) {
  return forward(request, params);
}