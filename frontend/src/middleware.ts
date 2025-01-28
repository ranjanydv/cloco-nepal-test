import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes - expand this array as needed
const protectedRoutes = ['/dashboard', '/profile', '/settings'];

export function middleware(request: NextRequest) {
	const accessToken = request.cookies.get('accessToken')?.value;

	// Check if the path starts with any protected route
	const isProtectedRoute = protectedRoutes.some(route =>
		request.nextUrl.pathname.startsWith(route)
	);

	// If the user tries to access a protected route without a valid access token, redirect to login
	if (isProtectedRoute && !accessToken) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	// If the user is logged in and tries to access the login page, redirect to dashboard
	if (request.nextUrl.pathname === '/login' && accessToken) {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	return NextResponse.next();
}