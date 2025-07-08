import { db } from '$lib/server/db';
import { securityMaster } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { symbol } = params;
  
  // Fetch the specific security by symbol
  const [security] = await db
    .select()
    .from(securityMaster)
    .where(eq(securityMaster.symbol, symbol));
  
  if (!security) {
    throw error(404, `Security with symbol ${symbol} not found`);
  }
  
  return {
    security
  };
};
