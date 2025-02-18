import { pgTable, serial, text, integer, timestamp, varchar, numeric } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

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

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

export type Security = typeof securityMaster.$inferSelect;
