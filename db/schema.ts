import { pgTableCreator, uuid, text, timestamp, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { relations, desc } from 'drizzle-orm';

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
  role: text('role').default('user').notNull(), // 'admin' | 'editor' | 'user'
  division: text('division'), // 'production' | 'customer_service' | 'marketing' | 'admin' | null
  blogPermissions: jsonb('blog_permissions').default({ canCreatePosts: false, canEditOwnPosts: false, canPublishPosts: false, canModerateComments: false }).$type<{
    canCreatePosts?: boolean;
    canEditOwnPosts?: boolean;
    canEditAnyPost?: boolean;
    canPublishPosts?: boolean;
    canModerateComments?: boolean;
    canManageGiveaway?: boolean;
    canReviewStories?: boolean;
  }>(),
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
  stickerColorTheme: text('sticker_color_theme').default('navy-premium'),
  recipientName: text('recipient_name').notNull(),
  phone: text('phone').notNull(),
  addressLine: text('address_line').notNull(),
  city: text('city').notNull(),
  postalCode: text('postal_code').notNull(),
  notes: text('notes'),
  packQuantity: integer('pack_quantity').default(1).notNull(),
  unitCountPerPack: integer('unit_count_per_pack').default(6).notNull(),
  shippingCost: integer('shipping_cost').default(0).notNull(),
  shippingCourier: text('shipping_courier'), // 'jne' | 'tiki' | 'pos'
  destinationCityId: text('destination_city_id'), // RajaOngkir city ID
  destinationCityName: text('destination_city_name'),
  totalAmount: integer('total_amount').notNull(),
  // Acrylic backside design: default = Balikin logo; custom = customer-uploaded image (+Rp10.000/order)
  backsideCustom: boolean('backside_custom').default(false).notNull(),
  backsideCustomImageUrl: text('backside_custom_image_url'),
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

// Print Batches - Track A3 print sheets for physical QC codes (PRD v2)
export const printBatches = pgTable('print_batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  batchNumber: text('batch_number').unique().notNull(), // e.g., "B01-001"
  serialNumberRange: text('serial_number_range'), // "B01-001 to B01-100"
  totalStickers: integer('total_stickers').default(0).notNull(),
  status: text('status').default('pending').notNull(), // 'pending' | 'printing' | 'ready' | 'completed'
  printedAt: timestamp('printed_at'),
  completedAt: timestamp('completed_at'),
  createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const printBatchesRelations = relations(printBatches, ({ one, many }) => ({
	creator: one(user, {
		fields: [printBatches.createdBy],
		references: [user.id],
	}),
	tags: many(tags),
}));

// Sticker Sheets - Master Activation Key for VDP-stock sticker sheets (lazy activation).
// One physical A5 sheet (e.g. 4-20 QR tags) shares a single Master PIN; the first scan
// on a sheet activates it and claims ownership, subsequent scans on the same sheet
// bypass the PIN as long as the scanning user already owns the sheet.
export const stickerSheets = pgTable('sticker_sheets', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  sheetCode: text('sheet_code').unique().notNull(), // e.g. "BLK-PRO-B01-0001", printed small in sticker corner
  packageType: text('package_type').notNull(), // StickerProductKey: stiker-pro | stiker-daily | stiker-micro | stiker-family
  batchId: uuid('batch_id').references(() => printBatches.id, { onDelete: 'set null' }),
  activationPinHash: text('activation_pin_hash').notNull(),
  activationPinPlain: text('activation_pin_plain'), // Plain PIN for VDP/insert printing only
  status: text('status').default('inactive').notNull(), // 'inactive' | 'active'
  ownerId: text('owner_id').references(() => user.id, { onDelete: 'set null' }),
  claimedAt: timestamp('claimed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const stickerSheetsRelations = relations(stickerSheets, ({ one, many }) => ({
  batch: one(printBatches, {
    fields: [stickerSheets.batchId],
    references: [printBatches.id],
  }),
  owner: one(user, {
    fields: [stickerSheets.ownerId],
    references: [user.id],
  }),
  tags: many(tags),
}));

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  slug: text('slug').unique().notNull(),
  ownerId: text('owner_id'),
  bundleId: uuid('bundle_id').references(() => tagBundles.id, { onDelete: 'set null' }),
  // Activation security fields (PRD v2) - nullable for existing tags
  activationToken: text('activation_token'), // Plain token for QR generation
  activationTokenHash: text('activation_token_hash'), // SHA-256 hash for QR activation
  activationPinHash: text('activation_pin_hash'), // SHA-256 hash for PIN manual fallback
  activationPinPlain: text('activation_pin_plain'), // Plain PIN for VDP printing only
  serialNumber: text('serial_number'), // Physical QC code (e.g., "B01-042")
  isCustom: boolean('is_custom').default(false).notNull(), // Custom photo order flag
  customPhotoUrl: text('custom_photo_url'), // Vercel Blob URL for custom photo
  batchId: uuid('batch_id').references(() => printBatches.id, { onDelete: 'set null' }),
  sheetId: uuid('sheet_id').references(() => stickerSheets.id, { onDelete: 'set null' }), // VDP-stock sticker Master PIN sheet
  // Existing fields
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
  // Bundle support fields
  bundleType: text('bundle_type'), // 'student_kit' | 'otomotif' | 'pertanian' | 'diklat' | 'standard' | null
  autoActivateModule: text('auto_activate_module'), // 'student' | 'otomotif' | 'pertanian' | 'diklat' | null
  welcomeShown: boolean('welcome_shown').default(false),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  expiresAt: timestamp('expires_at'), // Free tier trial deadline; null for premium/lifetime tags
  createdAt: timestamp('created_at').defaultNow(),
});

