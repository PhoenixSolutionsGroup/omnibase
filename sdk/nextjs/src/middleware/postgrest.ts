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

  const { data }: any = await response.json();
  const nextResponse = NextResponse.next();
  nextResponse.cookies.set("omnibase_postgrest_jwt", data.token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours - match JWT expiry
  });
  return nextResponse;
};
