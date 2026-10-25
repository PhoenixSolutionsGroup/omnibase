import type { Metadata } from "next";
import { Geist, Geist_Mono, Public_Sans } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";

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
  icons: {
    icon: "/omnibase-logo.svg",
    apple: "/omnibase-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={publicSans.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