export const tagUpgradeOrders = pgTable('tag_upgrade_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  paymentStatus: text('payment_status').default('pending').notNull(), // 'pending' | 'paid' | 'failed'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tagUpgradeOrdersRelations = relations(tagUpgradeOrders, ({ one }) => ({
  tag: one(tags, {
    fields: [tagUpgradeOrders.tagId],
    references: [tags.id],
  }),
  user: one(user, {
    fields: [tagUpgradeOrders.userId],
    references: [user.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many, one }) => ({
  owner: one(user, {
    fields: [tags.ownerId],
    references: [user.id],
  }),
  scanLogs: many(scanLogs),
  notificationLogs: many(notificationLogs),
  bundle: one(tagBundles, {
    fields: [tags.bundleId],
    references: [tagBundles.id],
  }),
  batch: one(printBatches, {
    fields: [tags.batchId],
    references: [printBatches.id],
  }),
  sheet: one(stickerSheets, {
    fields: [tags.sheetId],
    references: [stickerSheets.id],
  }),
  upgradeOrders: many(tagUpgradeOrders),
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
}, (table) => ({
  tagIdx: index('idx_scan_logs_tag_id').on(table.tagId),
}));

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
// ANONYMOUS CHAT SYSTEM (PRD v2)
// ============================================================================

// Chat Rooms - Manage anonymous chat sessions between owners and finders
export const chatRooms = pgTable('chat_rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').default(true).notNull(),
  finderFingerprint: text('finder_fingerprint'), // Optional: track anonymous finder session
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tagIdx: index('idx_chat_rooms_tag_id').on(table.tagId),
  activeIdx: index('idx_chat_rooms_active').on(table.isActive),
}));

// Messages - Store chat message history
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  roomId: uuid('room_id').notNull().references(() => chatRooms.id, { onDelete: 'cascade' }),
  senderType: text('sender_type').notNull(), // 'owner' | 'finder'
  messageText: text('message_text').notNull(),
  isReadByOwner: boolean('is_read_by_owner').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  roomIdx: index('idx_messages_room_id').on(table.roomId),
  createdAtIdx: index('idx_messages_created_at').on(table.createdAt),
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
export type PrintBatch = typeof printBatches.$inferSelect;
export type NewPrintBatch = typeof printBatches.$inferInsert;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type NewChatRoom = typeof chatRooms.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
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

