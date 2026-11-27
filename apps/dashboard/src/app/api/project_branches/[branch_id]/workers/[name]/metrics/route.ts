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
		for (const key of ["start", "end", "step", "metrics"]) {
			const value = searchParams.get(key);
			if (value) qs.set(key, value);
		}
		const qsStr = qs.toString();

		const response = await fetch(
			`${MANAGED_HOSTING_API_URL}/api/v1/project_branches/${branch_id}/workers/${name}/metrics${qsStr ? `?${qsStr}` : ""}`,
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
			.catch(() => ({ message: "Failed to fetch worker metrics" }));
		return NextResponse.json(data, { status: response.status });
	} catch (error) {
		console.error("Error fetching worker metrics:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
