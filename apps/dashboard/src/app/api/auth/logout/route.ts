import { getLogoutFlow } from "@omnibase/nextjs/auth";

export async function POST() {
  const flow = await getLogoutFlow({
    returnTo: "/auth/login",
  });
  if (!flow) return new Response("Not logged in", { status: 401 });

  return await flow.action();
}
