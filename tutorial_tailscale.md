# Tutorial: Akses Next.js Dev Server (balikin) dari Rumah via Tailscale

Dokumen ini menjelaskan cara mengakses server development Next.js yang berjalan
di VPS (`vmi3189118`) dari PC rumah, menggunakan Tailscale sebagai VPN privat.

## Ringkasan Setup

| Perangkat | Peran | Tailscale IP |
|---|---|---|
| VPS (`vmi3189118`) | Menjalankan Next.js dev server | `100.81.50.18` |
| PC Windows (`desktop-ekf611s`) | Mengakses dev server dari rumah | `100.87.196.99` |

Kedua perangkat login dengan akun Tailscale yang sama (`masudrahmatullah@...`),
sehingga otomatis berada di jaringan privat (tailnet) yang sama. Hanya perangkat
yang login ke akun ini yang bisa saling mengakses — tidak ter-expose ke internet publik.

---

## 1. Prasyarat

- Tailscale sudah terinstall & login di VPS.
- Tailscale sudah terinstall & login di PC Windows, dengan akun yang sama.
- Cek koneksi di VPS:

```bash
tailscale status
```

Pastikan PC Windows (`desktop-ekf611s`) muncul di daftar.

---

## 2. Menjalankan Dev Server (di VPS)

Masuk ke folder project:

```bash
cd /home/mesot01/balikin
```

Jalankan dev server dengan bind ke semua interface (`0.0.0.0`) agar bisa
diakses dari luar `localhost`, dan tentukan port (contoh: 3000):

```bash
npm run dev -- -H 0.0.0.0 -p 3000
```

Agar tetap berjalan setelah terminal ditutup, jalankan di background dengan `nohup`:

```bash
nohup npm run dev -- -H 0.0.0.0 -p 3000 > /tmp/balikin-dev.log 2>&1 &
disown
```

Cek log untuk memastikan server sudah siap:

```bash
tail -n 30 /tmp/balikin-dev.log
```

Server siap jika muncul baris seperti:

```
✓ Ready in 727ms
- Network: http://0.0.0.0:3000
```

> **Catatan:** Sebelum menjalankan, pastikan port yang dipakai belum digunakan
> project lain di VPS ini. Cek dengan:
> ```bash
> ss -tlnp | grep :3000
> ```
> Jika terpakai, gunakan port lain (mis. `-p 3001`) atau matikan proses yang lama
> (lihat bagian "Mematikan Server" di bawah).

---

## 3. Mengakses dari PC Rumah

Buka browser di PC rumah, akses:

```
http://100.81.50.18:3000
```

(Ganti `3000` sesuai port yang dipakai.)

Karena `100.81.50.18` adalah IP privat Tailscale milik VPS, alamat ini **hanya
bisa diakses oleh perangkat yang login ke tailnet yang sama** — aman dari akses publik.

---

## 4. Mematikan Server

### Cara A — Jika dijalankan langsung di terminal (foreground)

Tekan `Ctrl + C` di terminal tempat server berjalan.

### Cara B — Jika dijalankan di background (`nohup` + `disown`)

1. Cari proses yang memakai port tersebut:

   ```bash
   ss -tlnp | grep :3000
   ```

   Contoh output:
   ```
   LISTEN 0 511 *:3000 *:* users:(("next-server (v16",pid=121594,fd=19))
   ```

2. Matikan proses berdasarkan PID yang tertera:

   ```bash
   kill 121594
   ```

3. Verifikasi port sudah bebas:

   ```bash
   ss -tlnp | grep :3000 || echo "port sudah bebas"
   ```

---

## 5. Cek Status Tailscale

Melihat semua perangkat yang terhubung di tailnet:

```bash
tailscale status
```

Melihat IP Tailscale milik VPS ini:

```bash
tailscale ip -4
```

Memutus VPS dari tailnet (misal untuk maintenance):

```bash
sudo tailscale down
```

Menyambung kembali:

```bash
sudo tailscale up
```

---

## 6. Ringkasan Perintah Cepat

```bash
# Start (background, port 3000)
cd /home/mesot01/balikin
nohup npm run dev -- -H 0.0.0.0 -p 3000 > /tmp/balikin-dev.log 2>&1 &
disown

# Cek log
tail -f /tmp/balikin-dev.log

# Cek siapa yang pakai port 3000
ss -tlnp | grep :3000

# Stop
kill <PID>
```

Akses dari PC rumah: `http://100.81.50.18:3000`
