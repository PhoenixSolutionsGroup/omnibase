import { resolveRedirect } from './redirects';

interface Env {
  ASSETS: { fetch(request: Request | string): Promise<Response> };
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const target = resolveRedirect(url.pathname);
    if (target) {
      const location = target.endsWith('/') ? target : `${target}/`;
      return Response.redirect(new URL(location + url.search, url), 307);
    }

    const notFound = await env.ASSETS.fetch(new URL('/404/', url).toString());
    return new Response(notFound.body, {
      status: 404,
      headers: notFound.headers,
    });
  },
};

export default worker;
