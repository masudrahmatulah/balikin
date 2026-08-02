# Panduan Implementasi Checkout System

Dokumen ini menjelaskan strategi implementasi checkout berdasarkan `docs/checkout.md` dengan tetap memperhatikan aturan dari `about.md`.

---

## 1. Alignment dengan About.md

### 1.1 Product Structure (Section 11.1)
Checkout harus mendukung 9 produk dengan struktur:

```
Digital (Rp 0)
├─ Balikin Free Pass (QR digital)
Physical (Rp 54.000)
├─ Balikin Armor Tag (Gantungan kunci)
Sticker (Rp 59.000 each)
├─ Stiker Balikin Pro (6-8 QR besar)
├─ Stiker Balikin Daily (12-15 QR sedang)
├─ Stiker Balikin Micro (20-24 QR kecil)
└─ Stiker Balikin Family (12 QR campuran) ⭐ BEST SELLER
Bundle (Rp 89.000 - Rp 699.000)
├─ Ultimate Pack (1 Akrilik + 1 Family) ⭐ BEST VALUE
├─ Family Pack (4× Ultimate)
└─ Traveller Pack (10× Ultimate) [B2B]
```

**Implementasi:**
- Update `balikin_products` table dengan 9 SKU
- Setiap product harus memiliki `sku`, `price`, `product_type`
- Bundle products harus reference parent products (1:many relationship)

### 1.2 Feature Tiers (Section 2)
Checkout harus respect fitur tier untuk setiap kategori:

| Tier | WhatsApp Gateway | Shipping | Checkout Flow |
|:--|:--|:--|:--|
| Digital (Free) | N/A | N/A | Simple form |
| Physical/Sticker | 1 tahun gratis + Rp 15k/year | Wajib (Shipping) | Full checkout |
| Bundle | 1 tahun gratis + Rp 15k/year | Wajib (Shipping) | Full checkout |

**Premium Feature Activation (Section 14.6):**
- Seumur Hidup Gratis: Media fisik + email + IP location
- 1 Tahun Gratis: WhatsApp Gateway + Chat Anonim + GPS (setelah pembelian)
- Perpanjangan: Rp 15.000/tahun (optional)

### 1.3 Database Schema (Section 13)
Gunakan tabel berikut sesuai schema:

**Main Tables:**
- `balikin_products` - SKU master (9 products)
- `balikin_sticker_orders` - Order tracking
- `balikin_sticker_sheets` - VDP tracking (Sheet_ID)
- `balikin_order_bundles` - Bundle-to-order mapping
- `balikin_vouchers` - Discount codes *(needs creation)*
- `balikin_customer_segments` - CRM (Pribadi/Keluarga/Bisnis) *(needs creation)*

**Important Fields:**
- All orders harus generate `order_id` dengan nanoid (anti-enumeration)
- Harus track `premium_until` date (1 tahun dari purchase date)
- Tag activation PIN harus generate otomatis di webhook

### 1.4 Business Logic (Section 14)
Respect aturan khusus:

1. **Privacy**: Nomor HP tidak boleh ditampilkan di URL, hanya di tombol WhatsApp
2. **RLS**: Gunakan Row Level Security (auth.uid() == user_id) di tabel orders
3. **Nanoid**: Order ID menggunakan nanoid untuk mencegah enumeration
4. **Tag Lifecycle**: Tag dimulai status `unclaimed` → `claimed` saat aktivasi
5. **Presisi Kota**: Harus cascading dropdown (Provinsi → Kota → Kecamatan)

---

## 2. Checkout Flow Implementation

### 2.1 Phase 1: Data Collection (CRM & Marketing)
**Referensi:** checkout.md Section 1

**Fields Wajib Dikumpulkan:**
```
Auto-filled (dari sesi):
- Nama Lengkap (untuk invoice)
- Email (untuk retargeting)

Wajib Input:
- Nomor WhatsApp (untuk resi, invoice, keamanan)
- Segmentasi Pengguna (Pribadi/Keluarga/Bisnis) - Dropdown

Opsional:
- Catatan tambahan
- Preference komunikasi
```

