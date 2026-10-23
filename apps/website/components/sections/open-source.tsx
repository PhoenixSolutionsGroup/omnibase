import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { HeartDotGrid } from "../heart-dot-grid";

export function OpenSourceSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="p-8 md:p-12 grid grid-cols-2">
          <div className="flex flex-col items-start">
            <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Built in the open
            </h2>

            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Omnibase has always been fully open source under the Apache 2.0
              license. We believe great tools should be transparent,
              inspectable, from and for the community. Read, contribute,
              self-host. You&apos;re in control.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" variant="outline" asChild>
                <Link
                  href="https://github.com/PhoenixSolutionsGroup/omnibase"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-2 h-5 w-5" />
                  Star on GitHub
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative isolate flex items-center justify-center">
            <HeartDotGrid className="h-auto w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
