import { pgTableCreator, uuid, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Create tables with balikin_ prefix and app_id for multi-tenant Supabase
const pgTable = pgTableCreator((name) => `balikin_${name}`);

// Better Auth Tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  appId: text('app_id').default('balikin_id').notNull(),
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
  appId: text('app_id').default('balikin_id').notNull(),
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
  appId: text('app_id').default('balikin_id').notNull(),
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
  appId: text('app_id').default('balikin_id').notNull(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const stickerOrders = pgTable('sticker_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  appId: text('app_id').default('balikin_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  status: text('status').default('pending_payment').notNull(),
  paymentStatus: text('payment_status').default('pending').notNull(),
  paymentMethod: text('payment_method').default('manual_qris').notNull(),
  productType: text('product_type').default('sticker').notNull(),
  recipientName: text('recipient_name').notNull(),
  phone: text('phone').notNull(),
  addressLine: text('address_line').notNull(),
  city: text('city').notNull(),
  postalCode: text('postal_code').notNull(),
  notes: text('notes'),
  packQuantity: integer('pack_quantity').default(1).notNull(),
  unitCountPerPack: integer('unit_count_per_pack').default(6).notNull(),
  totalAmount: integer('total_amount').notNull(),
  paymentProofUrl: text('payment_proof_url'),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tagBundles = pgTable('tag_bundles', {
  id: uuid('id').primaryKey().defaultRandom(),
  appId: text('app_id').default('balikin_id').notNull(),
  orderId: uuid('order_id').notNull().references(() => stickerOrders.id, { onDelete: 'cascade' }),
  productType: text('product_type').default('sticker').notNull(),
  itemCount: integer('item_count').default(6).notNull(),
  status: text('status').default('ready_for_fulfillment').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  appId: text('app_id').default('balikin_id').notNull(),
  slug: text('slug').unique().notNull(),
  ownerId: text('owner_id'),
  bundleId: uuid('bundle_id').references(() => tagBundles.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  status: text('status').default('normal').notNull(),
  contactWhatsapp: text('contact_whatsapp'),
  customMessage: text('custom_message'),
  rewardNote: text('reward_note'),
  tier: text('tier').default('free').notNull(),
  productType: text('product_type').default('free').notNull(),
  isVerified: boolean('is_verified').default(false),
  emailAlertsEnabled: boolean('email_alerts_enabled').default(true).notNull(),
  whatsappAlertsEnabled: boolean('whatsapp_alerts_enabled').default(false).notNull(),
  lastAlertSentAt: timestamp('last_alert_sent_at'),
  claimedAt: timestamp('claimed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tagsRelations = relations(tags, ({ many, one }) => ({
  scanLogs: many(scanLogs),
  notificationLogs: many(notificationLogs),
  bundle: one(tagBundles, {
    fields: [tags.bundleId],
    references: [tagBundles.id],
  }),
}));

export const stickerOrdersRelations = relations(stickerOrders, ({ one, many }) => ({
  user: one(user, {
    fields: [stickerOrders.userId],
    references: [user.id],
  }),
  bundles: many(tagBundles),
}));

export const tagBundlesRelations = relations(tagBundles, ({ one, many }) => ({
  order: one(stickerOrders, {
    fields: [tagBundles.orderId],
    references: [stickerOrders.id],
  }),
  tags: many(tags),
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
  deviceInfo: text('device_info'),
});

export const scanLogsRelations = relations(scanLogs, ({ one, many }) => ({
  tag: one(tags, {
    fields: [scanLogs.tagId],
    references: [tags.id],
  }),
  notificationLogs: many(notificationLogs),
}));

export const notificationLogs = pgTable('notification_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  appId: text('app_id').default('balikin_id').notNull(),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }),
  scanLogId: uuid('scan_log_id').references(() => scanLogs.id, { onDelete: 'cascade' }),
  channel: text('channel').notNull(),
  provider: text('provider').notNull(),
  status: text('status').notNull(),
  errorMessage: text('error_message'),
  providerMessageId: text('provider_message_id'),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const notificationLogsRelations = relations(notificationLogs, ({ one }) => ({
  tag: one(tags, {
    fields: [notificationLogs.tagId],
    references: [tags.id],
  }),
  scanLog: one(scanLogs, {
    fields: [notificationLogs.scanLogId],
    references: [scanLogs.id],
  }),
}));

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type ScanLog = typeof scanLogs.$inferSelect;
export type NewScanLog = typeof scanLogs.$inferInsert;
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type StickerOrder = typeof stickerOrders.$inferSelect;
export type NewStickerOrder = typeof stickerOrders.$inferInsert;
export type TagBundle = typeof tagBundles.$inferSelect;
export type NewTagBundle = typeof tagBundles.$inferInsert;
export type NotificationLog = typeof notificationLogs.$inferSelect;
export type NewNotificationLog = typeof notificationLogs.$inferInsert;
