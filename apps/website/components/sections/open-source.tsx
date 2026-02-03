import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Heart, Users } from "lucide-react";

export function OpenSourceSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="rounded-2xl border bg-gradient-to-br from-background to-muted/50 p-8 md:p-12">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-8 w-8 text-primary" />
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Built in the open
            </h2>

            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Omnibase is fully open source under the Apache 2.0 license.
              Self-hosting has full feature parity. Nothing is locked to the
              managed version. No vendor lock-in, ever.
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
              <Button size="lg" variant="outline" asChild>
                <Link
                  href="https://discord.gg/omnibase"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Join the Community
                </Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-8 text-center sm:grid-cols-3">
              <div>
                <div className="text-3xl font-bold">Apache 2.0</div>
                <div className="text-sm text-muted-foreground">
                  Open source license
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">100%</div>
                <div className="text-sm text-muted-foreground">
                  Feature parity
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">
                  Vendor lock-in
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
