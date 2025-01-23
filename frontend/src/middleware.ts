import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = ['/dashboard'];

export function middleware(request: NextRequest) {
	const accessToken = request.cookies.get('accessToken')?.value;

	// If the user tries to access a protected route without a valid access token, redirect to login
	if (protectedRoutes.includes(request.nextUrl.pathname) && !accessToken) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	// If the user is logged in and tries to access the login page, redirect to dashboard
	if (request.nextUrl.pathname === '/login' && accessToken) {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	return NextResponse.next();
}