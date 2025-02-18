import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { securityMaster } from '$lib/server/db/schema';
import { or, eq } from 'drizzle-orm';

export async function GET({ url }) {
    const symbol = url.searchParams.get('q');
    
    if (!symbol) {
        return json({ matches: [] });
    }

    const matches = await db.select().from(securityMaster).where(
        or(
            eq(securityMaster.symbol, symbol),
            eq(securityMaster.name, symbol)
        )
    );

    const formattedMatches = matches.map(security => ({
        "1. symbol": security.symbol,
        "2. name": security.name,
        "3. type": "",
        "4. region": security.country,
        "5. marketOpen": "",
        "6. marketClose": "",
        "7. timezone": "",
        "8. currency": "",
        "9. matchScore": ""
    }));

    return json({ matches: formattedMatches });
} 