import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const publicRoutes = [
	'/',
	'/auth/login',
	'/auth/register',
	'/terms',
	'/privacy'
]

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getLoginUrl() {
	return '/auth/login';
}

export function getApplicationUrl() {
	return '/app';
}

/**
 * Check if a route should be protected (requires authentication)
 * @param path The route path to check
 * @returns boolean indicating if the route requires authentication
 */
export function isProtectedRoute(path: string): boolean {
	return !publicRoutes.some(route => 
		path === route || path.startsWith(route + '/')
	);
}

/**
 * Redirects to login page if user is not authenticated
 * @param isAuthenticated Boolean indicating if user is authenticated
 * @param currentPath Current path the user is on
 * @returns The URL to redirect to, or null if no redirect is needed
 */
export function getAuthRedirect(isAuthenticated: boolean, currentPath: string): string | null {
	// If on a protected route and not authenticated, redirect to login
	if (!isAuthenticated && isProtectedRoute(currentPath)) {
		return getLoginUrl();
	}
	
	// If on login page and authenticated, redirect to app
	if (isAuthenticated && currentPath === getLoginUrl()) {
		return getApplicationUrl();
	}
	
	return null;
}
