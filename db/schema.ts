import { pgTableCreator, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Create tables with balikin_ prefix and app_id for multi-tenant Supabase
const pgTable = pgTableCreator((name) => `balikin_${name}`);

// Better Auth Tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  role: text('role').default('user').notNull(), // 'admin' | 'user'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  expiresAt: timestamp('expires_at'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  appId: text('app_id').default('balikin_id').notNull(),
  slug: text('slug').unique().notNull(),
  ownerId: text('owner_id'),
  name: text('name').notNull(),
  status: text('status').default('normal').notNull(),
  contactWhatsapp: text('contact_whatsapp'),
  customMessage: text('custom_message'),
  rewardNote: text('reward_note'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  scanLogs: many(scanLogs),
}));

export const scanLogs = pgTable('scan_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  appId: text('app_id').default('balikin_id').notNull(),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }),
  scannedAt: timestamp('scanned_at').defaultNow(),
  ipAddress: text('ip_address'),
  city: text('city'),
  latitude: text('latitude'),
  longitude: text('longitude'),
});

export const scanLogsRelations = relations(scanLogs, ({ one }) => ({
  tag: one(tags, {
    fields: [scanLogs.tagId],
    references: [tags.id],
  }),
}));

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type ScanLog = typeof scanLogs.$inferSelect;
export type NewScanLog = typeof scanLogs.$inferInsert;
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
