import { getSettingsFlow } from "@omnibase/nextjs/auth";
import { SettingsForm } from "@omnibase/shadcn";

export default async function page({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const flow = await getSettingsFlow({ searchParams, url: "/auth/settings" });
	if (!flow) return null;
	return (
		<div className="my-8">
			<SettingsForm flow={flow} />
		</div>
	);
}
