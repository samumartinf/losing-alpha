import { goto } from '$app/navigation';
import { getAuthRedirect } from '$lib/utils';
import { derived, writable, type Readable } from 'svelte/store';

// Define the user type
type User = {
  id: string;
  username: string;
  // Add other user properties as needed
};

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

// Get the current user
function getUser(): User | null {
  let currentUser: User | null = null;
  userStore.subscribe(value => {
    currentUser = value;
  })();
  return currentUser;
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

// Logout function
function logout() {
  // This will trigger the server-side logout action
  goto('/auth?/logout');
}

export { userStore as user, isAuthenticated, setUser, getUser, checkAuthRedirect, logout }; 