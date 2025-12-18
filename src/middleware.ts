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
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!userId) {
      // Not authenticated - redirect to sign-in
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    const role = (sessionClaims?.publicMetadata as any)?.role as string;
    console.log('🔐 Admin route access attempt:', {
      path: req.nextUrl.pathname,
      userId,
      role,
      publicMetadata: sessionClaims?.publicMetadata,
    });

    // Only allow ADMIN role to access admin routes
    if (role !== 'ADMIN') {
      console.log('❌ Access denied - user role is not ADMIN');
      // Redirect based on their actual role
      if (role === 'STUDENT') {
        return NextResponse.redirect(new URL('/student', req.url));
      } else if (role === 'INSTRUCTOR') {
        return NextResponse.redirect(new URL('/instructor', req.url));
      } else {
        // Unknown role or no role - redirect to home
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
  }

  // Check role-based access for instructor routes
  if (req.nextUrl.pathname.startsWith('/instructor') && userId) {
    const role = (sessionClaims?.publicMetadata as any)?.role as string;
    if (role !== 'INSTRUCTOR' && role !== 'ADMIN') {
      // Redirect based on their actual role
      if (role === 'STUDENT') {
        return NextResponse.redirect(new URL('/student', req.url));
      } else {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
  }

  // Check role-based access for student routes
  if (req.nextUrl.pathname.startsWith('/student') && userId) {
    const role = (sessionClaims?.publicMetadata as any)?.role as string;
    console.log('🎓 Student route access attempt:', {
      path: req.nextUrl.pathname,
      userId,
      role,
      publicMetadata: sessionClaims?.publicMetadata,
    });
    if (role !== 'STUDENT' && role !== 'ADMIN') {
      console.log('❌ Access denied - user role is not STUDENT');
      // Redirect based on their actual role
      if (role === 'INSTRUCTOR') {
        return NextResponse.redirect(new URL('/instructor', req.url));
      } else {
        return NextResponse.redirect(new URL('/', req.url));
      }
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
