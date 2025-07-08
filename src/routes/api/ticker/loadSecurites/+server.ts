import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { securityMaster } from '$lib/server/db/schema';
import { or, ilike } from 'drizzle-orm';

export async function GET({ url }) {
    const query = url.searchParams.get('q');
    
    if (!query || query.length < 2) {
        return json({ matches: [] });
    }

    const searchPattern = `%${query}%`;
    
    const matches = await db.select().from(securityMaster).where(
        or(
            ilike(securityMaster.symbol, searchPattern),
            ilike(securityMaster.name, searchPattern)
        )
    ).limit(100);
    
    return json({ matches: matches });
} 