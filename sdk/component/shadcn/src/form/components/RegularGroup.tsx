import type { UiNode } from "@ory/client-fetch";
import { uiNodeKey } from "../utils";
import { Divider } from "./Divider";
import { FormInput } from "./FormInput";
import { HiddenInput } from "./HiddenInput";
import { SubmitButton } from "./SubmitButton";

type RegularGroupProps = {
	inputNodes: UiNode[];
	submitButton: UiNode | undefined;
	flowAction: string;
	flowMethod: string;
	csrfToken: UiNode | undefined;
	groupIndex: number;
};

export function RegularGroup({
	inputNodes,
	submitButton,
	flowAction,
	flowMethod,
	csrfToken,
	groupIndex,
}: RegularGroupProps) {
	return (
		<div>
			{groupIndex > 0 && <Divider />}

			<form action={flowAction} method={flowMethod}>
				<div className="space-y-4">
					{csrfToken && <HiddenInput node={csrfToken} />}

					{inputNodes.map((node) => (
						<FormInput key={uiNodeKey(node)} node={node} />
					))}

					{submitButton && <SubmitButton node={submitButton} />}
				</div>
			</form>
		</div>
	);
}
