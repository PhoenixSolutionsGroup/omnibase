import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Product: [
    { href: "https://docs.omnibase.tech", label: "Documentation" },
    { href: "https://docs.omnibase.tech/quickstart", label: "Quickstart" },
    { href: "https://docs.omnibase.tech/self-hosting", label: "Self-Hosting" },
    { href: "https://docs.omnibase.tech/roadmap", label: "Roadmap" },
  ],
  Compare: [
    { href: "/compare/supabase", label: "Supabase" },
  ],
  Community: [
    { href: "https://github.com/PhoenixSolutionsGroup/omnibase", label: "GitHub" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/omnibase-logo.png"
                alt="Omnibase"
                width={32}
                height={32}
                className="rounded-lg"
                unoptimized
              />
              <span className="font-semibold text-xl">Omnibase</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              The open-source backend for multi-tenant SaaS applications.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-sm">{category}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Omnibase. Open source under Apache 2.0.
          </p>
        </div>
      </div>
    </footer>
  );
}
