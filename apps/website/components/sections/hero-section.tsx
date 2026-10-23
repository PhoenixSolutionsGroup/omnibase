"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";
import { PulsingDots } from "../plusing-dots";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
      <PulsingDots />
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-77.5 w-77.5 rounded-full bg-primary/20 opacity-20 blur-[100px]" />

      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center text-center">
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Who said <span className="text-primary italic">finishing fast</span>{" "}
            <br></br>is bad?
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Launch your app for free in less than 5 minutes. Everything you need
            is already included: real time storage, authentication, permissions
            and billing. No coding required.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="https://docs.omnibase.tech/quickstart">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link
                href="https://github.com/PhoenixSolutionsGroup/omnibase"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Link>
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Secure
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Fast
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Free
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