**Database Design:**
```sql
-- Tabel balikin_customer_segments (CREATE if not exists)
CREATE TABLE balikin_customer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  segment TEXT CHECK (segment IN ('pribadi', 'keluarga', 'bisnis')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel balikin_vouchers (CREATE if not exists)
CREATE TABLE balikin_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('fixed', 'percentage')) NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  quota INTEGER NOT NULL,
  used_count INTEGER DEFAULT 0 NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**CRM Automation (Post-Purchase):**
- H+3: WhatsApp trigger untuk aktivasi PIN
- H-30: Reminder perpanjangan cloud (Rp 15.000/tahun)
- Retargeting: Export email + WhatsApp untuk Meta/Google Ads

### 2.2 Phase 2: Shipping & Pricing (Logistics)
**Referensi:** checkout.md Section 2

**Cascading Dropdown (Dynamic):**
```
User selects:
Provinsi (dropdown) → API call → Kota options
Kota (dropdown) → API call → Kecamatan options
Kecamatan (select) → RajaOngkir/Biteship API → Shipping cost
```

**Shipping APIs:**
- Primary: RajaOngkir atau Biteship
- Timeout: 4 detik max
- Fallback: Tarif Flat Cadangan
  - Kalimantan Selatan: Rp 15.000
  - Luar Kalimantan: Rp 35.000

**Grand Total Calculation (Server-side only):**
```
Grand Total = Base Price + Shipping Cost - Discount
```

**Implementation Notes:**
- SEMUA kalkulasi di Next.js backend (Server Actions)
- Browser tidak boleh menghitung grand total
- Validasi diskon di server dengan atomic SQL query

### 2.3 Phase 3: Voucher System
**Referensi:** checkout.md Section 2

**Voucher Types:**
```
Fixed: Rp X.XXX discount
Percentage: X% discount dari total
Constraints: quota, expiry date
```

**Anti-Race Condition Protection:**
```sql
-- Atomik query untuk mencegah kebocoran kuota
UPDATE balikin_vouchers 
SET used_count = used_count + 1 
WHERE code = 'PROMO123' 
  AND used_count < quota
  AND expires_at > NOW();

-- Check rows affected:
-- 0 rows = voucher tidak valid/expired/kuota habis
-- 1 rows = voucher berhasil digunakan
```

**Implementation Rules:**
- Validasi di server, TIDAK di browser
- Setiap checkout cek: existence, quota, expiry
- Reject jika 0 rows affected dari UPDATE query

### 2.4 Phase 4: Payment (Midtrans QRIS)
**Referensi:** checkout.md Section 3

**Payment Methods (Prioritized):**
1. **Primary CTA:** QRIS (instant payment)
   - Includes: GoPay, ShopeePay, other e-wallets
2. **Secondary (accordion):** Virtual Account, Bank Transfer

**Mobile Optimization:**
- Desktop: Display QRIS image
- Mobile: Show deep-link buttons (GoPay/ShopeePay)
  - 1 tap → open e-wallet app directly
  - Use Midtrans Snap Redirect with device detection

**Webhook Integration:**
```
1. Payment success → Midtrans webhook
2. Update status: order → settlement
3. Generate: unique PIN activation
4. Queue: orderan ke VDP Tool (admin gudang)
5. Database: update premium_until = NOW() + 1 year
```

### 2.5 Phase 5: Security & Operations
**Referensi:** checkout.md Section 4

**4 Critical Security Measures:**

#### A. Anti-Race Condition (Voucher)
```sql
UPDATE balikin_vouchers 
SET used_count = used_count + 1 
WHERE code = $1 AND used_count < quota;
-- If rows_affected == 0 → reject
```

#### B. Fallback Shipping
```typescript
try {
  shippingCost = await rajaOngkir.getCost({timeout: 4000});
} catch {
  // Fallback tarif flat
  shippingCost = province === 'Kalimantan Selatan' ? 15000 : 35000;
}
```

#### C. Mobile Deep-Link
```typescript
if (isMobileDevice()) {
  // Show buttons: Bayar via GoPay, Bayar via ShopeePay
  // Each button: deep-link to Midtrans Snap or e-wallet app
} else {
  // Show QRIS image
}
```

#### D. Data Protection (RLS)
```sql
-- Row Level Security di tabel orders/sticker_orders
CREATE POLICY order_select_policy ON balikin_sticker_orders
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'authenticated'::text AND auth.jwt()->>'role' = 'admin');

