import createMiddleware from 'next-intl/middleware';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from '../i18n/routing';

const intlMiddleware = createMiddleware(routing);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isPublicRoute = createRouteMatcher([
  '/',
  '/services(.*)',
  '/blog(.*)',
  '/contact',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/unauthorized',
  '/api/graphql',
  '/es(.*)',
  '/en(.*)',
]);

const isClerkConfigured =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_placeholder';

function isIntlRoute(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  // Admin routes do not use i18n
  if (pathname.startsWith('/admin')) return false;
  // API routes do not use i18n
  if (pathname.startsWith('/api')) return false;
  // Next.js internals
  if (pathname.startsWith('/_next')) return false;
  // Static files
  if (pathname.match(/\.\w+$/)) return false;
  return true;
}

export default isClerkConfigured
  ? clerkMiddleware(async (auth, request) => {
      // Handle i18n for non-admin routes
      if (isIntlRoute(request)) {
        return intlMiddleware(request);
      }

      // Allow public routes
      if (isPublicRoute(request)) {
        return NextResponse.next();
      }

      // Protect admin routes
      if (isAdminRoute(request)) {
        const { userId, sessionClaims } = await auth();

        if (!userId) {
          const signInUrl = new URL('/sign-in', request.url);
          signInUrl.searchParams.set('redirect_url', request.url);
          return NextResponse.redirect(signInUrl);
        }

        const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
        if (role !== 'admin') {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }

      return NextResponse.next();
    })
  : function simpleMiddleware(request: NextRequest) {
      if (isIntlRoute(request)) {
        return intlMiddleware(request);
      }
      return NextResponse.next();
    };

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