// ============================================================================
// MODULE CONFIG & PURCHASE SYSTEM
// ============================================================================

// Module configuration - global settings for each module
export const moduleConfig = pgTable('module_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  moduleType: text('module_type').notNull().unique(), // 'student' | 'otomotif' | 'pertanian' | 'diklat'
  isEnabled: boolean('is_enabled').default(true).notNull(), // Global toggle - if false, no one can access
  price: integer('price').default(0).notNull(), // Price in rupiah (0 = free)
  isPaid: boolean('is_paid').default(false).notNull(), // Whether this module requires payment
  requiresApproval: boolean('requires_approval').default(true).notNull(), // Whether payment needs admin approval
  description: text('description'), // Module description for catalog
  features: text('features'), // JSON array of module features
  sortOrder: integer('sort_order').default(0).notNull(), // Display order in catalog
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const moduleConfigRelations = relations(moduleConfig, ({ many }) => ({
  purchaseOrders: many(modulePurchaseOrders),
}));

// Module purchase orders - user purchases of paid modules
export const modulePurchaseOrders = pgTable('module_purchase_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  moduleType: text('module_type').notNull(), // 'student' | 'otomotif' | 'pertanian' | 'diklat'
  status: text('status').default('pending_payment').notNull(), // 'pending_payment' | 'paid' | 'approved' | 'rejected' | 'cancelled'
  amount: integer('amount').notNull(), // Payment amount in rupiah
  paymentMethod: text('payment_method').default('manual_qris').notNull(), // 'manual_qris' | 'manual_transfer'
  paymentProofUrl: text('payment_proof_url'), // URL to payment proof image
  requestedAt: timestamp('requested_at').defaultNow(),
  paidAt: timestamp('paid_at'),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: text('reviewed_by').references(() => user.id, { onDelete: 'set null' }), // Admin who reviewed
  rejectionReason: text('rejection_reason'),
  whatsappNotificationSent: boolean('whatsapp_notification_sent').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const modulePurchaseOrdersRelations = relations(modulePurchaseOrders, ({ one }) => ({
  user: one(user, {
    fields: [modulePurchaseOrders.userId],
    references: [user.id],
  }),
  reviewer: one(user, {
    fields: [modulePurchaseOrders.reviewedBy],
    references: [user.id],
  }),
  moduleConfig: one(moduleConfig, {
    fields: [modulePurchaseOrders.moduleType],
    references: [moduleConfig.moduleType],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ModuleConfig = typeof moduleConfig.$inferSelect;
export type NewModuleConfig = typeof moduleConfig.$inferInsert;
export type ModulePurchaseOrder = typeof modulePurchaseOrders.$inferSelect;
export type NewModulePurchaseOrder = typeof modulePurchaseOrders.$inferInsert;

// ============================================================================
// ADMIN DASHBOARD TABLES
// ============================================================================

// Material inventory - track acrylic and vinyl stock
export const materialInventory = pgTable('material_inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  materialType: text('material_type').notNull(), // 'acrylic' | 'vinyl'
  quantity: integer('quantity').default(0).notNull(), // sheets/rolls available
  unit: text('unit').notNull(), // 'sheets' | 'rolls'
  lowStockThreshold: integer('low_stock_threshold').default(10).notNull(), // alert level
  lastRestockedAt: timestamp('last_restocked_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const materialInventoryRelations = relations(materialInventory, ({ many }) => ({
  printQueueItems: many(printQueue),
}));

// Print queue - manage batch printing jobs
export const printQueue = pgTable('print_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  batchId: uuid('batch_id').notNull(), // references tags.id or bundle
  batchName: text('batch_name').notNull(), // human-readable batch name
  status: text('status').default('pending').notNull(), // 'pending' | 'printing' | 'quality_check' | 'ready_for_stock' | 'completed'
  itemCount: integer('item_count').default(0).notNull(),
  materialType: text('material_type').notNull(), // 'sticker' | 'acrylic'
  materialUsed: text('material_used'), // material details (e.g., "2 sheets A3 acrylic")
  materialInventoryId: uuid('material_inventory_id').references(() => materialInventory.id, { onDelete: 'set null' }),
  printedBy: text('printed_by').references(() => user.id, { onDelete: 'set null' }), // admin userId
  printedAt: timestamp('printed_at'),
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const printQueueRelations = relations(printQueue, ({ one }) => ({
  printedByUser: one(user, {
    fields: [printQueue.printedBy],
    references: [user.id],
  }),
  materialInventory: one(materialInventory, {
    fields: [printQueue.materialInventoryId],
    references: [materialInventory.id],
  }),
}));

// Audit logs - track all critical admin actions
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  adminId: text('admin_id').notNull(), // userId who performed action
  action: text('action').notNull(), // action type: 'delete', 'status_change', 'suspend', 'tier_change', etc.
  entityType: text('entity_type').notNull(), // 'user', 'order', 'tag', 'suspension', etc.
  entityId: text('entity_id').notNull(), // ID of the affected entity
  originalValue: jsonb('original_value'), // value before change
  newValue: jsonb('new_value'), // value after change
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  admin: one(user, {
    fields: [auditLogs.adminId],
    references: [user.id],
  }),
}));

// Shipping tracking - store shipping information
export const shippingTracking = pgTable('shipping_tracking', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  orderId: uuid('order_id').notNull().references(() => stickerOrders.id, { onDelete: 'cascade' }),
  courier: text('courier').notNull(), // 'JNE', 'Sicepat', etc.
  trackingNumber: text('tracking_number').notNull(), // resi
  status: text('status').default('processing').notNull(), // 'processing' | 'shipped' | 'in_transit' | 'delivered' | 'failed'
  shippedAt: timestamp('shipped_at'),
  estimatedDelivery: timestamp('estimated_delivery'),
  deliveredAt: timestamp('delivered_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const shippingTrackingRelations = relations(shippingTracking, ({ one }) => ({
  order: one(stickerOrders, {
    fields: [shippingTracking.orderId],
    references: [stickerOrders.id],
  }),
}));

// Suspension log - track user suspensions
export const suspensionLog = pgTable('suspension_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  suspensionType: text('suspension_type').notNull(), // 'user_id' | 'device_id'
  identifier: text('identifier').notNull(), // the actual ID or device ID
  reason: text('reason').notNull(),
  suspendedBy: text('suspended_by').notNull().references(() => user.id, { onDelete: 'set null' }), // admin userId
  suspendedAt: timestamp('suspended_at').defaultNow(),
  liftedAt: timestamp('lifted_at'), // null if still suspended
  liftedBy: text('lifted_by').references(() => user.id, { onDelete: 'set null' }), // admin userId who lifted
  liftReason: text('lift_reason'), // reason for lifting suspension
  isActive: boolean('is_active').default(true).notNull(), // true if suspension is currently active
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const suspensionLogRelations = relations(suspensionLog, ({ one }) => ({
  user: one(user, {
    fields: [suspensionLog.userId],
    references: [user.id],
  }),
  suspendedByUser: one(user, {
    fields: [suspensionLog.suspendedBy],
    references: [user.id],
  }),
  liftedByUser: one(user, {
    fields: [suspensionLog.liftedBy],
    references: [user.id],
  }),
}));

export const rateLimit = pgTable('rate_limit', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  identifier: text('identifier').notNull(), // IP:tagId combination
  actionType: text('action_type').notNull(), // 'scan', 'login', etc.
  requestCount: integer('request_count').default(1).notNull(),
  windowStart: timestamp('window_start').notNull(), // Start of time window
  windowEnd: timestamp('window_end').notNull(), // End of time window
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RateLimit = typeof rateLimit.$inferSelect;
export type NewRateLimit = typeof rateLimit.$inferInsert;

// ============================================================================
// BLOG SYSTEM TABLES
// ============================================================================

// Blog posts - main content storage
export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  summary: text('summary').notNull(),
  coverImage: text('cover_image'),
  content: text('content').notNull(), // Markdown format
  modules: jsonb('modules').default([]).$type<Array<any>>(), // Array of dynamic modules
  // E-E-A-T signals
  authorName: text('author_name').default('Tim Penulis BALIKIN').notNull(),
  authorAvatar: text('author_avatar'),
  authorId: text('author_id').references(() => user.id, { onDelete: 'set null' }),
  reviewedBy: text('reviewed_by'),
  reviewedByTitle: text('reviewed_by_title'),
  reviewedById: text('reviewed_by_id').references(() => user.id, { onDelete: 'set null' }),
  // SEO metadata
  metaDescription: text('meta_description'),
  metaKeywords: text('meta_keywords'),
  focusKeyword: text('focus_keyword'),
  // Publishing
  isPublished: boolean('is_published').default(false).notNull(),
  publishedAt: timestamp('published_at'),
  scheduledAt: timestamp('scheduled_at'), // For scheduled publishing
  // Soft delete
  deletedAt: timestamp('deleted_at'),
  deletedBy: text('deleted_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('idx_blog_posts_slug').on(table.slug),
  publishedIdx: index('idx_blog_posts_published').on(table.isPublished),
  slugPublishedIdx: index('idx_blog_posts_slug_published').on(table.slug, table.isPublished),
  createdAtDescIdx: index('idx_blog_posts_created_desc').on(table.createdAt),
  deletedAtIdx: index('idx_blog_posts_deleted_at').on(table.deletedAt),
}));

export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  author: one(user, {
    fields: [blogPosts.authorId],
    references: [user.id],
  }),
  reviewer: one(user, {
    fields: [blogPosts.reviewedById],
    references: [user.id],
  }),
  deletedByUser: one(user, {
    fields: [blogPosts.deletedBy],
    references: [user.id],
  }),
  comments: many(blogComments),
  giveawayClaims: many(giveawayClaims),
  locationReports: many(lostLocationsReport),
  pollVotes: many(pollVotes),
  analytics: many(blogPostsAnalytics),
  revisions: many(blogPostRevisions),
}));

