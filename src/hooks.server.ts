import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth.js';
import { getLoginUrl, getApplicationUrl } from '$lib/utils';
import { publicRoutes } from '$lib/utils'



const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);
	
	// Check if the path is a public route
	const isPublicRoute = publicRoutes.some(route => 
		event.url.pathname === route || event.url.pathname.startsWith(route + '/')
	);
	
	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		
		// If not a public route and no session token, redirect to login
		if (!isPublicRoute) {
			return Response.redirect(new URL(getLoginUrl(), event.url.origin), 302);
		}
		
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);
	
	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
		
		// If not a public route and session is invalid, redirect to login
		if (!isPublicRoute) {
			return Response.redirect(new URL(getLoginUrl(), event.url.origin), 302);
		}
	}

	event.locals.user = user;
	event.locals.session = session;
	
	// If trying to access login page with valid session, redirect to app
	if (event.url.pathname === '/auth/login' && user) {
		return Response.redirect(new URL(getApplicationUrl(), event.url.origin), 302);
	}

	return resolve(event);
};

export const handle: Handle = handleAuth;
