import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

const PAGE_SIZE: [number, number] = [80, 120];
const CARD_SIZE: [number, number] = [80, 50];

export interface ActivationCardData {
  codeLabel: string;
  code: string;
  scope: string;
  activationUrl: string;
}

function addBrandHeader(doc: jsPDF, title: string, subtitle?: string) {
  doc.setFillColor(15, 31, 57);
  doc.rect(0, 0, PAGE_SIZE[0], 21, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('BALIKIN', 7, 9);
  doc.setFontSize(9);
  doc.text(title, 7, 16);
  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(subtitle, 73, 16, { align: 'right' });
  }
  doc.setTextColor(20, 30, 45);
}

function addPageNumber(doc: jsPDF, page: number) {
  doc.setDrawColor(220, 226, 235);
  doc.line(7, 112, 73, 112);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 112, 130);
  doc.text(`Panduan Balikin · ${page}`, 7, 116);
  doc.text('balikin.online', 73, 116, { align: 'right' });
  doc.setTextColor(20, 30, 45);
}

function addBulletList(doc: jsPDF, items: string[], startY: number) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  items.forEach((item, index) => {
    const y = startY + index * 11;
    doc.setFillColor(235, 61, 71);
    doc.circle(9, y - 1.5, 1.2, 'F');
    doc.text(item, 14, y, { maxWidth: 58 });
  });
}