// Giveaway claims - from quiz completion
export const giveawayClaims = pgTable('giveaway_claims', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  postId: uuid('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  quizId: text('quiz_id').notNull(),
  fullName: text('full_name').notNull(),
  whatsappNumber: text('whatsapp_number').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  score: integer('score').notNull(),
  status: text('status').default('pending').notNull(), // 'pending' | 'approved' | 'shipped' | 'rejected'
  trackingNumber: text('tracking_number'),
  notes: text('notes'),
  processedBy: text('processed_by').references(() => user.id, { onDelete: 'set null' }),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  postIdx: index('idx_giveaway_claims_post').on(table.postId),
  statusIdx: index('idx_giveaway_claims_status').on(table.status),
  statusCreatedAtDescIdx: index('idx_giveaway_claims_status_created_desc').on(table.status, desc(table.createdAt)),
}));

export const giveawayClaimsRelations = relations(giveawayClaims, ({ one }) => ({
  post: one(blogPosts, {
    fields: [giveawayClaims.postId],
    references: [blogPosts.id],
  }),
  processor: one(user, {
    fields: [giveawayClaims.processedBy],
    references: [user.id],
  }),
}));

// Blog comments - public discussions & giveaway entries
export const blogComments = pgTable('blog_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  postId: uuid('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id').references(() => blogComments.id, { onDelete: 'cascade' }), // For threading/replies
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }), // Optional - if logged in
  name: text('name').notNull(),
  commentText: text('comment_text').notNull(),
  whatsappNumber: text('whatsapp_number').notNull(), // Hidden from public
  isApproved: boolean('is_approved').default(true).notNull(),
  isGiveawayWinner: boolean('is_giveaway_winner').default(false).notNull(),
  hasHeroBadge: boolean('has_hero_badge').default(false).notNull(), // If user is a True Story alumni
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  postIdx: index('idx_blog_comments_post').on(table.postId),
  approvedIdx: index('idx_blog_comments_approved').on(table.isApproved),
  postCreatedAtDescIdx: index('idx_blog_comments_post_created_desc').on(table.postId, desc(table.createdAt)),
  parentIdx: index('idx_blog_comments_parent').on(table.parentId),
}));

