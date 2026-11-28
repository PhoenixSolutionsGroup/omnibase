import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const MANAGED_HOSTING_API_URL = process.env.MANAGED_HOSTING_API_URL;

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ branch_id: string; name: string }> },
) {
	try {
		const cookieStore = await cookies();
		const cookieHeader = Array.from(cookieStore.getAll())
			.map((cookie) => `${cookie.name}=${cookie.value}`)
			.join("; ");

		const { branch_id, name } = await params;

		const { searchParams } = new URL(request.url);
		const qs = new URLSearchParams();
		const startTime = searchParams.get("start_time");
		const endTime = searchParams.get("end_time");
		if (startTime) qs.set("start_time", startTime);
		if (endTime) qs.set("end_time", endTime);
		const qsStr = qs.toString();

		const response = await fetch(
			`${MANAGED_HOSTING_API_URL}/api/v1/project_branches/${branch_id}/workers/${name}/logs${qsStr ? `?${qsStr}` : ""}`,
			{
				method: "GET",
				headers: {
					Cookie: cookieHeader,
				},
				cache: "no-store",
			},
		);

		const data = await response
			.json()
			.catch(() => ({ message: "Failed to fetch worker logs" }));
		return NextResponse.json(data, { status: response.status });
	} catch (error) {
		console.error("Error fetching worker logs:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