export async function buildBalikinManualPdf(helpUrl: string): Promise<Buffer> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: PAGE_SIZE });
  const helpQr = await QRCode.toDataURL(helpUrl, { width: 220, margin: 1 });

  // Cover
  doc.setFillColor(15, 31, 57);
  doc.rect(0, 0, PAGE_SIZE[0], PAGE_SIZE[1], 'F');
  doc.setFillColor(235, 61, 71);
  doc.circle(68, 18, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(25);
  doc.text('BALIKIN', 8, 26);
  doc.setFontSize(19);
  doc.text('Panduan Singkat', 8, 48);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Scan. Terhubung. Kembali.', 8, 57);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(8, 70, 64, 30, 4, 4, 'F');
  doc.setTextColor(15, 31, 57);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Simpan buku ini bersama', 13, 81);
  doc.text('tag Balikin Anda.', 13, 89);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Di dalamnya ada cara aktivasi', 13, 95);
  doc.text('dan kartu klaim kepemilikan.', 13, 100);

  const pages: Array<{ title: string; intro: string; bullets: string[] }> = [
    { title: 'Apa itu Balikin?', intro: 'Balikin membantu menghubungkan barang yang ditemukan dengan pemiliknya melalui QR Code.', bullets: ['Penemu cukup scan QR.', 'Pemilik mendapat notifikasi scan.', 'Kontak dapat dilakukan dengan lebih aman.'] },
    { title: 'Isi Paket Anda', intro: 'Periksa isi paket sebelum mulai mengaktifkan tag.', bullets: ['Tag Balikin dengan QR Code.', 'Ring atau aksesori gantungan.', 'Buku panduan dan kartu aktivasi.'] },
    { title: 'Cara Klaim Kepemilikan', intro: 'Gunakan kartu aktivasi yang ikut di dalam paket.', bullets: ['Scan QR aktivasi pada kartu.', 'Login atau buat akun Balikin.', 'Masukkan PIN aktivasi.', 'Ikuti instruksi sampai selesai.'] },
    { title: 'Lengkapi Profil Anda', intro: 'Data ini membantu penemu menghubungi Anda saat barang ditemukan.', bullets: ['Gunakan nama panggilan yang nyaman.', 'Isi nomor WhatsApp yang aktif.', 'Tulis pesan singkat untuk penemu.', 'Jangan masukkan data yang terlalu sensitif.'] },
    { title: 'Atur Status Barang', intro: 'Status menentukan informasi yang dilihat penemu saat QR dipindai.', bullets: ['Normal: barang masih bersama Anda.', 'Hilang: tampilkan pesan bantuan.', 'Perbarui status setelah barang kembali.'] },
    { title: 'Saat Barang Ditemukan', intro: 'Penemu tidak perlu memasang aplikasi khusus.', bullets: ['Penemu membuka kamera HP.', 'Penemu scan QR pada tag.', 'Halaman Balikin menampilkan jalur kontak.', 'Anda menindaklanjuti notifikasi yang masuk.'] },
    { title: 'Jaga QR Tetap Terbaca', intro: 'QR yang bersih dan tidak tertutup lebih mudah dipindai.', bullets: ['Jangan menutup QR dengan stiker lain.', 'Hindari menggores area QR.', 'Bersihkan dengan kain lembut.', 'Pasang tag di tempat yang mudah terlihat.'] },
    { title: 'Pilih Media yang Tepat', intro: 'Satu sistem QR dapat digunakan pada beberapa media.', bullets: ['Printable: cetak sendiri.', 'Sticker: praktis untuk permukaan barang.', 'Akrilik: cocok untuk kunci dan tas.', 'Free Pass: mulai tanpa biaya.'] },
    { title: 'Privasi Anda', intro: 'Balikin membantu membuka jalur kontak tanpa mencetak nomor HP di barang.', bullets: ['Jangan bagikan PIN aktivasi.', 'Periksa pesan sebelum menyimpan.', 'Gunakan akun sendiri saat klaim.', 'Laporkan aktivitas yang mencurigakan.'] },
    { title: 'Butuh Bantuan?', intro: 'Gunakan halaman bantuan untuk panduan dan pertanyaan umum.', bullets: ['Buka balikin.online/help.', 'Siapkan nomor seri tag.', 'Jangan kirim PIN di ruang publik.', 'Hubungi CS jika aktivasi bermasalah.'] },
  ];

  pages.forEach((page, index) => {
    doc.addPage(PAGE_SIZE, 'portrait');
    addBrandHeader(doc, page.title, `${index + 1}/10`);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(page.title, 7, 36, { maxWidth: 66 });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(page.intro, 7, 49, { maxWidth: 65 });
    addBulletList(doc, page.bullets, 70);
    addPageNumber(doc, index + 2);
  });

  doc.addPage(PAGE_SIZE, 'portrait');
  addBrandHeader(doc, 'Bantuan & Kontak', '10/10');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('Simpan. Aktifkan.', 7, 38);
  doc.text('Lindungi barang Anda.', 7, 47);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Scan QR di samping untuk membuka halaman bantuan Balikin.', 7, 61, { maxWidth: 58 });
  doc.addImage(helpQr, 'PNG', 27, 68, 26, 26);
  doc.setFontSize(8);
  doc.text('balikin.online/help', 40, 99, { align: 'center' });
  addPageNumber(doc, 12);

  return Buffer.from(doc.output('arraybuffer'));
}

export async function buildActivationCardsPdf(cards: ActivationCardData[]): Promise<Buffer> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: CARD_SIZE });
  for (const [index, card] of cards.entries()) {
    if (index > 0) doc.addPage(CARD_SIZE, 'landscape');
    const qr = await QRCode.toDataURL(card.activationUrl, { width: 220, margin: 1 });
    doc.setFillColor(15, 31, 57);
    doc.rect(0, 0, 80, 50, 'F');
    doc.setFillColor(235, 61, 71);
    doc.rect(0, 0, 3, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('KARTU AKTIVASI BALIKIN', 7, 9);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(card.scope, 7, 15, { maxWidth: 47 });
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(7, 20, 49, 22, 2, 2, 'F');
    doc.setTextColor(15, 31, 57);
    doc.setFontSize(6.5);
    doc.text(card.codeLabel, 10, 27);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(card.code, 10, 36);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.text('Jangan bagikan PIN ini.', 10, 40);
    doc.addImage(qr, 'PNG', 61, 21, 20, 20);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(5.5);
    doc.text('Scan untuk mulai', 71, 46, { align: 'center' });
  }
  return Buffer.from(doc.output('arraybuffer'));
}