export const blogCommentsRelations = relations(blogComments, ({ one, many }) => ({
  post: one(blogPosts, {
    fields: [blogComments.postId],
    references: [blogPosts.id],
  }),
  user: one(user, {
    fields: [blogComments.userId],
    references: [user.id],
  }),
  parent: one(blogComments, {
    fields: [blogComments.parentId],
    references: [blogComments.id],
  }),
  replies: many(blogComments),
}));

// True story submissions - video testimonials for jacket giveaway
export const trueStorySubmissions = pgTable('true_story_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }), // Optional - if logged in
  fullName: text('full_name').notNull(),
  whatsappNumber: text('whatsapp_number').notNull(),
  balikinTagId: text('balikin_tag_id').notNull(), // Validation against physical tag
  storyTitle: text('story_title').notNull(),
  storyText: text('story_text').notNull(),
  videoUrl: text('video_url').notNull(), // TikTok/Reels/Drive link
  jacketSize: text('jacket_size').notNull(), // 'S' | 'M' | 'L' | 'XL' | 'XXL'
  shippingAddress: text('shipping_address').notNull(),
  status: text('status').default('pending').notNull(), // 'pending' | 'verified' | 'winner_jacket' | 'rejected'
  trackingNumber: text('tracking_number'),
  reviewedBy: text('reviewed_by').references(() => user.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('idx_true_story_status').on(table.status),
}));

