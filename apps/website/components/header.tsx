"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, Github, ChevronDown, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";

const compareItems = [{ title: "Supabase", href: "/compare/supabase" }];

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="flex items-center gap-2">
      <Image
        src="/omnibase-logo.svg"
        alt="Omnibase"
        width={24}
        height={24}
        className="rounded-lg"
        unoptimized
      />
      <span className="font-semibold text-xl">Omnibase</span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  const changeTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-muted-foreground bg-transparent hover:bg-transparent hover:text-foreground data-[state=open]:bg-transparent">
                  Compare
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[160px] p-2">
                    {compareItems.map((item) => (
                      <NavigationMenuLink key={item.href} asChild>
                        <Link
                          href={item.href}
                          className="block select-none rounded-md px-3 py-2 text-sm font-medium leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          {item.title}
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Link
            href="https://docs.omnibase.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Docs
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={changeTheme}
            className="cursor-pointer"
          >
            <Sun className="hidden h-5 w-5 dark:block" />
            <Moon className="block h-5 w-5 dark:hidden" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link
              href="https://github.com/PhoenixSolutionsGroup/omnibase"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
          <Button asChild>
            <Link
              href={process.env.NEXT_PUBLIC_DASHBOARD_URL || ""}
              target="_blank"
            >
              Get Started
            </Link>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="top"
            className="w-full gap-0 p-0 [&>button]:hidden"
          >
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>

            {/* Header row, mirrors the real header */}
            <div className="border-b border-border/40 bg-background">
              <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                <Logo onClick={() => setOpen(false)} />
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </SheetClose>
              </div>
            </div>

            <nav className="flex flex-col gap-4 p-4">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="text-md font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Home
              </Link>

              {/* Mobile Compare Dropdown */}
              <div>
                <button
                  onClick={() => setCompareOpen(!compareOpen)}
                  className="flex items-center justify-between w-full text-md font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Compare
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      compareOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {compareOpen && (
                  <div className="mt-2 ml-2 flex flex-col gap-2">
                    {compareItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="text-base text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="https://docs.omnibase.tech"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="text-md font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Docs
              </Link>

              {/* Theme toggle, GitHub and CTA */}
              <div className="mt-2 flex items-center gap-3 border-t border-border/40 pt-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={changeTheme}
                  className="cursor-pointer"
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link
                    href="https://github.com/PhoenixSolutionsGroup/omnibase"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                  >
                    <Github className="h-5 w-5" />
                    <span className="sr-only">GitHub</span>
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link
                    href={process.env.NEXT_PUBLIC_DASHBOARD_URL || ""}
                    target="_blank"
                    onClick={() => setOpen(false)}
                  >
                    Get Started
                  </Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