-- Order ID: nanoid (anti-enumeration)
-- No sequential IDs like 1, 2, 3, 4...
```

---

## 3. Implementation Checklist

- [ ] Create `balikin_vouchers` table (if not exists)
- [ ] Create `balikin_customer_segments` table (if not exists)
- [ ] Update `balikin_products` table with 9 SKUs
- [ ] Implement cascading dropdown (Province → City → District)
- [ ] Integrate RajaOngkir/Biteship API with 4-second timeout
- [ ] Implement fallback shipping rates (flat-rate)
- [ ] Add server-side Grand Total calculation
- [ ] Implement atomic SQL voucher validation
- [ ] Setup Midtrans QRIS configuration
- [ ] Implement mobile deep-link detection
- [ ] Create Midtrans webhook handler
  - [ ] Update order status to settlement
  - [ ] Generate PIN activation
  - [ ] Queue to VDP Tool
  - [ ] Set premium_until = NOW() + 1 year
- [ ] Setup Row Level Security (RLS) on orders
- [ ] Use nanoid for order_id generation
- [ ] Implement CRM automation (H+3, H-30 WA triggers)
- [ ] Add WhatsApp Gateway subscription logic
- [ ] Implement email retargeting export
- [ ] Add audit logging for sensitive transactions

---

## 4. Database Relationships

```
balikin_products (9 SKUs)
  ├─ balikin_sticker_orders (1:many)
  │   ├─ order_id (nanoid, PK)
  │   ├─ product_sku (FK → products.sku)
  │   ├─ user_id (FK → users, RLS enabled)
  │   ├─ status (pending/settlement/shipped/completed)
  │   ├─ premium_until (DATE, 1 year from purchase)
  │   └─ shipping_cost (calculated server-side)
  │
  └─ balikin_order_bundles (for bundle products)
      ├─ order_id (FK)
      ├─ component_sku (FK → products)
      └─ quantity

balikin_vouchers
  ├─ code (UNIQUE)
  ├─ discount_type (fixed/percentage)
  ├─ quota (for atomic lock)
  └─ expires_at

balikin_customer_segments
  ├─ user_id (FK)
  └─ segment (pribadi/keluarga/bisnis) [CRM classification]

balikin_tags
  ├─ activation_pin (generated from webhook)
  ├─ premium_until (same as order.premium_until)
  └─ status (unclaimed → claimed after PIN validation)
```

---

## 5. Important Notes

1. **Pricing Anchor Strategy**: Armor Tag @ Rp 54.000 is reference point
2. **Bundle Discounts**: 
   - Ultimate Pack: Save Rp 24k vs separate purchase
   - Family Pack: Save Rp 57k (4x Ultimate)
   - Traveller Pack: Save Rp 191k (10x Ultimate, B2B)
3. **Premium Features**: Always respect 1-year free then Rp 15k/year model
4. **VDP Integration**: Queue order to VDP Tool after payment settlement
5. **RLS Critical**: Prevent user A seeing user B's orders via enumeration
6. **Mobile First**: Deep-link for e-wallet is UX priority on phones

---

## 6. Next Steps

1. Create missing tables (vouchers, customer_segments)
2. Update products table with 9 SKU data
3. Enhance checkout form with new fields
4. Implement shipping calculation backend
5. Add voucher validation logic
6. Setup Midtrans webhook
7. Create CRM automation workflows
8. Add RLS policies
9. Test end-to-end flow
10. Monitor VDP integration