export const trueStorySubmissionsRelations = relations(trueStorySubmissions, ({ one }) => ({
  user: one(user, {
    fields: [trueStorySubmissions.userId],
    references: [user.id],
  }),
  reviewer: one(user, {
    fields: [trueStorySubmissions.reviewedBy],
    references: [user.id],
  }),
}));

// Lost location reports - crowdsourced danger zone data
export const lostLocationsReport = pgTable('lost_locations_report', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  postId: uuid('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  locationName: text('location_name').notNull(), // "Parkiran Stasiun Kandangan"
  locationType: text('location_type').notNull(), // "Parkiran" | "Kafe" | "Stasiun"
  cityName: text('city_name').notNull(), // "Kandangan"
  lostItemType: text('lost_item_type').notNull(), // "Kunci Motor"
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  postIdx: index('idx_lost_locations_post').on(table.postId),
  cityIdx: index('idx_lost_locations_city').on(table.cityName),
}));

export const lostLocationsReportRelations = relations(lostLocationsReport, ({ one }) => ({
  post: one(blogPosts, {
    fields: [lostLocationsReport.postId],
    references: [blogPosts.id],
  }),
}));

// Poll votes - real-time voting data
export const pollVotes = pgTable('poll_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  postId: uuid('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  pollId: text('poll_id').notNull(),
  selectedOptionIndex: integer('selected_option_index').notNull(),
  ipAddress: text('ip_address'), // Basic duplicate prevention
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  postPollIdx: index('idx_poll_votes_post_poll').on(table.postId, table.pollId),
}));

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
  post: one(blogPosts, {
    fields: [pollVotes.postId],
    references: [blogPosts.id],
  }),
}));

// Setup Gallery Submissions - user-submitted setup photos for discount incentive
export const setupGallerySubmissions = pgTable('setup_gallery_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  postId: uuid('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  galleryId: text('gallery_id').notNull(), // Links to module
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  userName: text('user_name').notNull(),
  userEmail: text('user_email'),
  photoUrl: text('photo_url').notNull(), // Vercel Blob URL
  description: text('description'),
  isApproved: boolean('is_approved').default(false),
  discountCode: text('discount_code'), // Generated incentive code
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  postIdx: index('idx_setup_gallery_post').on(table.postId),
  galleryIdIdx: index('idx_setup_gallery_gallery').on(table.galleryId),
  approvedIdx: index('idx_setup_gallery_approved').on(table.isApproved),
}));

export const setupGallerySubmissionsRelations = relations(setupGallerySubmissions, ({ one }) => ({
  post: one(blogPosts, {
    fields: [setupGallerySubmissions.postId],
    references: [blogPosts.id],
  }),
  user: one(user, {
    fields: [setupGallerySubmissions.userId],
    references: [user.id],
  }),
}));

