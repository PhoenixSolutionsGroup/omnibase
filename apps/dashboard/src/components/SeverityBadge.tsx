type SeverityVariant = "badge" | "text";

interface SeverityStyle {
  label: string;
  text: string;
  badge: string;
}

const SEVERITY_STYLES: Record<string, SeverityStyle> = {
  DEFAULT: {
    label: "DEFAULT",
    text: "text-success",
    badge: "bg-success/5 border-success/50",
  },
  DEBUG: {
    label: "DEBUG",
    text: "text-muted-foreground",
    badge: "bg-muted-foreground/5 border-muted-foreground/50",
  },
  INFO: {
    label: "INFO",
    text: "text-info",
    badge: "bg-info/5 border-info/50",
  },
  NOTICE: {
    label: "NOTICE",
    text: "text-cyan-700",
    badge: "bg-cyan-50 border-cyan-200",
  },
  WARNING: {
    label: "WARNING",
    text: "text-warning",
    badge: "bg-warning/5 border-warning/50",
  },
  ERROR: {
    label: "ERROR",
    text: "text-destructive",
    badge: "bg-destructive/5 border-destructive/50",
  },
  CRITICAL: {
    label: "CRITICAL",
    text: "text-foreground",
    badge: "bg-foreground/5 border-foreground/50",
  },
  ALERT: {
    label: "ALERT",
    text: "text-purple-700",
    badge: "bg-purple-50 border-purple-200",
  },
  EMERGENCY: {
    label: "EMERGENCY",
    text: "text-purple-800",
    badge: "bg-purple-100 border-purple-300",
  },
};

interface SeverityBadgeProps {
  severity?: string;
  variant?: SeverityVariant;
}

export function SeverityBadge({
  severity,
  variant = "text",
}: SeverityBadgeProps) {
  if (!severity) return null;

  const style =
    SEVERITY_STYLES[severity.toUpperCase()] ?? SEVERITY_STYLES.DEFAULT;

  if (variant === "text") {
    return <span className={style.text}>{style.label}</span>;
  }

  return (
    <span
      className={`inline-flex items-center justify-center w-20 px-2 py-0.5 rounded text-xs font-medium border ${style.text} ${style.badge}`}
    >
      {style.label}
    </span>
  );
}
