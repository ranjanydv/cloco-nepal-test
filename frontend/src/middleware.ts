import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard'];

export function middleware(request: NextRequest) {
	const accessToken = request.cookies.get('accessToken')?.value;

	const isProtectedRoute = protectedRoutes.some(route =>
		request.nextUrl.pathname.startsWith(route)
	);

	if (isProtectedRoute && !accessToken) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	if (request.nextUrl.pathname === '/login' && accessToken) {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	return NextResponse.next();
}