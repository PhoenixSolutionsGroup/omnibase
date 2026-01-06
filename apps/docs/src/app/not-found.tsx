import Link from 'next/link';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

export default function NotFound() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="flex flex-1 flex-col items-center justify-center py-20">
        <h1 className="text-fd-foreground mb-2 text-4xl font-bold">404</h1>
        <p className="text-fd-muted-foreground mb-6">Page not found</p>
        <Link
          href="/docs/guides"
          className="bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90 rounded-md px-4 py-2 text-sm font-medium"
        >
          Go to documentation
        </Link>
      </div>
    </HomeLayout>
  );
}
