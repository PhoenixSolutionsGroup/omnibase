import { createOmniBaseMiddleware } from '@omnibase/nextjs/middleware';

export const middleware = createOmniBaseMiddleware(
    process.env.OMNIBASE_API_URL!,
    {
        tenant_check: true,
        tenant_check_paths: ['/'],
        tenant_check_redirect_url: '/auth/onboarding',
    }
);

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};