// Blog Posts Analytics - track page views and engagement
export const blogPostsAnalytics = pgTable('blog_posts_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  postId: uuid('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  ipAddress: text('ip_address'),
  viewType: text('view_type').notNull(), // 'page_view' | 'engagement' (comment, quiz, poll, etc.)
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  postIdx: index('idx_blog_analytics_post').on(table.postId),
  viewTypeIdx: index('idx_blog_analytics_view_type').on(table.viewType),
  createdAtIdx: index('idx_blog_analytics_created').on(table.createdAt),
}));

export const blogPostsAnalyticsRelations = relations(blogPostsAnalytics, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostsAnalytics.postId],
    references: [blogPosts.id],
  }),
}));

// Blog Post Revisions - track all changes for audit trail and rollback
export const blogPostRevisions = pgTable('blog_post_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  postId: uuid('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  revisionNumber: integer('revision_number').notNull(), // Increment for each edit
  // Snapshot of post data at revision time
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  summary: text('summary').notNull(),
  coverImage: text('cover_image'),
  content: text('content').notNull(),
  modules: jsonb('modules').default([]).$type<Array<any>>(),
  authorName: text('author_name').notNull(),
  authorAvatar: text('author_avatar'),
  reviewedBy: text('reviewed_by'),
  reviewedByTitle: text('reviewed_by_title'),
  metaDescription: text('meta_description'),
  metaKeywords: text('meta_keywords'),
  focusKeyword: text('focus_keyword'),
  isPublished: boolean('is_published').notNull(),
  publishedAt: timestamp('published_at'),
  // Change metadata
  changedBy: text('changed_by').references(() => user.id, { onDelete: 'set null' }), // Who made this change
  changeReason: text('change_reason'), // Optional reason for edit
  changeType: text('change_type').notNull(), // 'create' | 'update' | 'publish' | 'unpublish' | 'delete'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  postIdx: index('idx_blog_revisions_post').on(table.postId),
  postRevisionIdx: index('idx_blog_revisions_post_revision').on(table.postId, table.revisionNumber),
  changedByIdx: index('idx_blog_revisions_changed_by').on(table.changedBy),
  createdAtDescIdx: index('idx_blog_revisions_created_desc').on(table.createdAt),
}));

export const blogPostRevisionsRelations = relations(blogPostRevisions, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostRevisions.postId],
    references: [blogPosts.id],
  }),
  changedByUser: one(user, {
    fields: [blogPostRevisions.changedBy],
    references: [user.id],
  }),
}));

// ============================================================================
// REFERRAL SYSTEM
// ============================================================================

export const referralVouchers = pgTable('referral_vouchers', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  userId: text('user_id').notNull(),
  code: text('code').notNull().unique(),
  usageCount: integer('usage_count').default(0).notNull(),
  maxUsageTarget: integer('max_usage_target').default(10).notNull(),
  // 'NOT_ELIGIBLE' | 'READY_TO_CLAIM' | 'PENDING_PROCESSING' | 'SUCCESS'
  claimStatus: text('claim_status').default('NOT_ELIGIBLE').notNull(),
  walletProvider: text('wallet_provider'), // GOPAY | OVO | DANA | SHOPEEPAY
  walletNumber: text('wallet_number'),
  claimedAt: timestamp('claimed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const referralUsages = pgTable('referral_usages', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  voucherId: uuid('voucher_id').references(() => referralVouchers.id).notNull(),
  buyerUserId: text('buyer_user_id').notNull(),
  orderId: text('order_id'),
  usedAt: timestamp('used_at').defaultNow().notNull(),
});

export const referralVouchersRelations = relations(referralVouchers, ({ many, one }) => ({
  usages: many(referralUsages),
  owner: one(user, { fields: [referralVouchers.userId], references: [user.id] }),
}));

