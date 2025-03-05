import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getLoginUrl } from '$lib/utils';

export const load: LayoutServerLoad = async ({ locals }) => {
  // This is a protected route, so redirect to login if not authenticated
  if (!locals.user) {
    throw redirect(302, getLoginUrl());
  }
  
  return {
    user: locals.user
  };
}; 