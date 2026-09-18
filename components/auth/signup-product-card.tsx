import Image from "next/image";
import { Check } from "lucide-react";

const benefits = [
  "Tanpa aplikasi tambahan",
  "Profil barang mudah diperbarui",
  "Siap digunakan kapan saja",
];

export function SignupProductCard() {
  return (
    <aside className="relative order-2 overflow-hidden rounded-2xl bg-gradient-to-br from-[#9f0b18] via-[#d90f1d] to-[#ff4854] p-6 text-white shadow-xl shadow-red-900/20 sm:p-8 lg:order-1">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10" aria-hidden="true" />
      <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-black/10" aria-hidden="true" />

      <div className="relative">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-red-100">
          Balikin Smart Tag
        </p>
        <h2 className="max-w-sm text-2xl font-bold leading-tight sm:text-3xl">
          Barang penting layak punya jalan pulang.
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-6 text-red-50">
          Satu scan QR membantu orang baik menghubungi Anda saat barang ditemukan.
        </p>

        <div className="my-6 overflow-hidden rounded-xl border border-white/20 bg-white/15 shadow-lg backdrop-blur-sm">
          <Image
            src="/gallery/Balikin Online Qr gantungan kunci temukan barang hilang (1).webp"
            alt="Balikin Smart Tag untuk membantu menemukan barang yang hilang"
            width={1536}
            height={1024}
            className="aspect-[4/3] w-full object-cover"
            sizes="(max-width: 1023px) 100vw, 42vw"
          />
        </div>

        <ul className="space-y-3 text-sm text-red-50">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
