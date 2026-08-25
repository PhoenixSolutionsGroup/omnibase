import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Configuration, V1AuthApi, type SessionResponse } from "@omnibase/core-js";

export const SESSION_TOKEN_COOKIE = "omnibase_session_token";
export const OIDC_INIT_CODE_COOKIE = "omnibase_oidc_init_code";

const SESSION_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

function readCookie(header: string, name: string): string | undefined {
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export async function getSessionToken(): Promise<string | undefined> {
  const c = await cookies();
  return c.get(SESSION_TOKEN_COOKIE)?.value;
}

export async function setSessionToken(token: string): Promise<void> {
  const c = await cookies();
  c.set(SESSION_TOKEN_COOKIE, token, SESSION_TOKEN_COOKIE_OPTIONS);
}

export async function clearSessionToken(): Promise<void> {
  const c = await cookies();
  c.delete(SESSION_TOKEN_COOKIE);
  c.delete(OIDC_INIT_CODE_COOKIE);
}

/**
 * Configuration that authenticates API calls with the session token
 * (`X-Session-Token`), falling back to cookies when no token is present.
 */
export async function getSessionConfiguration(): Promise<Configuration> {
  const token = await getSessionToken();
  const basePath =
    process.env.NEXT_PUBLIC_OMNIBASE_API_URL ?? process.env.OMNIBASE_API_URL;
  return new Configuration({
    basePath,
    headers: token ? { "X-Session-Token": token } : undefined,
  });
}

/**
 * Validates the session token against the OmniBase API and returns the
 * underlying Kratos session, or null when there is no token or it is invalid.
 */
export async function getTokenSession(): Promise<SessionResponse["session"] | null> {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const api = new V1AuthApi(await getSessionConfiguration());
    const response = await api.getSession();
    return response?.session ?? null;
  } catch {
    return null;
  }
}

/**
 * Exchanges the two session token exchange codes (one from the flow
 * initialization, one from the `return_to` redirect) for a session token.
 */
export async function exchangeSessionToken(
  initCode: string,
  returnToCode: string
): Promise<string | null> {
  if (!initCode.trim() || !returnToCode.trim()) return null;
  const basePath =
    process.env.NEXT_PUBLIC_OMNIBASE_API_URL ?? process.env.OMNIBASE_API_URL;
  if (!basePath) return null;

  const url = new URL(
    `${basePath.replace(/\/$/, "")}/api/v1/auth/proxy/sessions/token-exchange`
  );
  url.searchParams.set("init_code", initCode);
  url.searchParams.set("return_to_code", returnToCode);

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { session_token?: string };
    return data.session_token ?? null;
  } catch {
    return null;
  }
}

/**
 * Route handler for the social sign-in callback. Mount it at the path passed
 * to `LoginForm`'s `return_to` (default `/auth/callback`). It exchanges the
 * session token exchange codes delivered after a social sign-in and stores
 * the resulting session token in the first-party cookie.
 */
export function createSessionTokenExchangeHandler({
  api_url,
  success_path = "/",
  login_path = "/auth/login",
}: {
  api_url: string;
  success_path?: string;
  login_path?: string;
}) {
  return async function sessionTokenExchangeHandler(
    req: Request
  ): Promise<Response> {
    const url = new URL(req.url);
    const returnToCode = url.searchParams.get("code");
    const initCode = readCookie(
      req.headers.get("cookie") ?? "",
      OIDC_INIT_CODE_COOKIE
    );

    const fail = (reason: string): Response => {
      const res = NextResponse.redirect(
        new URL(`${login_path}?auth_error=${reason}`, url)
      );
      res.cookies.delete(OIDC_INIT_CODE_COOKIE);
      return res;
    };

    if (!returnToCode) return fail("missing_return_to_code");
    if (!initCode) return fail("missing_init_code");

    const token = await exchangeSessionToken(initCode, returnToCode);

    if (!token) return fail("exchange_failed");

    const res = NextResponse.redirect(new URL(success_path, url));
    res.cookies.set(SESSION_TOKEN_COOKIE, token, SESSION_TOKEN_COOKIE_OPTIONS);
    res.cookies.delete(OIDC_INIT_CODE_COOKIE);
    return res;
  };
}