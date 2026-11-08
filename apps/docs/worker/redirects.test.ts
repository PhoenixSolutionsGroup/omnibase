import { describe, expect, test } from 'bun:test';
import { resolveRedirect } from './redirects';

const versions = {
  api: '0.21.0',
  cli: '0.12.0',
  nextjs: '0.9.1',
  react: '0.3.7',
  shadcn: '0.9.1',
};

const resolve = (
  path: string,
  aliases?: Record<string, Record<string, string>>,
) => resolveRedirect(path, aliases, versions);

describe('resolveRedirect', () => {
  test('sends root and section landings to their first page', () => {
    expect(resolve('/')).toBe('/guides/quickstart');
    expect(resolve('/guides/')).toBe('/guides/quickstart');
    expect(resolve('/concepts')).toBe('/concepts/tenants');
  });

  test('serves section landing pages without redirecting', () => {
    expect(resolve('/cli')).toBeNull();
    expect(resolve('/api/')).toBeNull();
  });

  test('pins unversioned section paths to the latest version', () => {
    expect(resolve('/cli/db/migrate')).toBe(`/cli/${versions.cli}/db/migrate`);
    expect(resolve('/api/storage/uploadFile/')).toBe(`/api/${versions.api}/storage/uploadFile`);
  });

  test('resolves the latest alias', () => {
    expect(resolve('/nextjs/latest')).toBe(`/nextjs/${versions.nextjs}`);
    expect(resolve('/shadcn/latest/foo')).toBe(`/shadcn/${versions.shadcn}/foo`);
  });

  test('maps legacy reference paths', () => {
    expect(resolve('/reference')).toBe('/overview');
    expect(resolve('/reference/sdk')).toBe('/shadcn');
    expect(resolve('/reference/api/v1/auth/whoAmI')).toBe(`/api/${versions.api}/auth/whoAmI`);
    expect(resolve('/reference/cli/start')).toBe(`/cli/${versions.cli}/start`);
    expect(resolve('/reference/sdk/react')).toBe(`/react/${versions.react}`);
    expect(resolve('/components/button')).toBe(`/shadcn/${versions.shadcn}/button`);
  });

  test('leaves explicit versions and unknown paths alone', () => {
    expect(resolve('/cli/0.11.0/start')).toBeNull();
    expect(resolve(`/api/${versions.api}`)).toBeNull();
    expect(resolve('/guides/quickstart')).toBeNull();
    expect(resolve('/nope')).toBeNull();
  });

  test('redirects collapsed versions to the version that replaced them', () => {
    const aliases = { nextjs: { '0.9.0': '0.9.2', '0.8.0': '0.9.2' } };
    expect(resolve('/nextjs/0.9.0/Auth/functions', aliases)).toBe('/nextjs/0.9.2/Auth/functions');
    expect(resolve('/nextjs/0.8.0', aliases)).toBe('/nextjs/0.9.2');
    expect(resolve('/nextjs/0.9.2/Auth', aliases)).toBeNull();
    expect(resolve('/cli/0.9.0/start', aliases)).toBeNull();
  });
});
