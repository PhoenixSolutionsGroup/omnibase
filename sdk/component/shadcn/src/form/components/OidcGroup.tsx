import type { UiNode, UiNodeInputAttributes } from "@ory/client-fetch";
import { Button } from "@/components/ui/button";
import { isUiNodeInputAttributes } from "../types";
import { Divider } from "./Divider";
import { HiddenInput } from "./HiddenInput";
import { getProviderIcon } from "./provider-icons";

type OidcGroupProps = {
	nodes: UiNode[];
	flowAction: string;
	flowMethod: string;
	csrfToken: UiNode | undefined;
	groupIndex: number;
	groupName: string;
};

export function OidcGroup({
	nodes,
	flowAction,
	flowMethod,
	csrfToken,
	groupIndex,
	groupName,
}: OidcGroupProps) {
	const submitButtons = nodes.filter(
		(node) =>
			isUiNodeInputAttributes(node.attributes) &&
			node.attributes.type === "submit",
	);

	return (
		<div>
			{groupIndex > 0 && <Divider withText />}

			<div className="space-y-3">
				{submitButtons.map((node, btnIndex) => {
					const attrs = node.attributes as UiNodeInputAttributes;
					const Icon = getProviderIcon(attrs.value);

					return (
						<form
							key={`${groupName}-${btnIndex}`}
							action={flowAction}
							method={flowMethod}
							className="w-full"
						>
							{csrfToken && <HiddenInput node={csrfToken} />}
							<Button
								type="submit"
								name={attrs.name}
								value={attrs.value}
								variant="outline"
								className="capitalize w-full"
								disabled={attrs.disabled}
							>
								{Icon && <Icon />}
								{node.meta?.label?.text ?? `Continue with ${attrs.value}`}
							</Button>
						</form>
					);
				})}
			</div>
		</div>
	);
}
