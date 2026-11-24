import { V1TenantsInvitesApi, V1TenantsLifecycleApi } from "@omnibase/core-js";
import { FlowRouter, protectedRoute } from "@omnibase/nextjs/auth";
import {
	ErrorForm,
	// - TODO: uncomment and add - Need to release shadcn package first,
	LoginForm,
	RecoveryForm,
	RegistrationForm,
	TenantCreator,
	VerificationForm,
} from "@omnibase/shadcn";
import { redirect } from "next/navigation";
import { setSessionTokenAction } from "@/app/auth/actions";
import { getOmnibaseConfiguration } from "@/lib/server";

const API_URL = process.env.NEXT_PUBLIC_OMNIBASE_API_URL!;

// TODO - Fix type definitions
export default function page({ params, searchParams }: any) {
	return (
		<div>
			<FlowRouter
				flowMap={{
					login: () => {
						return (
							<LoginForm
								api_url={API_URL}
								onToken={setSessionTokenAction}
								register_url="/auth/registration"
								variant="plain"
								Header={
									<div className="flex flex-col gap-1">
										<span className="text-2xl">Get started</span>
										<span className="text-xs font-light text-muted-foreground">
											Continue where you left off.
										</span>
									</div>
								}
								className="shadow-xl lg:shadow-none bg-card lg:bg-transparent"
							/>
						);
					},
					registration: (flow) => {
						return (
							<RegistrationForm
								flow={flow as any}
								login_url="/auth/login"
								variant="plain"
								Header={
									<div className="flex flex-col gap-1">
										<span className="text-2xl">Get started</span>
										<span className="text-xs font-light text-muted-foreground">
											Continue where you left off.
										</span>
									</div>
								}
								className="shadow-xl lg:shadow-none bg-card lg:bg-transparent"
							/>
						);
					},
					recovery: (flow) => {
						return <RecoveryForm flow={flow as any} />;
					},
					verification: (flow) => {
						return <VerificationForm flow={flow as any} />;
					},

					error: (error) => {
						return <ErrorForm error={error as any} login_url="/auth/login" />;
					},
					onboarding: async () => {
						const session = await protectedRoute("/auth/login");
						const { token } = await searchParams;
						return (
							<TenantCreator
								config={{
									createForm: {
										billingEmail: {
											defaultValue: session.identity?.traits.email,
										},
										organizationName: {
											defaultValue:
												session.identity?.traits.name.first +
												" " +
												session.identity?.traits.name.last,
										},
									},
									joinForm: {
										token: {
											defaultValue: token,
										},
									},
								}}
								formActions={{
									createOrganizationAction: async (formData: FormData) => {
										"use server";

										const organizationName = formData.get("organizationName") as
											| string
											| null;
										const billingEmail = formData.get("billingEmail") as
											| string
											| null;

										if (!organizationName || !billingEmail) {
											return;
										}

										const config = await getOmnibaseConfiguration();
										const client = new V1TenantsLifecycleApi(config);
										await client.createTenant({
											createTenantRequest: {
												name: organizationName,
												billingEmail: billingEmail,
												type: "organization",
											},
										});

										redirect("/");
									},
									async joinOrganizationAction(formData) {
										"use server";
										const token = formData.get("token") as string | null;

										if (!token) {
											return;
										}

										const config = await getOmnibaseConfiguration();
										const client = new V1TenantsInvitesApi(config);
										await client.acceptInvite({
											acceptRequest: {
												token,
											},
										});

										redirect("/");
									},
								}}
							/>
						);
					},
				}}
				params={params}
				searchParams={searchParams}
				returnTo="/"
				url="/auth"
				onNotFound={<></>}
			/>
		</div>
	);
}
