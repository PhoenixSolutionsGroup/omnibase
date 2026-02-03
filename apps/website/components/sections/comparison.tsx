import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X } from "lucide-react";

const comparisonData = [
  {
    feature: "Native multi-tenancy",
    omnibase: true,
    supabase: false,
  },
  {
    feature: "Built-in RBAC",
    omnibase: true,
    supabase: false,
  },
  {
    feature: "Stripe integration",
    omnibase: true,
    supabase: false,
  },
  {
    feature: "Open source",
    omnibase: true,
    supabase: true,
  },
  {
    feature: "PostgreSQL",
    omnibase: true,
    supabase: true,
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="h-5 w-5 text-green-500 mx-auto" />;
  }
  if (value === false) {
    return <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />;
  }
  return <span className="text-sm text-muted-foreground">{value}</span>;
}

export function ComparisonSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How Omnibase compares
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            See how Omnibase stacks up against the alternatives you&apos;re
            already considering.
          </p>
        </div>

        <div className="mt-12 rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[200px]">Feature</TableHead>
                <TableHead className="text-center font-semibold text-foreground">
                  Omnibase
                </TableHead>
                <TableHead className="text-center">Supabase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((row) => (
                <TableRow key={row.feature}>
                  <TableCell className="font-medium">{row.feature}</TableCell>
                  <TableCell className="text-center bg-primary/5">
                    <CellValue value={row.omnibase} />
                  </TableCell>
                  <TableCell className="text-center">
                    <CellValue value={row.supabase} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Want more details?{" "}
            <a
              href="/compare/supabase"
              className="text-primary hover:underline"
            >
              Compare with Supabase
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
