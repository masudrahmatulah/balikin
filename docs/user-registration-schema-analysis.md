# Database Schema & Alur Register User Balikin

## 📊 Tabel Database Utama (Better Auth)

### 1. Tabel `balikin_user` (Master User)

```typescript
{
  id: string (primary key)           // UUID dari Better Auth
  app_id: string = "balikin_id"      // Multi-tenant identifier
  name: string                       // Nama lengkap user
  email: string (unique, not null)   // Email atau WhatsApp ID
  emailVerified: boolean             // Status verifikasi
  image: string                      // URL foto profil (opsional)
  role: string = "user"              // "user" (client) atau "admin"
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Catatan Penting:**
- Untuk **WhatsApp**, email disimpan dalam format: `628123456789@wa.dev`
- Untuk **Email**, email disimpan asli: `user@example.com`
- Untuk **Google SSO**, email dari Google: `user@gmail.com`

---

### 2. Tabel `balikin_account` (Koneksi SSO/OAuth)

```typescript
{
  id: string (primary key)
  app_id: string = "balikin_id"
  user_id: string (foreign key → balikin_user)
  accountId: string              // ID dari provider (Google ID)
  providerId: string             // "google" untuk Google SSO
  accessToken: string            // Token akses OAuth (opsional)
  refreshToken: string           // Token refresh (opsional)
  idToken: string                // JWT dari Google (opsional)
  expiresAt: timestamp           // Expired token (opsional)
  password: string               // Untuk auth password-based (opsional)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Perbedaan Metode Register:**
- **WhatsApp/Email OTP**: `providerId = NULL` (tidak pakai OAuth)
- **Google SSO**: `providerId = "google"`, `accountId = Google Sub ID`

---

### 3. Tabel `balikin_session` (Sesi Login)

```typescript
{
  id: string (primary key)       // Session ID
  app_id: string = "balikin_id"
  user_id: string (foreign key → balikin_user)
  expiresAt: timestamp           // 7 hari dari creation
  token: string (unique)         // Session token
  ipAddress: string              // IP address user
  userAgent: string              // Browser/device info
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Konfigurasi:**
- Session expires: 7 hari
- Cookie cache: enabled untuk performance
- Update age: 1 hari

---

### 4. Tabel `balikin_verification` (OTP & Verification)

```typescript
{
  id: string (primary key)
  app_id: string = "balikin_id"
  identifier: string             // Email atau @wa.dev
  value: string                  // OTP code (plain text)
  expiresAt: timestamp           // 5 menit dari creation
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Konfigurasi:**
- OTP expires: 5 menit
- Max attempts: 3 kali
- Store: Plain text (untuk support @wa.dev)

---

## 🔄 Alur Register per Metode

### METODE 1: Register dengan WhatsApp OTP

```
1. User input: "08123456789"
2. Format ke: "628123456789@wa.dev"
3. Better Auth simpan OTP di balikin_verification:
   - identifier: "628123456789@wa.dev"
   - value: "123456"
   - expiresAt: NOW + 5 menit
4. Fonnte API kirim OTP ke WhatsApp
5. User input OTP "123456"
6. Better Auth verifikasi OTP dari balikin_verification
7. Jika valid, create user di balikin_user:
   - id: UUID
   - email: "628123456789@wa.dev"
   - emailVerified: TRUE
   - role: "user"
   - app_id: "balikin_id"
8. Create session di balikin_session
9. Set cookie di browser
```

**Data yang Disimpan:**
- `balikin_user.email`: "628123456789@wa.dev"
- `balikin_user.emailVerified`: true
- `balikin_session`: session record
- `balikin_verification`: dihapus setelah verifikasi

---

### METODE 2: Register dengan Email OTP

```
1. User input: "user@example.com"
2. Better Auth simpan OTP di balikin_verification:
   - identifier: "user@example.com"
   - value: "789012"
   - expiresAt: NOW + 5 menit
3. Resend API kirim OTP ke email
4. User input OTP "789012"
5. Better Auth verifikasi OTP dari balikin_verification
6. Jika valid, create user di balikin_user:
   - id: UUID
   - email: "user@example.com"
   - emailVerified: TRUE
   - role: "user"
   - app_id: "balikin_id"
7. Create session di balikin_session
8. Set cookie di browser
```

**Data yang Disimpan:**
- `balikin_user.email`: "user@example.com"
- `balikin_user.emailVerified`: true
- `balikin_session`: session record
- `balikin_verification`: dihapus setelah verifikasi

---

### METODE 3: Register dengan Google SSO

```
1. User klik "Lanjutkan dengan Google"
2. Redirect ke Google OAuth consent screen
3. User approve aplikasi
4. Google redirect ke callback dengan authorization code
5. Better Auth exchange code dengan Google (backend)
6. Google return: access_token, refresh_token, id_token, user info
7. Better Auth simpan account di balikin_account:
   - user_id: (akan di-link)
   - accountId: "123456789012345678901" (Google Sub ID)
   - providerId: "google"
   - accessToken: "ya29.a0AfH..."
   - refreshToken: "1//0g..."
   - idToken: "eyJhbGci..."
   - expiresAt: NOW + 3600 detik
8. Create/update user di balikin_user:
   - id: UUID
   - email: "user@gmail.com" (dari Google)
   - name: "John Doe" (dari Google)
   - emailVerified: TRUE (otomatis dari Google)
   - image: "https://lh3.googleusercontent.com/..." (dari Google)
   - role: "user"
   - app_id: "balikin_id"
9. Create session di balikin_session
10. Set cookie di browser
```

**Data yang Disimpan:**
- `balikin_user.email`: "user@gmail.com"
- `balikin_user.name`: "John Doe"
- `balikin_user.image`: "URL foto Google"
- `balikin_user.emailVerified`: true
- `balikin_account`: OAuth tokens dan Google ID
- `balikin_session`: session record

---

## 👥 Perbedaan User Client vs Admin

### Tabel `balikin_user.role`

```typescript
role: "user"    // Client/pengguna biasa
role: "admin"   // Administrator sistem
```

### Cara Menjadi Admin:

**Option 1: Manual Database Update**
```sql
UPDATE balikin_user
SET role = 'admin'
WHERE email = 'admin@example.com';
```

**Option 2: Seeding di Migrations**
```typescript
// db/seed.ts atau migrations
await db.insert(user).values({
  id: 'admin-uuid',
  email: 'admin@balikin.com',
  name: 'Admin Balikin',
  role: 'admin',
  emailVerified: true,
});
```

**Option 3: Environment Variable (Better Auth Advanced)**
```typescript
// lib/auth.ts
admin: {
  defaultRole: 'user',
  adminEmails: ['admin@balikin.com', 'owner@balikin.com']
}
```

### Hak Akses Berdasarkan Role:

```typescript
// Middleware atau server action check
if (user.role === 'admin') {
  // Akses penuh:
  // - Lihat semua order
  // - Edit semua tag
  // - Akses dashboard admin
  // - Manajemen user
}

if (user.role === 'user') {
  // Akses terbatas:
  // - Hanya data miliknya sendiri
  // - Tidak bisa akses admin panel
  // - Tidak bisa lihat user lain
}
```

---

## 📋 Perbandingan Data per Metode Register

| Data/Field | WhatsApp | Email OTP | Google SSO |
|-----------|----------|-----------|------------|
| **balikin_user.id** | ✅ UUID | ✅ UUID | ✅ UUID |
| **balikin_user.email** | "62xxx@wa.dev" | "user@email.com" | "user@gmail.com" |
| **balikin_user.name** | ❌ NULL | ❌ NULL | ✅ Dari Google |
| **balikin_user.image** | ❌ NULL | ❌ NULL | ✅ Dari Google |
| **balikin_user.emailVerified** | ✅ TRUE | ✅ TRUE | ✅ TRUE |
| **balikin_user.role** | "user" | "user" | "user" |
| **balikin_account** | ❌ NULL | ❌ NULL | ✅ OAuth data |
| **balikin_session** | ✅ Created | ✅ Created | ✅ Created |
| **balikin_verification** | ✅ OTP | ✅ OTP | ❌ Not needed |

---

## 🔍 Query untuk Get User Info

```typescript
// Dengan Drizzle ORM
const userWithAccount = await db.query.user.findFirst({
  where: eq(user.email, identifier),
  with: {
    accounts: true,  // Untuk cek Google SSO
    sessions: true,  // Untuk cek session aktif
  },
});

// Cek role user
if (userWithAccount?.role === 'admin') {
  // Admin logic
}

// Cek auth method
const authMethod = userWithAccount?.accounts?.[0]?.providerId
  ? 'Google SSO'
  : 'OTP (Email/WA)';
```

---

## ⚠️ Catatan Penting untuk WhatsApp

### Kenapa Pakai "@wa.dev"?

```typescript
// Format WhatsApp untuk bypass Zod email validation
formatWhatsAppEmail("08123456789") → "628123456789@wa.dev"

// Kenapa tidak pakai prefix "wa:"?
// Karena Better Auth pakai Zod schema untuk validasi email
// Zod butuh format email valid: user@domain.tld
// .dev adalah TLD valid, jadi "@wa.dev" lolos validasi
```

### Extract Phone Number untuk Display:

```typescript
// Saat display ke UI, extract phone number
extractPhoneNumber("628123456789@wa.dev") → "628123456789"
// Format Indonesia: +62 812-3456-789
```

---

## 🎯 Rekomendasi Schema Improvement

### 1. Tambah Field `phoneNumber` di `balikin_user`

```typescript
// db/schema.ts
export const user = pgTable('user', {
  // ... existing fields
  phoneNumber: text('phone_number'), // Untuk WhatsApp users
  authMethod: text('auth_method'),   // "whatsapp" | "email" | "google"
  lastLoginAt: timestamp('last_login_at'),
});
```

### 2. Tambah Index untuk Performance

```typescript
// Untuk quick lookup saat login
export const user_idx_email = index('user_email_idx').on(user.email);
export const user_idx_phone = index('user_phone_idx').on(user.phoneNumber);
export const user_idx_role = index('user_role_idx').on(user.role);
```

### 3. Tabel `balikin_user_preferences` (Optional)

```typescript
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => user.id),
  preferredAuthMethod: text('preferred_auth_method'), // "google" | "whatsapp" | "email"
  notificationsEnabled: boolean('notifications_enabled').default(true),
  language: text('language').default('id'),
  currency: text('currency').default('IDR'),
});
```

---

## 📊 Summary Database Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTER USER FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. INPUT                                                   │
│     ├─ WhatsApp: "08123456789"                              │
│     ├─ Email: "user@email.com"                              │
│     └─ Google: OAuth consent                                │
│                                                              │
│  2. VERIFICATION                                            │
│     ├─ WhatsApp: OTP ke WhatsApp (Fonnte)                   │
│     ├─ Email: OTP ke Email (Resend)                         │
│     └─ Google: OAuth token exchange                         │
│                                                              │
│  3. USER CREATION (balikin_user)                            │
│     ├─ id: UUID                                             │
│     ├─ email: identifier / Google email                     │
│     ├─ name: NULL / Google name                             │
│     ├─ emailVerified: TRUE                                  │
│     ├─ role: "user" (default)                               │
│     └─ app_id: "balikin_id"                                 │
│                                                              │
│  4. ACCOUNT CREATION (balikin_account)                       │
│     ├─ WhatsApp/Email: NULL (no OAuth)                      │
│     └─ Google: OAuth tokens & provider ID                   │
│                                                              │
│  5. SESSION CREATION (balikin_session)                       │
│     ├─ Token generation                                     │
│     ├─ 7 days expiration                                    │
│     └─ Cookie set                                           │
│                                                              │
│  6. REDIRECT                                                │
│     └─ /dashboard (client) atau /admin (admin)              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Considerations

1. **OTP Storage**: Plain text untuk WhatsApp, tapi expires 5 menit
2. **OAuth Tokens**: Encrypt saat simpan di database (recommended)
3. **Session**: HTTPOnly cookie, secure flag di production
4. **Password**: Tidak dipakai (OTP & OAuth based)
5. **Rate Limiting**: 3x attempt OTP, 7 days session

---

Ini adalah schema dan alur lengkap untuk sistem registrasi user dengan 3 metode berbeda. Schema yang ada sudah mencakup semua kebutuhan dasar untuk authentication dengan role-based access control (user vs admin).
