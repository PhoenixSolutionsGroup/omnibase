'use client';

import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';

interface ChangelogPackage {
  id: string;
  title: string;
}

const ActivePackage = createContext<string | null>(null);

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}

function packageParam(): string | null {
  return new URLSearchParams(window.location.search).get('package');
}

function setPackageParam(id: string | null) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set('package', id);
  else url.searchParams.delete('package');
  window.history.replaceState(null, '', url);
  listeners.forEach((listener) => listener());
}

export function ChangelogFilter({
  packages,
  children,
}: {
  packages: ChangelogPackage[];
  children: ReactNode;
}) {
  const param = useSyncExternalStore(subscribe, packageParam, () => null);
  const active = packages.some((p) => p.id === param) ? param : null;

  const options: (ChangelogPackage | { id: null; title: string })[] = [
    { id: null, title: 'All' },
    ...packages,
  ];

  return (
    <ActivePackage.Provider value={active}>
      <div role="group" aria-label="Filter by package" className="not-prose mb-8 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id ?? 'all'}
            type="button"
            aria-pressed={active === option.id}
            onClick={() => setPackageParam(option.id)}
            className="rounded-full border px-3 py-1 text-sm font-medium transition-colors text-fd-muted-foreground hover:text-fd-accent-foreground hover:bg-fd-accent aria-pressed:border-fd-primary aria-pressed:bg-fd-primary aria-pressed:text-fd-primary-foreground"
          >
            {option.title}
          </button>
        ))}
      </div>
      {children}
    </ActivePackage.Provider>
  );
}

export function ChangelogEntry({
  package: pkg,
  children,
}: {
  package: string;
  children: ReactNode;
}) {
  const active = useContext(ActivePackage);
  return (
    <section data-package={pkg} hidden={active !== null && active !== pkg}>
      {children}
    </section>
  );
}
