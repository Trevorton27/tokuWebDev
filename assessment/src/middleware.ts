import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/', '/assessment(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)']);
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/internal(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    // Only enforce authentication here — role check is handled in the admin layout
    // via requireAdmin() which reads publicMetadata through the full Clerk server API
    await auth.protect();
  } else if (!isPublicRoute(req) && isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
};
