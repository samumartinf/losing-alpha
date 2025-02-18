import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { db } from '$lib/server/db';
import { securityMaster } from '$lib/server/db/schema';
import { resolve } from 'path';
import { sql } from 'drizzle-orm';

interface SecurityData {
    Symbol: string;
    Name: string;
    'Last Sale': string;
    'Net Change': string;
    '% Change': string;
    'Market Cap': string;
    Country: string;
    'IPO Year': string;
    Volume: string;
    Sector: string;
    Industry: string;
}

export async function importSecurities() {
    const csvFilePath = resolve('data/nasdaq-listed.csv');
    const parser = parse({
        delimiter: ',',
        columns: true,
        skip_empty_lines: true
    });

    const records: SecurityData[] = [];

    createReadStream(csvFilePath)
        .pipe(parser)
        .on('data', (data: SecurityData) => records.push(data))
        .on('end', async () => {
            console.log(`Parsed ${records.length} records from CSV`);

            try {
                // Process records in chunks to avoid overwhelming the database
                const chunkSize = 100;
                for (let i = 0; i < records.length; i += chunkSize) {
                    const chunk = records.slice(i, i + chunkSize);
                    const values = chunk.map(record => {
                        const lastSale = record['Last Sale'].replace('$', '');
                        const marketCap = record['Market Cap'].replace(/,/g, '');
                        const volume = record.Volume.replace(/,/g, '');
                        const percentChange = record['% Change'].replace('%', '');

                        return {
                            symbol: record.Symbol,
                            name: record.Name,
                            lastSale: lastSale ? lastSale : null,
                            netChange: record['Net Change'] ? record['Net Change'] : null,
                            percentChange: percentChange ? percentChange : null,
                            marketCap: marketCap ? marketCap : null,
                            country: record.Country || null,
                            ipoYear: record['IPO Year'] ? parseInt(record['IPO Year']) : null,
                            volume: volume ? parseInt(volume) : null,
                            sector: record.Sector || null,
                            industry: record.Industry || null
                        };
                    });

                    await db.insert(securityMaster).values(values)
                        .onConflictDoUpdate({
                            target: securityMaster.symbol,
                            set: {
                                name: sql`EXCLUDED.name`,
                                lastSale: sql`EXCLUDED.last_sale`,
                                netChange: sql`EXCLUDED.net_change`,
                                percentChange: sql`EXCLUDED.percent_change`,
                                marketCap: sql`EXCLUDED.market_cap`,
                                country: sql`EXCLUDED.country`,
                                ipoYear: sql`EXCLUDED.ipo_year`,
                                volume: sql`EXCLUDED.volume`,
                                sector: sql`EXCLUDED.sector`,
                                industry: sql`EXCLUDED.industry`,
                                updatedAt: sql`CURRENT_TIMESTAMP`
                            }
                        });

                    console.log(`Imported records ${i + 1} to ${i + chunk.length}`);
                }

                console.log('Import completed successfully');
            } catch (error) {
                console.error('Error importing data:', error);
            }
            
        });
}

// importSecurities().catch(console.error); 