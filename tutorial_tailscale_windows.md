# Tutorial: Setup Tailscale di Windows

Dokumen ini menjelaskan cara install dan konfigurasi Tailscale di PC Windows
agar bisa terhubung ke tailnet yang sama dengan VPS, sehingga bisa mengakses
dev server Next.js yang berjalan di VPS (lihat `tutorial_tailscale.md`).

---

## 1. Download & Install

1. Buka browser, kunjungi halaman resmi: **https://tailscale.com/download**
2. Klik tombol download untuk **Windows**.
3. Jalankan file installer (`.exe`) yang sudah terunduh.
4. Ikuti proses instalasi seperti aplikasi Windows pada umumnya (Next → Next → Finish).
   Tidak perlu mengubah opsi apapun, default sudah cukup.

Setelah instalasi selesai, Tailscale akan berjalan sebagai service dan muncul
ikon di **system tray** (pojok kanan bawah, dekat jam).

---

## 2. Login

1. Klik ikon Tailscale di system tray.
2. Pilih **Log in** (atau **Sign in**).
3. Browser akan terbuka otomatis ke halaman login Tailscale.
4. Login menggunakan **akun yang sama** dengan yang dipakai di VPS
   (`masudrahmatullah@...`) — bisa lewat Google/Microsoft/GitHub, tergantung
   metode yang dipakai sebelumnya.
5. Setelah berhasil, browser akan menampilkan pesan sukses dan aplikasi
   Tailscale di Windows otomatis berstatus **Connected**.

---

## 3. Verifikasi Koneksi

1. Klik ikon Tailscale di system tray → akan muncul daftar perangkat di tailnet,
   termasuk VPS (`vmi3189118`) dan PC ini sendiri (biasanya bernama sesuai
   hostname Windows, contoh: `desktop-ekf611s`).
2. Pastikan status VPS **online** (ada tanda titik hijau).
3. Catat IP Tailscale VPS yang ditampilkan (contoh: `100.81.50.18`) — ini yang
   dipakai untuk akses dev server.

Untuk cek lewat command line (buka **PowerShell** atau **CMD**):

```powershell
tailscale status
```

Akan menampilkan semua perangkat di tailnet beserta IP masing-masing, mirip:

```
100.81.50.18   vmi3189118       masudrahmatullah@  linux    -
100.87.196.99  desktop-ekf611s  masudrahmatullah@  windows  -
```

---

## 4. Mengakses Dev Server VPS

Setelah status **Connected**, buka browser di Windows dan akses:

```
http://100.81.50.18:3000
```

(Sesuaikan IP dan port dengan yang aktif di VPS — lihat `tutorial_tailscale.md`
untuk cara start/stop server di sisi VPS.)

---

## 5. Perintah Berguna (opsional, lewat PowerShell/CMD)

Cek status koneksi:

```powershell
tailscale status
```

Melihat IP Tailscale milik PC ini:

```powershell
tailscale ip -4
```

Memutus sementara dari tailnet:

```powershell
tailscale down
```

Menyambung kembali:

```powershell
tailscale up
```

Logout dari akun Tailscale:

```powershell
tailscale logout
```

---

## 6. Troubleshooting Singkat

- **Tidak bisa akses IP VPS**: pastikan ikon Tailscale di tray menunjukkan
  status "Connected", bukan "Logged out" atau "Stopped".
- **VPS tidak muncul di daftar perangkat**: pastikan login di Windows memakai
  akun yang **sama persis** dengan akun Tailscale di VPS.
- **Koneksi lambat/gagal**: klik ikon Tailscale → pastikan tidak ada firewall
  Windows yang memblokir aplikasi Tailscale (biasanya installer sudah otomatis
  menambahkan exception saat instalasi).
