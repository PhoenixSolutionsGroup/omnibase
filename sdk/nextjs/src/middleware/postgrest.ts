import type { Session } from "@omnibase/core-js/auth";
import { NextRequest, NextResponse } from "next/server";

export const postgrestJWTCheckMiddleware = async (
  req: NextRequest,
  session: Session,
  api_url: string
) => {
  if (!session || !session.active) return NextResponse.next();

  const jwt = req.cookies.get("omnibase_postgrest_jwt");
  if (jwt) return NextResponse.next();

  const response = await fetch(`${api_url}/api/v1/tenants/jwt`, {
    headers: {
      Cookie: req.headers.get("cookie") || "",
    },
  });

  const json: any = await response.json();
  if (!json || !json.data || !json.data.token) return NextResponse.next();
  const nextResponse = NextResponse.next();
  nextResponse.cookies.set("omnibase_postgrest_jwt", json.token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours - match JWT expiry
  });
  return nextResponse;
};
