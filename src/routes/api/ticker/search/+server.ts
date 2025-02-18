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
    ).limit(10);

    const formattedMatches = matches.map(security => ({
        "1. symbol": security.symbol,
        "2. name": security.name,
        "3. type": "EQUITY",
        "4. region": security.country || "US",
        "5. marketOpen": "09:30",
        "6. marketClose": "16:00",
        "7. timezone": "UTC-05",
        "8. currency": "USD",
        "9. matchScore": "1.0000"
    }));

    return json({ matches: formattedMatches });
} 