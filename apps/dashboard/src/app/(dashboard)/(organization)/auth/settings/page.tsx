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
		<div className="max-w-3xl my-4 md:my-8 mx-auto">
			<div className="mx-4 md:mx-16 space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-xl font-bold">Account Settings</h1>
						<p className="text-muted-foreground">
							Manage your account details and authentication
						</p>
					</div>
				</div>
				<div className="flex">
					<SettingsForm
						flow={flow}
						sectionClassName="max-w-none"
						className="w-full"
					/>
				</div>
			</div>
		</div>
	);
}
