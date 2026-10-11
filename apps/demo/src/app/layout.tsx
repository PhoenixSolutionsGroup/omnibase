import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@omnibase/nextjs/auth";

export const metadata: Metadata = {
  title: "Shiftly",
  description: "Working schedules in minutes",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
