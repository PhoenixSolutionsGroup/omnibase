"use client";

import { Check, Copy } from "lucide-react";
import type { ComponentProps } from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const COPIED_RESET_MS = 5000;

interface CopyButtonProps
	extends Omit<ComponentProps<typeof Button>, "onClick" | "value"> {
	value: string | null | undefined;
	label?: string;
	showIcon?: boolean;
	children?: React.ReactNode;
	copiedText?: string;
}

export function CopyButton({
	value,
	label = "Value",
	showIcon = false,
	variant = "outline",
	disabled,
	children = "Copy",
	copiedText = "Copied",
	...props
}: CopyButtonProps) {
	const [copied, setCopied] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	const handleCopy = async () => {
		if (!value) return;
		try {
			await navigator.clipboard.writeText(value);
			toast.success(`${label} copied to clipboard`);
			setCopied(true);
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
			timeoutRef.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
		} catch {
			toast.error(`Failed to copy ${label}`);
		}
	};

	return (
		<Button
			type="button"
			variant={variant}
			onClick={handleCopy}
			disabled={disabled || !value}
			{...props}
		>
			{copied ? (
				<>
					<Check />
					{copiedText}
				</>
			) : (
				<>
					{showIcon && <Copy />}
					{children}
				</>
			)}
		</Button>
	);
}
