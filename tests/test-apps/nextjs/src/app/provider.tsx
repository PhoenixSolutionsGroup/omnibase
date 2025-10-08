"use client";

import { AuthClientProvider } from "@omnibase/react";
import React from "react";

export default function ClientProvider({ children }: any) {
  return (
    <AuthClientProvider basePath={process.env.NEXT_OMNIBASE_AUTH_URL!}>
      {children}
    </AuthClientProvider>
  );
}
