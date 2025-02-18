# Security Master Data Management

## Overview
The Security Master is a core component of our system that maintains a comprehensive database of financial instruments. It serves as the single source of truth for security information across the application.

## Database Schema
The security master data is stored in the `security_master` table with the following structure:

```typescript
export const securityMaster = pgTable('security_master', {
    id: serial('id').primaryKey(),
    symbol: varchar('symbol', { length: 10 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    lastSale: numeric('last_sale', { precision: 18, scale: 4 }),
    netChange: numeric('net_change', { precision: 18, scale: 4 }),
    percentChange: numeric('percent_change', { precision: 10, scale: 4 }),
    marketCap: numeric('market_cap', { precision: 24, scale: 2 }),
    country: varchar('country', { length: 100 }),
    ipoYear: integer('ipo_year'),
    volume: integer('volume'),
    sector: varchar('sector', { length: 100 }),
    industry: varchar('industry', { length: 255 }),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

## Initial Setup

### 1. Database Migration
Before importing data, you need to create the security_master table in your database:

1. First, generate the migration:
   ```bash
   pnpm db:migrate
   ```

2. Then, push the changes to your database:
   ```bash
   pnpm db:push
   ```

3. (Optional) You can verify the changes using Drizzle Studio:
   ```bash
   pnpm db:studio
   ```

## Data Import Process
We maintain a script to import security data from NASDAQ's listed securities CSV file. The script is located at `scripts/import-securities.ts`.

### Prerequisites
- Node.js and pnpm installed
- PostgreSQL database running and migrated
- NASDAQ listed securities CSV file

### CSV Format
The script expects a CSV file with the following headers:
```
Symbol,Name,Last Sale,Net Change,% Change,Market Cap,Country,IPO Year,Volume,Sector,Industry
```

### Running the Import
1. Place the NASDAQ CSV file in the `data` directory as `nasdaq-listed.csv`
2. Run the import script:
   ```bash
   pnpm import-securities
   ```

### Import Process Details
1. The script reads the CSV file using the `csv-parse` package
2. Data is processed in chunks of 100 records to prevent memory issues
3. For each record:
   - Data is cleaned (removing $, commas, % symbols)
   - Numbers are parsed appropriately
   - Null values are handled
4. Records are inserted using an UPSERT operation:
   - New records are inserted
   - Existing records (matched by symbol) are updated
   - Timestamps are automatically updated

### Error Handling
- The script includes error handling for both CSV parsing and database operations
- Errors are logged to the console
- Processing continues even if individual records fail

## API Integration
The security master data is used by various parts of the application:

1. Ticker Search Component (`ticker-selector.svelte`)
   - Provides typeahead search functionality
   - Returns symbol, name, and other metadata
   - Used for security selection throughout the application

2. Market Data Integration
   - Reduces API calls to external providers
   - Provides basic security information without additional lookups

## Future Improvements
1. Add data validation rules
2. Implement data quality checks
3. Add support for other security types
4. Create an admin interface for manual data corrections
5. Add more extensive error logging
6. Implement automated daily updates

## Maintenance
- Regular updates should be performed to maintain accurate pricing and company information
- Consider implementing automated updates using NASDAQ's API
- Monitor database size and performance
- Regularly backup the security master data 