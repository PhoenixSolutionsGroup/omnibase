import type { Metadata } from "next";
import { Geist, Geist_Mono, Public_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Omnibase - The Open-Source Backend for Multi-Tenant SaaS",
  description:
    "Omnibase gives you everything you need to build production-ready SaaS applications: authentication, team management, permissions, and billing. No reinventing the wheel.",
  keywords: [
    "baas",
    "backend as a service",
    "multi-tenant",
    "saas",
    "open source",
    "authentication",
    "rbac",
    "stripe",
  ],
  openGraph: {
    title: "Omnibase - The Open-Source Backend for Multi-Tenant SaaS",
    description:
      "Ship your SaaS in days, not months. Multi-tenancy, RBAC, and Stripe included.",
    url: "https://omnibase.tech",
    siteName: "Omnibase",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Omnibase - The Open-Source Backend for Multi-Tenant SaaS",
    description:
      "Ship your SaaS in days, not months. Multi-tenancy, RBAC, and Stripe included.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={publicSans.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
