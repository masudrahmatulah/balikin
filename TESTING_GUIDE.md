# Testing Guide - CRUD Client List

## Perbaikan yang Dilakukan

✅ **Memperbaiki server actions** - Menggunakan query yang lebih standar dengan `db.select().from()` bukan `db.query.findFirst()`
✅ **Menambahkan logging** - Debugging logs untuk memantau eksekusi server actions
✅ **Fix TypeScript errors** - Tidak ada error di admin-client-actions.ts

## Cara Restart Dev Server

Agar perubahan ter-load, restart dev server:

```bash
# Stop dev server (Ctrl+C)
# Lalu start ulang:
npm run dev
```

## Testing Steps

### 1. Test CREATE (Tambah Klien)

1. Buka `http://localhost:3000/admin`
2. Login sebagai admin
3. Klik tombol **"Tambah Klien"** (biru)
4. Isi form:
   - Nama: `Test User`
   - Email: `test@example.com`
   - Role: `User`
5. Klik **"Tambah Klien"**
6. ✅ Verifikasi: Klien baru muncul di tabel

**Expected Logs di Terminal:**
```
[createClient] Creating client with email: test@example.com
[createClient] Admin session OK: [admin-id]
[createClient] Inserting user with ID: [user-id]
[createClient] User created successfully
```

---

### 2. Test UPDATE (Edit Klien)

1. Di tabel klien, cari klien yang baru dibuat
2. Klik tombol **Edit** (ikon pensil kuning/coklat)
3. Ubah data:
   - Nama: `Test User Updated`
   - Email: `test.updated@example.com`
   - Role: `Admin`
4. Klik **"Simpan Perubahan"**
5. ✅ Verifikasi: Data klien berubah di tabel

**Expected Logs di Terminal:**
```
[updateClient] Updating user: [user-id] to email: test.updated@example.com
[updateClient] Admin session OK: [admin-id]
[updateClient] Updating user in database
[updateClient] User updated successfully
```

---

### 3. Test DELETE (Hapus Klien) - **INI YANG ERROR SEBELUMNYA**

1. Di tabel klien, cari klien test
2. Klik tombol **Delete** (ikon tempat sampah merah)
3. Baca peringatan cascade (jika ada tags)
4. Klik **"Ya, Hapus"**
5. ✅ Verifikasi: Klien terhapus dari tabel

**Expected Logs di Terminal:**
```
[deleteClient] Starting deletion for user: [user-id]
[deleteClient] Admin session: [admin-id]
[deleteClient] Found user: test.updated@example.com
[deleteClient] User has 0 tags
[deleteClient] Deleted 0 tags
[deleteClient] Deleted user
[deleteClient] Revalidated /admin path
```

---

### 4. Test Error Cases

#### A. Email Duplicate
1. Coba tambahkan klien dengan email yang sudah ada
2. ✅ Harus muncul error: "Email sudah terdaftar"

#### B. Edit Self
1. Coba edit data admin yang sedang login
2. ✅ Harus muncul error: "Tidak bisa mengubah data sendiri"

#### C. Delete Self
1. Coba hapus admin yang sedang login
2. ✅ Harus muncul error: "Tidak bisa menghapus akun sendiri"

---

## Debugging jika Masih Error

### Cek Browser Console
1. Buka DevTools (F12)
2. Tab **Console**
3. Cari error messages

### Cek Terminal Logs
Server actions sekarang memiliki logging:
- `[createClient]` - untuk create
- `[updateClient]` - untuk update
- `[deleteClient]` - untuk delete

Lihat apakah log muncul di terminal saat Anda klik tombol.

### Cek Network Tab
1. Buka DevTools (F12)
2. Tab **Network**
3. Filter dengan "actions"
4. Lihat request/response server actions

---

## Common Issues & Solutions

### Issue: "Invalid Server Actions request"

**Solusi:**
1. Restart dev server
2. Clear browser cache
3. Pastikan file `admin-client-actions.ts` sudah ter-update

### Issue: 500 Internal Server Error

**Solusi:**
1. Cek terminal untuk error logs
2. Pastikan database connection OK
3. Cek apakah admin session valid

### Issue: Modal tidak muncul

**Solusi:**
1. Cek browser console untuk error
2. Pastikan semua modal components ter-import dengan benar di `clients-table.tsx`

---

## Files yang Berubah

```
app/actions/admin-client-actions.ts    - Server actions dengan logging
components/admin/clients-table.tsx     - Tombol CRUD & modal integration
components/admin/create-client-modal.tsx
components/admin/edit-client-modal.tsx
components/admin/delete-client-modal.tsx
```

---

## Success Criteria

✅ CREATE: Bisa tambah klien baru
✅ READ: Bisa lihat daftar klien (sudah ada)
✅ UPDATE: Bisa edit data klien
✅ DELETE: Bisa hapus klien dengan cascade tags
✅ Validasi email unik
✅ Mencegah edit/hapus diri sendiri
✅ Peringatan cascade delete untuk tags
✅ Error handling dalam Bahasa Indonesia

---

## Need Help?

Jika masih ada error:
1. Screenshoot error di browser console
2. Copy logs dari terminal
3. Share screenshot + logs untuk debugging

**Selamat testing! 🚀**
