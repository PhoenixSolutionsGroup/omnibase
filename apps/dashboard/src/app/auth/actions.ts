"use server";

import { redirect } from "next/navigation";
import {
  clearSessionToken,
  setSessionToken,
} from "@omnibase/nextjs/auth";

export async function setSessionTokenAction(token: string): Promise<void> {
  await setSessionToken(token, process.env.OMNIBASE_COOKIE_DOMAIN);
  redirect("/");
}

export async function clearSessionTokenAction(): Promise<void> {
  await clearSessionToken();
}