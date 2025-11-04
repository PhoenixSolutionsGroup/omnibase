"use client";

import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useFormStatus } from "react-dom";

export interface CustomerPortalButtonProps {
  /**
   * Optional custom label for the button
   * @default "Manage Billing"
   */
  label?: string;

  /**
   * Optional custom className for styling
   */
  className?: string;

  /**
   * Button variant
   * @default "outline"
   */
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";

  /**
   * Button size
   * @default "default"
   */
  size?: "default" | "sm" | "lg" | "icon";

  /**
   * Whether to show the credit card icon
   * @default true
   */
  showIcon?: boolean;
}

/**
 * CustomerPortalButton - A button component for accessing Stripe Customer Portal
 *
 * This component must be used within a form with a Server Action.
 * It automatically handles loading state using React's useFormStatus hook.
 *
 * @example
 * ```tsx
 * <form action={async () => {
 *   "use server";
 *   const portal = await omnibase.payments.portal.create({
 *     return_url: "https://yourapp.com/subscriptions",
 *   });
 *   if (portal.data?.url) {
 *     redirect(portal.data.url);
 *   }
 * }}>
 *   <CustomerPortalButton />
 * </form>
 * ```
 */
export function CustomerPortalButton({
  label = "Manage Billing",
  className,
  variant = "outline",
  size = "default",
  showIcon = true,
}: CustomerPortalButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      disabled={pending}
      aria-label="Open customer portal to manage billing and subscriptions"
    >
      {showIcon && !pending && <CreditCard className="mr-2 h-4 w-4" />}
      {pending ? "Loading..." : label}
    </Button>
  );
}
