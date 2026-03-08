import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Balikin - Smart Lost & Found QR Tag",
  description: "Platform Smart Lost & Found yang menghubungkan objek fisik dengan identitas digital dinamis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
