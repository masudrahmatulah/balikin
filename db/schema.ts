import { pgTableCreator, uuid, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Create tables with balikin_ prefix and app_id for multi-tenant Supabase
const pgTable = pgTableCreator((name) => `balikin_${name}`);

// Better Auth Tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  app_id: text('app_id').default('balikin_id').notNull(),
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
  app_id: text('app_id').default('balikin_id').notNull(),
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
  app_id: text('app_id'), // Make nullable - Better Auth doesn't populate this field
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'), // Better Auth required field
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'), // Better Auth required field
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  app_id: text('app_id').default('balikin_id').notNull(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const stickerOrders = pgTable('sticker_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
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
  app_id: text('app_id').default('balikin_id').notNull(),
  orderId: uuid('order_id').notNull().references(() => stickerOrders.id, { onDelete: 'cascade' }),
  productType: text('product_type').default('sticker').notNull(),
  itemCount: integer('item_count').default(6).notNull(),
  status: text('status').default('ready_for_fulfillment').notNull(),
  // Sticker template configuration
  stickerShape: text('sticker_shape').default('circle').notNull(), // 'circle' | 'square' | 'rectangle'
  stickerSize: text('sticker_size').default('medium').notNull(),   // 'small' | 'medium' | 'large'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
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
  hasTabTwoEnabled: boolean('has_tab_two_enabled').default(false),
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
  app_id: text('app_id').default('balikin_id').notNull(),
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
  app_id: text('app_id').default('balikin_id').notNull(),
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

// ============================================================================
// DUAL-TAB FEATURE TABLES
// ============================================================================

// Emergency medical information for Tab 1 (Public display)
export const emergencyInformation = pgTable('emergency_information', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  bloodType: text('blood_type'), // A, B, AB, O
  allergies: text('allergies'), // Free text
  medicalConditions: text('medical_conditions'), // Free text
  emergencyContact: text('emergency_contact'), // Phone number
  emergencyContactName: text('emergency_contact_name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const emergencyInformationRelations = relations(emergencyInformation, ({ one }) => ({
  tag: one(tags, {
    fields: [emergencyInformation.tagId],
    references: [tags.id],
  }),
}));

// User module selections for Tab 2 (Private modules)
export const userModuleSelections = pgTable('user_module_selections', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  moduleType: text('module_type').notNull(), // 'student' | 'otomotif' | 'pertanian' | 'diklat'
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userModuleSelectionsRelations = relations(userModuleSelections, ({ one }) => ({
  user: one(user, {
    fields: [userModuleSelections.userId],
    references: [user.id],
  }),
}));

// User module permissions - admin control for module access
export const userModulePermissions = pgTable('user_module_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  moduleType: text('module_type').notNull(), // 'student' | 'otomotif' | 'pertanian' | 'diklat'
  isEnabled: boolean('is_enabled').default(false).notNull(),
  grantedBy: text('granted_by').references(() => user.id, { onDelete: 'set null' }), // Admin who granted access
  grantedAt: timestamp('granted_at'),
  reason: text('reason'), // Optional reason for granting/revoking
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userModulePermissionsRelations = relations(userModulePermissions, ({ one }) => ({
  user: one(user, {
    fields: [userModulePermissions.userId],
    references: [user.id],
  }),
  grantedByUser: one(user, {
    fields: [userModulePermissions.grantedBy],
    references: [user.id],
  }),
}));

// Module requests - user-initiated module access requests
export const moduleRequests = pgTable('module_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  moduleType: text('module_type').notNull(), // 'student' | 'otomotif' | 'pertanian' | 'diklat'
  status: text('status').default('pending').notNull(), // 'pending' | 'approved' | 'rejected'
  requestedAt: timestamp('requested_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: text('reviewed_by').references(() => user.id, { onDelete: 'set null' }),
  reason: text('reason'), // User's reason for requesting
  rejectionReason: text('rejection_reason'), // Admin's reason for rejection
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const moduleRequestsRelations = relations(moduleRequests, ({ one }) => ({
  user: one(user, {
    fields: [moduleRequests.userId],
    references: [user.id],
  }),
  reviewer: one(user, {
    fields: [moduleRequests.reviewedBy],
    references: [user.id],
  }),
}));

// Module usage analytics - track module activations for analytics
export const moduleUsageAnalytics = pgTable('module_usage_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  moduleType: text('module_type').notNull(), // 'student' | 'otomotif' | 'pertanian' | 'diklat'
  actionType: text('action_type').notNull(), // 'activate' | 'deactivate'
  performedBy: text('performed_by').references(() => user.id, { onDelete: 'set null' }), // Admin user ID
  createdAt: timestamp('created_at').defaultNow(),
});

export const moduleUsageAnalyticsRelations = relations(moduleUsageAnalytics, ({ one }) => ({
  user: one(user, {
    fields: [moduleUsageAnalytics.userId],
    references: [user.id],
  }),
  performer: one(user, {
    fields: [moduleUsageAnalytics.performedBy],
    references: [user.id],
  }),
}));

// Student Kit module data
export const studentKitData = pgTable('student_kit_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  classSchedule: text('class_schedule'), // JSON string
  assignmentDeadlines: text('assignment_deadlines'), // JSON string
  driveLinks: text('drive_links'), // JSON string
  ktmKrsPhotos: text('ktm_krs_photos'), // JSON array of URLs
  // vCard data for professional networking
  vcardData: text('vcard_data'), // JSON string: { fullName, title, email, phone, linkedinUrl, portfolioUrl, githubUrl, bio }
  vcardShareCode: text('vcard_share_code'), // Unique code for public vCard sharing
  // WhatsApp notification settings for deadline reminders
  whatsappNotificationsEnabled: boolean('whatsapp_notifications_enabled').default(false),
  notificationPhoneNumber: text('notification_phone_number'), // Phone number for reminders (if different from account)
  lastNotificationSentAt: timestamp('last_notification_sent_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const studentKitDataRelations = relations(studentKitData, ({ one }) => ({
  user: one(user, {
    fields: [studentKitData.userId],
    references: [user.id],
  }),
}));

// Student Kit Schedule Shares - for sharing schedules between students
export const studentKitScheduleShares = pgTable('student_kit_schedule_shares', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  shareCode: text('share_code').unique().notNull(), // Unique code for sharing
  classSchedule: text('class_schedule').notNull(), // JSON string
  assignmentDeadlines: text('assignment_deadlines').notNull(), // JSON string
  driveLinks: text('drive_links').notNull(), // JSON string
  expiresAt: timestamp('expires_at').notNull(), // Share link expiry
  createdAt: timestamp('created_at').defaultNow(),
});

export const studentKitScheduleSharesRelations = relations(studentKitScheduleShares, ({ one }) => ({
  user: one(user, {
    fields: [studentKitScheduleShares.userId],
    references: [user.id],
  }),
}));

// Otomotif module data
export const otomotifData = pgTable('otomotif_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  stnkNumber: text('stnk_number'),
  stnkExpiryDate: timestamp('stnk_expiry_date'),
  oilChangeSchedule: text('oil_change_schedule'), // JSON string
  serviceHistory: text('service_history'), // JSON string
  insuranceNumber: text('insurance_number'),
  insuranceProvider: text('insurance_provider'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const otomotifDataRelations = relations(otomotifData, ({ one }) => ({
  user: one(user, {
    fields: [otomotifData.userId],
    references: [user.id],
  }),
}));

// Pertanian module data
export const pertanianData = pgTable('pertanian_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  hstCalculator: text('hst_calculator'), // JSON string
  fertilizerSchedule: text('fertilizer_schedule'), // JSON string
  harvestLog: text('harvest_log'), // JSON string
  laborCostNotes: text('labor_cost_notes'), // JSON string
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const pertanianDataRelations = relations(pertanianData, ({ one }) => ({
  user: one(user, {
    fields: [pertanianData.userId],
    references: [user.id],
  }),
}));

// Diklat B2B module data
export const diklatData = pgTable('diklat_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  eventId: text('event_id'), // For B2B event grouping
  attendeeName: text('attendee_name'),
  attendanceStatus: text('attendance_status'), // 'checked_in' | 'pending'
  rundownSchedule: text('rundown_schedule'), // JSON string
  materialLinks: text('material_links'), // JSON string
  certificateUrl: text('certificate_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const diklatDataRelations = relations(diklatData, ({ one }) => ({
  tag: one(tags, {
    fields: [diklatData.tagId],
    references: [tags.id],
  }),
}));

// Document storage metadata (files stored in Vercel Blob)
export const tagDocuments = pgTable('tag_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }),
  moduleType: text('module_type').notNull(), // 'student' | 'otomotif' | 'pertanian'
  documentType: text('document_type').notNull(), // 'ktm' | 'krs' | 'stnk' | 'certificate' etc
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(), // Vercel Blob URL
  fileSize: integer('file_size'), // bytes
  mimeType: text('mime_type'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tagDocumentsRelations = relations(tagDocuments, ({ one }) => ({
  user: one(user, {
    fields: [tagDocuments.userId],
    references: [user.id],
  }),
  tag: one(tags, {
    fields: [tagDocuments.tagId],
    references: [tags.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

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
export type EmergencyInformation = typeof emergencyInformation.$inferSelect;
export type NewEmergencyInformation = typeof emergencyInformation.$inferInsert;
export type UserModuleSelection = typeof userModuleSelections.$inferSelect;
export type NewUserModuleSelection = typeof userModuleSelections.$inferInsert;
export type StudentKitData = typeof studentKitData.$inferSelect;
export type NewStudentKitData = typeof studentKitData.$inferInsert;
export type StudentKitScheduleShares = typeof studentKitScheduleShares.$inferSelect;
export type NewStudentKitScheduleShares = typeof studentKitScheduleShares.$inferInsert;
export type OtomotifData = typeof otomotifData.$inferSelect;
export type NewOtomotifData = typeof otomotifData.$inferInsert;
export type PertanianData = typeof pertanianData.$inferSelect;
export type NewPertanianData = typeof pertanianData.$inferInsert;
export type DiklatData = typeof diklatData.$inferSelect;
export type NewDiklatData = typeof diklatData.$inferInsert;
export type TagDocument = typeof tagDocuments.$inferSelect;
export type NewTagDocument = typeof tagDocuments.$inferInsert;
export type UserModulePermission = typeof userModulePermissions.$inferSelect;
export type NewUserModulePermission = typeof userModulePermissions.$inferInsert;
export type ModuleRequest = typeof moduleRequests.$inferSelect;
export type NewModuleRequest = typeof moduleRequests.$inferInsert;
export type ModuleUsageAnalytics = typeof moduleUsageAnalytics.$inferSelect;
export type NewModuleUsageAnalytics = typeof moduleUsageAnalytics.$inferInsert;
