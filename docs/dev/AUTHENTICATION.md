# Authentication System Documentation

This document provides a technical overview of the authentication system implemented in the LosingAlpha platform.

## Table of Contents
- [Authentication System Documentation](#authentication-system-documentation)
  - [Table of Contents](#table-of-contents)
  - [Architecture Overview](#architecture-overview)
  - [Authentication Flow](#authentication-flow)
  - [Server-Side Implementation](#server-side-implementation)
    - [Hooks](#hooks)
    - [Session Management](#session-management)
    - [Protected Routes](#protected-routes)
  - [Client-Side Implementation](#client-side-implementation)
    - [Authentication Store](#authentication-store)
    - [Root Layout](#root-layout)
  - [Authentication Components](#authentication-components)
    - [Auth Guard](#auth-guard)
    - [Navigation Bar](#navigation-bar)
  - [Session Management](#session-management-1)
  - [Route Protection](#route-protection)
  - [Extending the System](#extending-the-system)
    - [Adding New Protected Routes](#adding-new-protected-routes)
    - [Adding New Public Routes](#adding-new-public-routes)
    - [Adding Role-Based Access Control](#adding-role-based-access-control)

## Architecture Overview

The authentication system in LosingAlpha is built on SvelteKit's server-side and client-side capabilities:

- **Server-side authentication**: Implemented using SvelteKit hooks and server-side load functions
- **Client-side authentication**: Implemented using Svelte stores and reactive state management
- **Session management**: Uses HTTP-only cookies for secure session storage
- **Route protection**: Combines server-side and client-side checks to protect routes

## Authentication Flow

1. **Login**:
   - User submits credentials via the login form
   - Server validates credentials against the database
   - If valid, server creates a session and sets a session cookie
   - User is redirected to the application

2. **Session Validation**:
   - On each request, the server checks for a valid session cookie
   - If valid, the user information is attached to `event.locals`
   - If invalid or missing on protected routes, user is redirected to login

3. **Logout**:
   - User clicks logout
   - Server invalidates the session and clears the cookie
   - User is redirected to login

## Server-Side Implementation

### Hooks

The main authentication logic is implemented in `src/hooks.server.ts`:

```typescript
// Define public routes that don't require authentication
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/terms',
  '/privacy'
];

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
    return Response.redirect(new URL('/demo', event.url.origin), 302);
  }

  return resolve(event);
};
```

### Session Management

Sessions are managed in `$lib/server/auth.ts`:

- `generateSessionToken()`: Creates a secure random token
- `createSession()`: Stores a new session in the database
- `validateSessionToken()`: Validates and refreshes sessions
- `invalidateSession()`: Removes a session from the database
- `setSessionTokenCookie()`: Sets the session cookie
- `deleteSessionTokenCookie()`: Removes the session cookie

### Protected Routes

For additional protection, sensitive routes have server-side load functions:

```typescript
// src/routes/demo/+layout.server.ts
export const load: LayoutServerLoad = async ({ locals }) => {
  // This is a protected route, so redirect to login if not authenticated
  if (!locals.user) {
    throw redirect(302, getLoginUrl());
  }
  
  return {
    user: locals.user
  };
};
```

## Client-Side Implementation

### Authentication Store

The client-side authentication state is managed in `$lib/stores/auth.ts`:

```typescript
// Create a writable store for the user
const userStore = writable<User | null>(null);

// Create a derived store for authentication status
const isAuthenticated: Readable<boolean> = derived(
  userStore,
  $user => !!$user
);

// Set the current user
function setUser(newUser: User | null) {
  userStore.set(newUser);
}

// Check if the user should be redirected based on auth status
function checkAuthRedirect(currentPath: string) {
  let shouldRedirect = false;
  isAuthenticated.subscribe(isAuth => {
    const redirectUrl = getAuthRedirect(isAuth, currentPath);
    if (redirectUrl) {
      goto(redirectUrl);
      shouldRedirect = true;
    }
  })();
  return shouldRedirect;
}
```

### Root Layout

The root layout (`src/routes/+layout.svelte`) initializes the authentication state:

```typescript
// Update the auth store when data changes
$effect(() => {
  if (data.user) {
    authStore.setUser(data.user);
  }
});

// Check for redirects on mount and when the path changes
onMount(() => {
  // Check auth on initial load
  authStore.checkAuthRedirect($page.url.pathname);
  
  // Subscribe to page changes
  unsubscribe = page.subscribe(($page) => {
    authStore.checkAuthRedirect($page.url.pathname);
  });
});
```

## Authentication Components

### Auth Guard

The `AuthGuard` component conditionally renders content based on authentication status:

```svelte
<script lang="ts">
  import { isAuthenticated } from '$lib/stores/auth';
  
  let { fallback = null, children } = $props();
  
  // Subscribe to the isAuthenticated store
  let isAuth = false;
  isAuthenticated.subscribe(value => {
    isAuth = value;
  });
</script>

{#if isAuth}
  {@render children()}
{:else if fallback}
  {@render fallback()}
{/if}
```

### Navigation Bar

The `NavBar` component shows different options based on authentication status:

```svelte
<script lang="ts">
  import { isAuthenticated, logout } from '$lib/stores/auth';
  
  let isAuth = false;
  isAuthenticated.subscribe(value => {
    isAuth = value;
  });
  
  function handleLogout() {
    logout();
  }
</script>

<nav>
  <!-- Navigation links -->
  {#if isAuth}
    <Button onclick={handleLogout}>Sign Out</Button>
  {:else}
    <Button href="/auth/login">Sign In</Button>
  {/if}
</nav>
```

## Session Management

Sessions are stored in the database with the following structure:

- `id`: Hashed session token
- `userId`: Reference to the user
- `expiresAt`: Expiration timestamp (30 days from creation/refresh)

Sessions are automatically refreshed if they're within 15 days of expiration.

## Route Protection

Routes are protected through multiple mechanisms:

1. **Server-side hooks**: Redirect unauthenticated requests to login
2. **Server-side load functions**: Additional protection for sensitive routes
3. **Client-side redirects**: Prevent UI from showing protected routes
4. **Auth Guard component**: Conditionally render UI elements

## Extending the System

### Adding New Protected Routes

To add a new protected route:

1. The route is automatically protected by the server-side hook
2. For additional protection, add a load function:

```typescript
export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, getLoginUrl());
  }
  return { user: locals.user };
};
```

### Adding New Public Routes

To add a new public route, update the `publicRoutes` array in `src/hooks.server.ts`:

```typescript
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/terms',
  '/privacy',
  '/your-new-public-route'
];
```

### Adding Role-Based Access Control

To implement role-based access:

1. Add a `role` field to the user model
2. Extend the auth hooks to check roles:

```typescript
if (!isPublicRoute) {
  // Check if route requires specific role
  const requiredRole = getRequiredRole(event.url.pathname);
  if (requiredRole && user?.role !== requiredRole) {
    return Response.redirect(new URL('/unauthorized', event.url.origin), 302);
  }
}
```

3. Create a utility function to map routes to required roles 