export const referralUsagesRelations = relations(referralUsages, ({ one }) => ({
  voucher: one(referralVouchers, { fields: [referralUsages.voucherId], references: [referralVouchers.id] }),
}));

export type ReferralVoucher = typeof referralVouchers.$inferSelect;
export type NewReferralVoucher = typeof referralVouchers.$inferInsert;
export type ReferralUsage = typeof referralUsages.$inferSelect;

// ============================================================================
// BLOG TYPE EXPORTS
// ============================================================================

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type GiveawayClaim = typeof giveawayClaims.$inferSelect;
export type NewGiveawayClaim = typeof giveawayClaims.$inferInsert;
export type BlogComment = typeof blogComments.$inferSelect;
export type NewBlogComment = typeof blogComments.$inferInsert;
export type TrueStorySubmission = typeof trueStorySubmissions.$inferSelect;
export type NewTrueStorySubmission = typeof trueStorySubmissions.$inferInsert;
export type LostLocationReport = typeof lostLocationsReport.$inferSelect;
export type NewLostLocationReport = typeof lostLocationsReport.$inferInsert;
export type PollVote = typeof pollVotes.$inferSelect;
export type NewPollVote = typeof pollVotes.$inferInsert;
export type SetupGallerySubmission = typeof setupGallerySubmissions.$inferSelect;
export type NewSetupGallerySubmission = typeof setupGallerySubmissions.$inferInsert;
export type BlogPostAnalytics = typeof blogPostsAnalytics.$inferSelect;
export type NewBlogPostAnalytics = typeof blogPostsAnalytics.$inferInsert;
export type BlogPostRevision = typeof blogPostRevisions.$inferSelect;
export type NewBlogPostRevision = typeof blogPostRevisions.$inferInsert;

// ============================================================================
// CAMPAIGN SYSTEM
// ============================================================================

export const campaignLeads = pgTable('campaign_leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  app_id: text('app_id').default('balikin_id').notNull(),
  email: text('email').notNull(),
  campaignName: text('campaign_name').notNull(), // 'first-launch', 'campaign-two', etc.
  source: text('source'), // 'landing_page', 'email', 'referral', etc.
  status: text('status').default('subscribed').notNull(), // 'subscribed' | 'unsubscribed' | 'bounced'
  metadata: jsonb('metadata'), // Additional campaign-specific data
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  campaignIdx: index('idx_campaign_leads_campaign').on(table.campaignName),
  emailIdx: index('idx_campaign_leads_email').on(table.email),
  campaignEmailIdx: index('idx_campaign_leads_campaign_email').on(table.campaignName, table.email),
}));

export const campaignLeadsRelations = relations(campaignLeads, ({ one }) => ({
  // Placeholder for future user relationship if needed
}));

// ============================================================================
// SITE SETTINGS (singleton row, admin-editable)
// ============================================================================

export const siteSettings = pgTable('site_settings', {
  id: text('id').primaryKey().default('default'), // fixed singleton row
  app_id: text('app_id').default('balikin_id').notNull(),
  // Public tag page greeting shown for non-lost tags.
  // Supports {{ownerName}} placeholder, replaced with the tag owner's account name.
  tagGreetingTemplate: text('tag_greeting_template'),
  // Admin WhatsApp number for receiving order notifications.
  adminWhatsappNumber: text('admin_whatsapp_number'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type SiteSettings = typeof siteSettings.$inferSelect;
export type NewSiteSettings = typeof siteSettings.$inferInsert;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CampaignLead = typeof campaignLeads.$inferSelect;
export type NewCampaignLead = typeof campaignLeads.$inferInsert;

export type MaterialInventory = typeof materialInventory.$inferSelect;
export type NewMaterialInventory = typeof materialInventory.$inferInsert;
export type PrintQueue = typeof printQueue.$inferSelect;
export type NewPrintQueue = typeof printQueue.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type ShippingTracking = typeof shippingTracking.$inferSelect;
export type NewShippingTracking = typeof shippingTracking.$inferInsert;
export type SuspensionLog = typeof suspensionLog.$inferSelect;
export type NewSuspensionLog = typeof suspensionLog.$inferInsert;
