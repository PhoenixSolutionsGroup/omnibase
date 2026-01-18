import { NextResponse } from "next/server";

const OMNIBASE_API_URL = process.env.OMNIBASE_API_URL;

export async function GET() {
  try {
    if (!OMNIBASE_API_URL) {
      return NextResponse.json(
        { message: "API URL not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(`${OMNIBASE_API_URL}/api/v1/stripe/schema`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Failed to fetch schema" },
        { status: response.status }
      );
    }

    const schema = await response.json();

    return NextResponse.json(schema, {
      headers: {
        "Content-Type": "application/schema+json",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error fetching Stripe config schema:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
