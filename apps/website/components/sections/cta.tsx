import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Ready to ship your idea?
          </h2>

          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Get set up in less than 5 minutes and start building what matters.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href={process.env.NEXT_PUBLIC_DASHBOARD_URL || ""}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="https://docs.omnibase.tech">
                <BookOpen className="mr-2 h-4 w-4" />
                Read the Docs
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
