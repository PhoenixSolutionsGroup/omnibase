"use server";

import { redirect } from "next/navigation";
import {
  clearSessionToken,
  setSessionToken,
} from "@omnibase/nextjs/auth";

export async function setSessionTokenAction(token: string): Promise<void> {
  await setSessionToken(token);
  redirect("/");
}

export async function clearSessionTokenAction(): Promise<void> {
  await clearSessionToken();
}