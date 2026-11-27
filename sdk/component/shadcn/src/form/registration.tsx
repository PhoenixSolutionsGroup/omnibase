import type { RegistrationFlow } from "@ory/client-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Messages } from "../components/ui/messages";
import { Divider } from "./components/Divider";
import { FormInput } from "./components/FormInput";
import { HiddenInput } from "./components/HiddenInput";
import { OidcGroup } from "./components/OidcGroup";
import { SubmitButton } from "./components/SubmitButton";
import { isUiNodeInputAttributes } from "./types";
import {
	filterInputNodes,
	findCsrfToken,
	findSubmitButton,
	groupNodesByGroup,
	sortNodes,
} from "./utils";

export type RegistrationFormProps = {
	flow: RegistrationFlow;
	Header?: React.ReactNode;
	login_url?: string;
	variant?: "card" | "plain";
	className?: string;
};

export function RegistrationForm({
	flow,
	Header,
	login_url,
	variant = "card",
	className = "",
}: RegistrationFormProps) {
	const nodesByGroup = groupNodesByGroup(flow.ui.nodes);
	const csrfToken = findCsrfToken(flow.ui.nodes);

	const oidcNodes = nodesByGroup.oidc || [];
	const defaultNodes = nodesByGroup.default || [];
	const profileNodes = nodesByGroup.profile || [];
	const passwordNodes = nodesByGroup.password || [];

	// Get visible input fields from default and password groups
	const inputNodes = filterInputNodes(
		sortNodes([...defaultNodes, ...passwordNodes]),
	);

	// Get hidden fields (excluding CSRF token which is handled separately)
	const hiddenNodes = [...defaultNodes, ...passwordNodes].filter(
		(node) =>
			isUiNodeInputAttributes(node.attributes) &&
			node.attributes.type === "hidden" &&
			node.attributes.name !== "csrf_token",
	);

	// Get submit button from profile or password group (password group takes precedence for password step)
	const submitButton =
		findSubmitButton(sortNodes(passwordNodes)) ||
		findSubmitButton(sortNodes(profileNodes));

	// Build login URL with return_to parameter
	const loginHref =
		login_url && flow.return_to
			? `${login_url}?return_to=${encodeURIComponent(flow.return_to)}`
			: login_url;

	return (
		<div className="w-90 md:w-100">
			<Messages flow={flow} />
			<Card
				className={cn(
					"w-full mx-auto",
					variant === "plain" ? "border-none shadow-none" : "",
					className,
				)}
			>
				{Header && (
					<CardHeader>
						<CardTitle className="text-center pb-1">{Header}</CardTitle>
					</CardHeader>
				)}

				<CardContent className="space-y-6">
					{/* Main registration form with inputs and submit button */}
					<div>
						<form action={flow.ui.action} method={flow.ui.method}>
							<div className="space-y-4">
								{csrfToken && <HiddenInput node={csrfToken} />}

								{/* Render all hidden fields (traits stored from previous steps) */}
								{hiddenNodes.map((node, idx) => (
									<HiddenInput key={`hidden-${idx}`} node={node} />
								))}

								{inputNodes.map((node, idx) => (
									<FormInput key={idx} node={node} />
								))}

								{submitButton && (
									<SubmitButton
										node={submitButton}
										className="w-full capitalize"
									/>
								)}
							</div>
						</form>

						{oidcNodes.length > 0 && <Divider withText />}

						{/* OIDC buttons (if present) */}
						{oidcNodes.length > 0 && (
							<OidcGroup
								nodes={sortNodes(oidcNodes)}
								flowAction={flow.ui.action}
								flowMethod={flow.ui.method}
								csrfToken={csrfToken}
								groupIndex={0}
								groupName="oidc"
							/>
						)}

						{/* Navigation to Login */}
						{login_url && (
							<div className="mt-4 text-center text-sm">
								Already have an account?{" "}
								<a
									href={loginHref}
									className="text-primary underline-offset-4 hover:underline font-medium"
								>
									Sign In
								</a>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
