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
    const returnTo = searchParams.get("return_to");

    const apiUrl = new URL(
      `${MANAGED_HOSTING_API_URL}/api/v1/project_branches/${branch_id}/stripe-onboarding-link`
    );
    if (returnTo) {
      apiUrl.searchParams.set("return_to", returnTo);
    }

    // Make GET request to managed host API
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to get onboarding link" }));
      return NextResponse.json(
        { message: error.message || "Failed to get onboarding link" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting Stripe onboarding link:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
