import { describe, expect, test } from 'bun:test';
import versions from '../content/versions.json';
import { resolveRedirect } from './redirects';

describe('resolveRedirect', () => {
  test('sends root and section landings to their first page', () => {
    expect(resolveRedirect('/')).toBe('/guides/quickstart');
    expect(resolveRedirect('/guides/')).toBe('/guides/quickstart');
    expect(resolveRedirect('/concepts')).toBe('/concepts/tenants');
  });

  test('pins unversioned section paths to the latest version', () => {
    expect(resolveRedirect('/cli')).toBe(`/cli/${versions.cli}`);
    expect(resolveRedirect('/cli/db/migrate')).toBe(`/cli/${versions.cli}/db/migrate`);
    expect(resolveRedirect('/api/storage/uploadFile/')).toBe(`/api/${versions.api}/storage/uploadFile`);
  });

  test('resolves the latest alias', () => {
    expect(resolveRedirect('/nextjs/latest')).toBe(`/nextjs/${versions.nextjs}`);
    expect(resolveRedirect('/shadcn/latest/foo')).toBe(`/shadcn/${versions.shadcn}/foo`);
  });

  test('maps legacy reference paths', () => {
    expect(resolveRedirect('/reference')).toBe('/overview');
    expect(resolveRedirect('/reference/sdk')).toBe('/shadcn');
    expect(resolveRedirect('/reference/api/v1/auth/whoAmI')).toBe(`/api/${versions.api}/auth/whoAmI`);
    expect(resolveRedirect('/reference/cli/start')).toBe(`/cli/${versions.cli}/start`);
    expect(resolveRedirect('/reference/sdk/react')).toBe(`/react/${versions.react}`);
    expect(resolveRedirect('/components/button')).toBe(`/shadcn/${versions.shadcn}/button`);
  });

  test('leaves explicit versions and unknown paths alone', () => {
    expect(resolveRedirect('/cli/0.11.0/start')).toBeNull();
    expect(resolveRedirect(`/api/${versions.api}`)).toBeNull();
    expect(resolveRedirect('/guides/quickstart')).toBeNull();
    expect(resolveRedirect('/nope')).toBeNull();
  });
});
