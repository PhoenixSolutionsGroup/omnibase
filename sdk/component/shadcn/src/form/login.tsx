"use client";

import { useCallback, useEffect, useState } from "react";
import type { LoginFlow, UiNodeInputAttributes } from "@ory/client-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Messages } from "../components/ui/messages";
import { isUiNodeInputAttributes } from "./types";

export const OIDC_INIT_CODE_COOKIE = "omnibase_oidc_init_code";

export type LoginFormProps = {
  /** OmniBase API URL. The form runs the native login flow against the auth proxy. */
  api_url: string;
  /** Called with the session token after a successful login. Store it in an httpOnly cookie and redirect. */
  onToken: (token: string) => void | Promise<void>;
  Header?: React.ReactNode;
  register_url?: string;
  /**
   * Path the auth server redirects the browser to after a social sign-in,
   * carrying the session token exchange code. Must resolve to a route that
   * exchanges the code and stores the session token.
   * @defaultValue "/auth/callback"
   */
  return_to?: string;
};

function collectMessages(flow?: LoginFlow): string[] {
  return [
    ...(flow?.ui.messages?.map((m) => m.text) ?? []),
    ...(flow?.ui.nodes.flatMap((n) => n.messages?.map((m) => m.text) ?? []) ?? []),
  ];
}

function getCsrfToken(flow?: LoginFlow | null): string | undefined {
  const csrfNode = flow?.ui.nodes.find(
    (n) =>
      isUiNodeInputAttributes(n.attributes) &&
      n.attributes.name === "csrf_token"
  );
  return csrfNode && isUiNodeInputAttributes(csrfNode.attributes)
    ? (csrfNode.attributes.value as string | undefined)
    : undefined;
}

/**
 * Password + social sign-in login form using the Kratos native (API) flow.
 * The session token is returned in the response body and forwarded to
 * `onToken` — no cookies cross origins, so it works from any domain.
 *
 * Social sign-in providers are rendered dynamically from the flow's OIDC
 * nodes: configure a provider (e.g. GitHub) in Kratos and its button appears
 * here automatically. Sign-in uses the session token exchange code flow so
 * the session token is delivered to `return_to` instead of a cookie.
 */
export function LoginForm({
  api_url,
  onToken,
  Header,
  register_url,
  return_to = "/auth/callback",
}: LoginFormProps) {
  const [flow, setFlow] = useState<LoginFlow | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const initFlow = useCallback(async () => {
    setError(null);
    try {
      const url = new URL(
        `${api_url.replace(/\/$/, "")}/api/v1/auth/proxy/self-service/login/api`
      );
      url.searchParams.set("return_session_token_exchange_code", "true");
      url.searchParams.set(
        "return_to",
        `${window.location.origin}${return_to}`
      );

      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Login flow failed (${res.status})`);

      const data = (await res.json()) as LoginFlow & {
        session_token_exchange_code?: string;
      };

      if (data.session_token_exchange_code) {
        document.cookie = `${OIDC_INIT_CODE_COOKIE}=${data.session_token_exchange_code}; path=/; samesite=lax; max-age=600`;
      }

      setFlow(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start login");
    }
  }, [api_url, return_to]);

  useEffect(() => {
    initFlow();
  }, [initFlow]);

  const onPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flow || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(flow.ui.action, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          csrf_token: getCsrfToken(flow),
          identifier: identifier.trim(),
          password,
          method: "password",
        }),
      });

      const data = await res.json();

      if (res.ok && data?.session_token) {
        await onToken(data.session_token);
        return;
      }

      if (data?.ui?.nodes && Array.isArray(data.ui.nodes)) {
        setError(collectMessages(data as LoginFlow).join(" ") || data?.error?.message || "Login failed");
        setFlow(data);
      } else {
        setError(data?.error?.message ?? "Login failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onOidcSubmit = async (provider: string) => {
    if (!flow || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(flow.ui.action, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          csrf_token: getCsrfToken(flow),
          method: "oidc",
          provider,
        }),
      });

      const data = await res.json();

      if (data?.redirect_browser_to) {
        window.location.href = data.redirect_browser_to;
        return;
      }

      if (data?.ui?.nodes && Array.isArray(data.ui.nodes)) {
        setError(collectMessages(data as LoginFlow).join(" ") || "Sign in failed");
        setFlow(data);
      } else {
        setError(data?.error?.message ?? "Sign in failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const oidcProviders =
    flow?.ui.nodes.filter(
      (n) =>
        n.group === "oidc" &&
        isUiNodeInputAttributes(n.attributes) &&
        n.attributes.name === "provider"
    ) ?? [];

  return (
    <div>
      <Messages flow={flow ?? undefined} />
      <Card className="w-full max-w-md mx-auto">
        {Header && (
          <CardHeader>
            <CardTitle className="text-center pb-1">{Header}</CardTitle>
          </CardHeader>
        )}

        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {oidcProviders.length > 0 && (
            <div className="space-y-2">
              {oidcProviders.map((node) => {
                const attrs = node.attributes as UiNodeInputAttributes;
                return (
                  <Button
                    key={attrs.value}
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={loading || !flow}
                    onClick={() => onOidcSubmit(attrs.value)}
                  >
                    {node.meta?.label?.text ?? `Continue with ${attrs.value}`}
                  </Button>
                );
              })}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    or
                  </span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={onPasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email</Label>
              <Input
                id="identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !flow}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          {register_url && (
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <a
                href={register_url}
                className="text-primary underline-offset-4 hover:underline"
              >
                Go to Register
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}