"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

interface RevealButtonProps
	extends Omit<ComponentProps<typeof Button>, "onClick" | "children"> {
	isRevealed: boolean;
	isLoading?: boolean;
	onToggle: () => void;
}

export function RevealButton({
	isRevealed,
	isLoading = false,
	onToggle,
	variant = "outline",
	disabled,
	...props
}: RevealButtonProps) {
	return (
		<Button
			type="button"
			variant={variant}
			onClick={onToggle}
			disabled={disabled || isLoading}
			title={isRevealed ? "Hide" : "Reveal"}
			aria-label={isRevealed ? "Hide secret" : "Reveal secret"}
			{...props}
		>
			{isLoading ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : isRevealed ? (
				<EyeOff className="h-4 w-4" />
			) : (
				<Eye className="h-4 w-4" />
			)}
		</Button>
	);
}
