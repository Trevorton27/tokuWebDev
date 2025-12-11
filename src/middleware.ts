import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/instructor(.*)',
  '/student(.*)',
  '/courses(.*)',
  '/assessment(.*)',
  '/test-endpoints(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // If the route is protected and user is not authenticated, Clerk will redirect to sign-in
  if (isProtectedRoute(req) && !userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Check role-based access for admin routes
  if (req.nextUrl.pathname.startsWith('/admin') && userId) {
    const role = (sessionClaims?.publicMetadata as any)?.role as string || 'ADMIN';
    console.log('🔐 Admin route access attempt:', {
      path: req.nextUrl.pathname,
      userId,
      role,
      publicMetadata: sessionClaims?.publicMetadata,
    });
    // TEMPORARILY DISABLED - Fix Clerk keys first
     if (role !== 'ADMIN') {
       console.log('❌ Access denied - user role is not ADMIN');
       return NextResponse.redirect(new URL('/', req.url));
     }
  }

  // Check role-based access for instructor routes
  if (req.nextUrl.pathname.startsWith('/instructor') && userId) {
    const role = (sessionClaims?.publicMetadata as any)?.role as string || 'INSTRUCTOR';
    if (role !== 'INSTRUCTOR' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Check role-based access for student routes
  if (req.nextUrl.pathname.startsWith('/student') && userId) {
    const role = (sessionClaims?.publicMetadata as any)?.role as string || 'STUDENT';
    console.log('🎓 Student route access attempt:', {
      path: req.nextUrl.pathname,
      userId,
      role,
      publicMetadata: sessionClaims?.publicMetadata,
    });
    if (role !== 'STUDENT' && role !== 'ADMIN') {
      console.log('❌ Access denied - user role is not STUDENT');
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
