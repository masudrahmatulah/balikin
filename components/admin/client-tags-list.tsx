"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import type { Tag } from "@/db/schema";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ClientTagsListProps {
  tags: Tag[];
  clientId: string;
}

export function ClientTagsList({ tags, clientId }: ClientTagsListProps) {
  const router = useRouter();
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<"png" | "svg">("png");

  const generateQR = async (tag: Tag) => {
    setIsGenerating(true);
    setSelectedTag(tag);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const tagUrl = `${baseUrl}/p/${tag.slug}`;

    try {
      // Generate high-quality QR code
      const dataUrl = await QRCode.toDataURL(tagUrl, {
        width: 1024,
        margin: 2,
        color: {
          dark: "#1e293b",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H", // High error correction for better scanning
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error("Error generating QR:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = async (format: "png" | "svg") => {
    if (!selectedTag || !qrDataUrl) return;

    setDownloadingFormat(format);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const tagUrl = `${baseUrl}/p/${selectedTag.slug}`;

      if (format === "svg") {
        // Generate SVG format
        const QRCodeSVG = await import("qrcode");
        const svgString = await QRCodeSVG.toString(tagUrl, {
          type: "svg",
          width: 1024,
          margin: 2,
          errorCorrectionLevel: "H",
        });

        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `balikin-${selectedTag.slug}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Download PNG
        const a = document.createElement("a");
        a.href = qrDataUrl;
        a.download = `balikin-${selectedTag.slug}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading QR:", error);
    } finally {
      setDownloadingFormat("png");
    }
  };

  const printQR = () => {
    if (!selectedTag) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const tagUrl = `${baseUrl}/p/${selectedTag.slug}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak QR - ${selectedTag.name}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              box-sizing: border-box;
            }
            .qr-container {
              text-align: center;
              page-break-inside: avoid;
            }
            .qr-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #1e293b;
            }
            .qr-slug {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 20px;
            }
            .qr-image {
              width: 400px;
              height: 400px;
              margin: 0 auto;
            }
            .qr-instructions {
              margin-top: 24px;
              padding: 16px;
              background: #f1f5f9;
              border-radius: 8px;
              text-align: center;
              max-width: 400px;
            }
            .qr-instructions p {
              margin: 4px 0;
              font-size: 14px;
              color: #475569;
            }
            @media print {
              body { padding: 0; }
              .qr-container { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="qr-title">${selectedTag.name}</div>
            <div class="qr-slug">Scan jika menemukan barang ini</div>
            <img src="${qrDataUrl}" alt="QR Code" class="qr-image" />
            <div class="qr-instructions">
              <p><strong> cara menggunakan:</strong></p>
              <p>1. Cetak QR code ini</p>
              <p>2. Tempel pada gantungan kunci/tag</p>
              <p>3. Scan untuk aktivasi</p>
            </div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Tag Klien
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Kelola dan cetak QR code untuk tag klien ini
          </p>
        </div>

        {tags.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="mx-auto w-16 h-16 text-slate-300 dark:text-slate-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Belum ada tag
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Klien ini belum memiliki tag QR code
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="break-words text-lg font-medium text-slate-900 dark:text-white">
                        {tag.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tag.status === "lost"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                            : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        }`}
                      >
                        {tag.status === "lost" ? "Hilang" : "Normal"}
                      </span>
                    </div>
                    <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
                      Slug: <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                        {tag.slug}
                      </code>
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400" suppressHydrationWarning>
                      Dibuat:{" "}
                      {tag.createdAt
                        ? format(new Date(tag.createdAt), "dd MMM yyyy, HH:mm", { locale: id })
                        : "-"}
                    </p>
                    {tag.customMessage && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 italic">
                        &quot;{tag.customMessage}&quot;
                      </p>
                    )}
                    {tag.rewardNote && (
                      <div className="mt-2 inline-flex items-center px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full text-sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                        {tag.rewardNote}
                      </div>
                    )}
                  </div>
                  <div className="flex w-full items-center gap-2 sm:w-auto">
                    <button
                      onClick={() => generateQR(tag)}
                      disabled={isGenerating}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white font-medium transition-colors hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
                    >
                      {isGenerating && selectedTag?.id === tag.id ? (
                        <>
                          <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Generate QR
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {selectedTag && qrDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="pr-3 text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
                  QR Code untuk {selectedTag.name}
                </h3>
                <button
                  onClick={() => {
                    setSelectedTag(null);
                    setQrDataUrl("");
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* QR Preview */}
              <div className="mb-6 flex justify-center rounded-xl border-2 border-slate-200 bg-white p-4 dark:border-slate-600 sm:p-6">
                <img src={qrDataUrl} alt="QR Code" className="h-auto w-full max-w-[256px]" />
              </div>

              {/* Tag Info */}
              <div className="text-center mb-6">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Scan QR ini untuk melihat profil barang
                </p>
                <code className="break-all text-xs text-slate-500">
                  /p/{selectedTag.slug}
                </code>
              </div>

              {/* Download Options */}
              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={() => downloadQR("png")}
                  className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-white font-medium transition-colors hover:bg-blue-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  PNG (1024px)
                </button>
                <button
                  onClick={() => downloadQR("svg")}
                  className="flex items-center justify-center rounded-lg bg-slate-800 px-4 py-3 text-white font-medium transition-colors hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  SVG (Vector)
                </button>
              </div>

              <button
                onClick={printQR}
                className="w-full flex items-center justify-center px-4 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Cetak Langsung
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
