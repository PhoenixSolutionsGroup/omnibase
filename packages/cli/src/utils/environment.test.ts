import { afterEach, describe, expect, it } from "bun:test";
import { localApiIsReady, localNotRunningError } from "./environment";

describe("localApiIsReady", () => {
  const servers: Array<ReturnType<typeof Bun.serve>> = [];

  afterEach(() => {
    for (const server of servers) server.stop(true);
    servers.length = 0;
  });

  it("returns true when /health/ready responds ok", async () => {
    const server = Bun.serve({
      port: 0,
      fetch: () => new Response("ok"),
    });
    servers.push(server);

    expect(await localApiIsReady(`http://127.0.0.1:${server.port}`)).toBe(true);
  });

  it("returns false when nothing is listening", async () => {
    const server = Bun.serve({
      port: 0,
      fetch: () => new Response("ok"),
    });
    const url = `http://127.0.0.1:${server.port}`;
    server.stop(true);

    expect(await localApiIsReady(url, 200)).toBe(false);
  });

  it("returns false when the API is not ready", async () => {
    const server = Bun.serve({
      port: 0,
      fetch: () => new Response("starting", { status: 503 }),
    });
    servers.push(server);

    expect(await localApiIsReady(`http://127.0.0.1:${server.port}`)).toBe(false);
  });
});

describe("localNotRunningError", () => {
  it("tells the user to run omnibase start", () => {
    expect(localNotRunningError().message).toContain("omnibase start");
  });
});
