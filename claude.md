# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Balikin** is a Smart Lost & Found QR Tag platform that connects physical objects (keychains/tags) with dynamic digital identities. Users can scan QR codes to claim tags, mark items as lost, and receive location-based notifications when their lost items are scanned.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Actions)
- **Runtime**: Node.js with Fluid Compute (not Edge)
- **Database**: PostgreSQL via Supabase (multi-tenant with shared instance)
- **ORM**: Drizzle ORM (type-safe queries with Drizzle Kit migrations)
- **Authentication**: Better Auth (Email/WhatsApp OTP, Google OAuth)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: Vercel (Singapore region: `sin1`)

## Essential Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run start                  # Start production server

# Database
npm run db:generate            # Generate Drizzle migration
npm run db:push                # Push schema to Supabase
npm run db:studio              # Open Drizzle Studio (visual DB viewer)

# Email Testing
npm run test:email             # Test email configuration

# Diagnostics
npm run diagnose               # Check DB connection
```

## Database Schema Rules

**Critical**: All tables use `balikin_` prefix and `app_id` column for multi-tenant Supabase sharing.

```typescript
// Use pgTableCreator for automatic prefixing
const pgTable = pgTableCreator((name) => `balikin_${name}`);

export const tags = pgTable('tags', {
  app_id: text('app_id').default('balikin_id').notNull(),
  // ... other fields
});
```

Drizzle config filters for `balikin_*` tables only.

## Key Database Tables

- `tags` - QR tag units (slug, ownerId, status, contactWhatsapp, tier, productType)
- `scan_logs` - Scan history with geo-location (ipAddress, city, latitude, longitude)
- `user`, `session`, `account`, `verification` - Better Auth tables
- `sticker_orders` / `tag_bundles` - Physical product ordering
- `notification_logs` - WhatsApp/Email delivery tracking
- `module_*` - Paid module system (Student Kit, Otomotif, Pertanian, Diklat)
- `material_inventory`, `print_queue` - Admin inventory management

## Core Business Logic

### 1. Dynamic Tag Display (`/p/[slug]`)
- **Status 'normal'**: Friendly UI with owner photo, greeting message
- **Status 'lost'**: Emergency UI (red), prominent WhatsApp button, reward info
- Mobile users redirect to `/mobile/claim/[slug]` via proxy

### 2. Scan Logging (Implicit Tracking)
When `/p/[slug]` is accessed with 'lost' status, system logs:
- IP Address
- City (from Vercel Headers: `x-vercel-ip-city`)
- Rough coordinates (latitude, longitude)

**Never** render WhatsApp numbers as static HTML text - use `window.open()` triggered by button to avoid bots.

### 3. Claim Mechanism
- Vendor-produced tags are 'unclaimed' (ownerId is null)
- First scan + login = user claims the tag

### 4. Module System (Dual-Tab Feature)
- **Tab 1 (Public)**: Emergency info display (blood type, allergies, emergency contact)
- **Tab 2 (Private)**: Module-specific data (Student Kit class schedule, vehicle records, etc.)
- Modules require purchase + approval via `modulePurchaseOrders` table
- Admin controls access via `userModulePermissions`

## Routing Proxy (Not Middleware)

The project uses `proxy.ts` (not `middleware.ts`) for Next.js 16 routing interception:

```typescript
// Redirects mobile users from /p/[slug] to /mobile/claim/[slug]
// Uses device detection via User-Agent pattern matching
```

**Important**: The proxy file handles mobile detection and redirects. API routes, auth pages, and static assets are excluded from proxy matching.

## Server Actions Location

All server-side mutations are in `app/actions/`:
- `tag.ts` - Tag CRUD operations
- `scan.ts` - Scan logging and geo-location capture
- `modules.ts` - Module data management
- `student-kit-actions.ts` - Student Kit specific operations
- `sticker-order.ts` / `sticker-pdf.ts` - Product ordering and PDF generation
- `admin-*` - Admin operations (audit, material management, etc.)

## Environment Variables

Required in `.env.local` (use `.env.local.example` as template):

```env
# Database
DATABASE_URL="postgresql://postgres:[password]@[host].supabase.co:5432/postgres"

# Better Auth
BETTER_AUTH_SECRET="[random 32-char string]"
BETTER_AUTH_URL="http://localhost:3000" # or production URL

# Email (Resend)
RESEND_API_KEY="..."

# WhatsApp (Wablas)
WABLAS_API_KEY="..."

# Vercel Blob
BLOB_READ_WRITE_TOKEN="..."

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## Mobile-First Design

The application has separate mobile views (`/mobile/*`) for:
- Tag claiming flow
- Scan reporting
- Simplified dashboard

Mobile users are auto-redirected from `/p/[slug]` to `/mobile/claim/[slug]`.

## Admin Dashboard (`/admin`)

Extensive admin features including:
- Tag management and VDP tool (vendor data processing)
- Sticker order fulfillment with print queue
- Material inventory tracking (acrylic, vinyl)
- Module request/approval workflow
- User suspension and audit logging
- Analytics and marketing modules

## Cron Jobs

Vercel cron configured in `vercel.json`:
- `/api/cron/deadline-reminders` - Daily at 8 AM local time (for Student Kit deadline notifications)

## Security Headers

Configured in `vercel.json`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`

## Development Notes

- **Multi-tenant Supabase**: Always use `app_id = 'balikin_id'` in queries and filters
- **Next.js 16**: Use `proxy.ts` for routing interception, not middleware.ts
- **Server Actions**: All mutations go through `app/actions/`, maintain 2MB body size limit
- **TypeScript**: Build errors are ignored in `next.config.js` (for rapid prototyping)

# Aturan Komunikasi AI
- Berikan kode atau *command* secara langsung tanpa teks pengantar atau penutup.
- Jangan jelaskan cara kerja kode kecuali saya secara eksplisit bertanya "mengapa".
- Saat mengedit *file*, modifikasi hanya bagian yang diminta.