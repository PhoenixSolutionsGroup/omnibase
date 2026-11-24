import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
	label: string;
	color: string;
	pulse?: boolean;
	variant?: "full" | "dot" | "fill";
}

interface DotProps {
	pulse?: boolean;
	color?: string;
}

function Dot({ pulse = false, color = "text-muted-foreground" }: DotProps) {
	if (pulse) {
		return (
			<span className={cn("relative flex size-2.5 shrink-0", color)}>
				<span
					className={cn(
						"absolute inline-flex h-full w-full shrink-0 rounded-full bg-current opacity-60",
						"animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]",
					)}
				/>
				<span className="relative inline-flex size-2.5 shrink-0 rounded-full bg-current" />
			</span>
		);
	}

	return (
		<span
			className={cn(
				"inline-flex size-2.5 shrink-0 rounded-full bg-current",
				color,
			)}
		/>
	);
}

export function StatusBadge({
	label,
	color,
	pulse = false,
	variant = "full",
}: StatusBadgeProps) {
	if (variant === "fill") {
		return (
			<Badge
				variant="secondary"
				className={cn("flex items-center gap-2", color)}
			>
				{label}
			</Badge>
		);
	}

	if (variant === "dot") {
		return <Dot color={color} pulse={pulse} />;
	}

	return (
		<Badge variant="secondary" className="flex items-center gap-2">
			<Dot color={color} pulse={pulse} />
			{label}
		</Badge>
	);
}
