import { NextResponse, type NextRequest } from "next/server";
import type { OmnibaseMiddlewareConfig } from "./middleware";
import type { Session } from "@omnibase/core-js/auth";

export const tenantCheckMiddleware = (
  req: NextRequest,
  session: Session,
  {
    tenant_check,
    tenant_check_paths,
    tenant_check_redirect_url,
  }: OmnibaseMiddlewareConfig
) => {
  if (!session || !session.active || !tenant_check) return NextResponse.next();

  const pathname = req.nextUrl.pathname;

  const shouldCheckTenant = tenant_check_paths.some((pattern) => {
    if (pattern.endsWith("/*")) {
      return pathname.startsWith(pattern.slice(0, -2));
    }
    return pathname === pattern || pathname.startsWith(pattern + "/");
  });

  if (!shouldCheckTenant) return NextResponse.next();

  const metadata_public = session.identity?.metadata_public as any;
  const is_in_tenant = metadata_public?.is_in_tenant;

  if (!is_in_tenant) {
    return NextResponse.redirect(new URL(tenant_check_redirect_url, req.url));
  }

  return NextResponse.next();
};
