# Student Kit Security Audit & Refactoring Report

## Executive Summary

Setelah melakukan audit mendalam pada fitur Student Kit, ditemukan **4 vulnerability keamanan** (1 HIGH, 2 MEDIUM, 1 LOW) dan **8 issue code quality**.

---

## 🚨 SECURITY FINDINGS

### 1. ⚠️ HIGH: XSS Vulnerability via JSON.parse()

**Lokasi:** `app/p/[slug]/private/student/student-kit-client.tsx:31`

**Kode Bermasalah:**
```typescript
const vcardData = studentData?.vcardData
  ? JSON.parse(studentData.vcardData)  // ❌ UNSAFE
  : null;
```

**Masalah:**
- Jika database mengandung JSON malicious: `"<script>alert('XSS')</script>"`
- Script akan dieksekusi di browser client

**Solusi:**
```typescript
import { sanitize } from '@/lib/security';

const vcardData = studentData?.vcardData
  ? sanitize(JSON.parse(studentData.vcardData))
  : null;
```

---

### 2. ⚠️ MEDIUM: Authorization Error Information Disclosure

**Lokasi:** `app/p/[slug]/private/student/page.tsx:36-42`

**Kode Bermasalah:**
```typescript
if (tag.ownerId !== session.user.id) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-600">Anda tidak memiliki akses ke modul ini.</p>  // ❌ Bocor info
    </div>
  );
}
```

**Masalah:**
- Error message bocorkan bahwa tag dimiliki user lain
- Seharusnya redirect atau return 404

**Solusi:**
```typescript
if (tag.ownerId !== session.user.id) {
  notFound();  // ✅ Return 404 - lebih aman
}
```

---

### 3. ⚠️ MEDIUM: Missing Input Validation

**Lokasi:** Semua function di `app/actions/modules.ts`

**Masalah:**
- Tidak ada validasi input menggunakan Zod
- User bisa submit data kosong atau invalid

**Contoh Risk:**
```typescript
// ❌ BISA TERIMA: Tidak ada validasi
export async function updateStudentKit(data: {
  classSchedule?: string;  // Bisa apa saja
  assignmentDeadlines?: string;  // Bisa apa saja
})
```

**Solusi:**
```typescript
import { z } from 'zod';

const StudentKitSchema = z.object({
  classSchedule: z.string().optional(),
  assignmentDeadlines: z.string().optional(),
  driveLinks: z.string().optional(),
  ktmKrsPhotos: z.string().optional(),
});

// ✅ VALIDATED
const validatedData = StudentKitSchema.parse(data);
```

---

### 4. ⚠️ LOW: Data Exposure via Client Components

**Lokasi:** `app/p/[slug]/private/student/student-kit-client.tsx`

**Masalah:**
- Seluruh `StudentKitData` object dilempar ke client
- Field sensitif seperti `notificationPhoneNumber` bisa diekspos

**Solusi:**
- Hanya kirim data yang diperlukan via props
- Atau gunakan Server Actions untuk data sensitif

---

## 📊 CODE QUALITY ISSUES

### 1. Violation of DRY Principle
**Lokasi:** `app/actions/modules.ts`
- `updateStudentKit()`, `updateOtomotifData()`, `updatePertanianData()` punya pola sama

### 2. No Error Type Safety
**Lokasi:** Semua API routes
- Error handling generic: `new Error('Gagal...')`
- Tidak ada custom error types

### 3. Missing Database Indexes
- `studentKitScheduleShares` perlu index di `expiresAt`
- Tidak ada composite index untuk query performa

### 4. N+1 Query Problem
**Lokasi:** `app/dashboard/page.tsx`
- Loop query untuk setiap tag untuk scan count
- Untuk 100 tags = 101 database queries!

---

## 🔧 RECOMMENDED FIXES

### Priority 1 (CRITICAL): Fix XSS Vulnerability
### Priority 2 (HIGH): Add Zod Validation
### Priority 3 (MEDIUM): Optimize Database Queries
### Priority 4 (LOW): Refactor for DRY

---

Selanjutnya: Implementasi perbaikan...
