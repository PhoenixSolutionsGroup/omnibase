"use client";

import type { VerificationFlow } from "@ory/client-fetch";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Messages } from "../components/ui/messages";
import { AnchorButton } from "./components/AnchorButton";
import { FormInput } from "./components/FormInput";
import { HiddenInput } from "./components/HiddenInput";
import { PinInput } from "./components/PinInput";
import { SubmitButton } from "./components/SubmitButton";
import {
	filterInputNodes,
	findAnchorNode,
	findCsrfToken,
	findSubmitButton,
	groupNodesByGroup,
	sortNodes,
} from "./utils";

export type VerificationFormProps = {
	flow: VerificationFlow;
	Header?: React.ReactNode;
	autoRedirect?: boolean;
};

export function VerificationForm({
	flow,
	Header,
	autoRedirect = true,
}: VerificationFormProps) {
	const nodesByGroup = groupNodesByGroup(flow.ui.nodes);
	const csrfToken = findCsrfToken(flow.ui.nodes);

	const codeNodes = nodesByGroup.code || [];

	// Get input fields and submit button/anchor from code group
	const inputNodes = filterInputNodes(sortNodes(codeNodes));
	const submitButton = findSubmitButton(sortNodes(codeNodes));
	const anchorNode = findAnchorNode(sortNodes(codeNodes));

	// Auto-redirect when anchor node is present
	React.useEffect(() => {
		if (
			autoRedirect &&
			anchorNode &&
			anchorNode.type === "a" &&
			"href" in anchorNode.attributes
		) {
			const href = anchorNode.attributes.href as string;
			if (href && typeof window !== "undefined") {
				window.location.href = href;
			}
		}
	}, [autoRedirect, anchorNode]);

	return (
		<div>
			<Messages flow={flow} />
			<Card className="w-full max-w-md mx-auto">
				<CardHeader>
					<CardTitle className="text-center pb-1">
						{Header || "Verification Code"}
					</CardTitle>
				</CardHeader>

				<CardContent>
					<form action={flow.ui.action} method={flow.ui.method}>
						<div className="space-y-4">
							{csrfToken && <HiddenInput node={csrfToken} />}

							{inputNodes.map((node, idx) => {
								// Use PinInput for verification code, FormInput for others
								const isCodeInput =
									node.attributes.node_type === "input" &&
									"name" in node.attributes &&
									node.attributes.name === "code";

								// Get the initial value from node attributes if available
								const initialValue =
									isCodeInput && "value" in node.attributes
										? String(node.attributes.value || "")
										: "";

								return isCodeInput ? (
									<PinInput
										key={idx}
										node={node}
										length={6}
										initialValue={initialValue}
									/>
								) : (
									<FormInput key={idx} node={node} />
								);
							})}

							{submitButton && <SubmitButton node={submitButton} />}
							{!submitButton && anchorNode && (
								<AnchorButton node={anchorNode} />
							)}
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
