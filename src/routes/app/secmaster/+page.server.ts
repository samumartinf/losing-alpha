import { db } from '$lib/server/db';
import { securityMaster } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Fetch securities from the database
	// Limit to 1000 for performance, you might want to implement pagination
	const securities = await db.select().from(securityMaster).limit(1000);
	
	return {
		securities
	};
};
