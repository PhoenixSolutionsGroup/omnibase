import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const MANAGED_HOSTING_API_URL = process.env.MANAGED_HOSTING_API_URL;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ project_id: string }> }
) {
  try {
    const cookieStore = await cookies();

    const cookieHeader = Array.from(cookieStore.getAll())
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const { project_id } = await params;

    const response = await fetch(
      `${MANAGED_HOSTING_API_URL}/api/v1/projects/${project_id}`,
      {
        method: "DELETE",
        headers: {
          Cookie: cookieHeader,
        },
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to delete project" }));
      return NextResponse.json(
        { message: error.message || "Failed to delete project" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
