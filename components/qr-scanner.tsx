'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, ImageUp, QrCode } from 'lucide-react';
import { getSafeQrDestination } from '@/lib/safe-qr-destination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrScanSession } from '@/lib/qr-scan-session';

export function QrScanner({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [manual, setManual] = useState('');
  const [error, setError] = useState('');
  const sessionRef = useRef<QrScanSession<MediaStream> | null>(null);
  if (!sessionRef.current) sessionRef.current = new QrScanSession<MediaStream>();

  const sessionOptions = {
    cancel: (frame: number) => cancelAnimationFrame(frame),
    onStop: () => { setScanning(false); setStarting(false); },
  };

  useEffect(() => () => {
    sessionRef.current?.stop({ cancel: sessionOptions.cancel, onStop: () => {} });
  // The session is stable for the lifetime of this component.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopScanner() {
    if (videoRef.current) videoRef.current.srcObject = null;
    sessionRef.current?.stop(sessionOptions);
  }

  function handleValue(value: string): boolean {
    const destination = getSafeQrDestination(value, window.location.origin);
    if (!destination) {
      setError(current => current === 'QR ini bukan tautan tag atau aktivasi Balikin yang didukung.'
        ? current
        : 'QR ini bukan tautan tag atau aktivasi Balikin yang didukung.');
      return false;
    }
    stopScanner();
    router.push(destination);
    return true;
  }

  async function startScanner() {
    if (sessionRef.current?.isBusy) return;
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Browser ini tidak mendukung kamera. Gunakan input tautan manual di bawah.');
      return;
    }
    setStarting(true);
    try {
      await sessionRef.current?.start({
        openStream: () => navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }),
        playStream: async stream => {
          const video = videoRef.current;
          if (!video) throw new Error('Video element is unavailable');
          video.srcObject = stream;
          await video.play();
        },
        scanFrame: async () => {
          const video = videoRef.current;
          if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return false;
          const { default: jsQR } = await import('jsqr');
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext('2d', { willReadFrequently: true });
          if (!context) return false;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const code = jsQR(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height, { inversionAttempts: 'dontInvert' });
          return code?.data ? handleValue(code.data) : false;
        },
        onActive: () => { setScanning(true); setStarting(false); },
        onStop: sessionOptions.onStop,
        schedule: callback => requestAnimationFrame(callback),
        cancel: sessionOptions.cancel,
      });
    } catch (cause) {
      if (videoRef.current) videoRef.current.srcObject = null;
      setError(cause instanceof DOMException && cause.name === 'NotAllowedError'
        ? 'Izin kamera ditolak. Izinkan kamera di pengaturan browser atau gunakan input manual.'
        : 'Kamera tidak tersedia. Pastikan halaman dibuka melalui HTTPS dan kamera tidak sedang dipakai aplikasi lain.');
    }
  }

  async function readImage(file?: File) {
    if (!file) return;
    setError('');
    try {
      const { default: jsQR } = await import('jsqr');
      const bitmap = await createImageBitmap(file);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) throw new Error('Canvas unavailable');
        context.drawImage(bitmap, 0, 0);
        const code = jsQR(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height, { inversionAttempts: 'dontInvert' });
        if (code?.data) handleValue(code.data);
        else setError('QR tidak ditemukan pada gambar.');
      } finally { bitmap.close(); }
    } catch { setError('Gambar tidak dapat dibaca sebagai QR.'); }
  }

  return <section className={`space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${mobile ? 'mx-4' : ''}`}>
    <div><h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><QrCode className="h-5 w-5 text-brand-red" />Pemindai QR Balikin</h2><p className="mt-1 text-sm text-slate-600">Scan QR tag untuk membuka halaman publik atau melanjutkan aktivasi yang aman.</p></div>
    <video ref={videoRef} playsInline muted className={scanning ? 'aspect-video w-full rounded-xl bg-black object-cover' : 'hidden'} aria-label="Tampilan kamera pemindai QR" />
    {scanning || starting ? <Button variant="outline" onClick={stopScanner}>{starting ? 'Batalkan pembukaan kamera' : 'Hentikan kamera'}</Button> : <Button onClick={startScanner}><Camera className="mr-2 h-4 w-4" />Mulai scan</Button>}
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"><ImageUp className="h-4 w-4" />Pilih gambar QR <input type="file" accept="image/*" className="sr-only" onChange={e => void readImage(e.target.files?.[0])} /></label>
    <form className="flex gap-2" onSubmit={e => { e.preventDefault(); handleValue(manual); }}><Input value={manual} onChange={e => setManual(e.target.value)} placeholder="Tempel tautan QR Balikin" aria-label="Tautan QR Balikin" /><Button type="submit" variant="outline">Buka</Button></form>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <p className="text-xs text-slate-500">Komputer tanpa kamera? Untuk mengaktifkan tag akrilik, masukkan kode SERIAL-PIN di <Link className="font-medium text-brand-red underline" href="/claim">halaman aktivasi manual</Link>.</p>
  </section>;
}
