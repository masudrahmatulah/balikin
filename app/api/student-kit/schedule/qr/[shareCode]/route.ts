import { NextRequest, NextResponse } from 'next/server';
import { getScheduleByShareCode } from '@/app/actions/modules';
import { generateQRCodeDataURL } from '@/lib/qrcode-generator';

/**
 * GET /api/student-kit/schedule/qr/[shareCode]
 * Generate QR code for schedule sharing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  try {
    const { shareCode } = await params;

    // Verify share code is valid
    await getScheduleByShareCode(shareCode);

    // Generate share URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://balikin.masudrahmat.my.id';
    const shareUrl = `${baseUrl}/api/student-kit/schedule/import/${shareCode}`;

    // Generate QR code
    const qrCodeDataUrl = await generateQRCodeDataURL(shareUrl, {
      size: 400,
      margin: 2,
    });

    // Return HTML page with QR code image
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Scan QR Code - Import Jadwal</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 16px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 500px;
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
            }
            p {
              color: #666;
              margin-bottom: 30px;
            }
            .qr-code {
              margin: 20px 0;
            }
            .qr-code img {
              max-width: 100%;
              height: auto;
              border: 4px solid #f0f0f0;
              border-radius: 8px;
            }
            .share-code {
              background: #f5f5f5;
              padding: 12px 20px;
              border-radius: 8px;
              font-family: monospace;
              font-size: 18px;
              color: #333;
              margin-top: 20px;
              word-break: break-all;
            }
            .instructions {
              margin-top: 30px;
              padding: 20px;
              background: #e8f4f8;
              border-radius: 8px;
              text-align: left;
            }
            .instructions h3 {
              margin-top: 0;
              color: #2196F3;
            }
            .instructions ol {
              margin: 10px 0;
              padding-left: 20px;
            }
            .instructions li {
              margin: 8px 0;
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📚 Import Jadwal Kuliah</h1>
            <p>Scan QR code ini untuk mengimpor jadwal ke Student Kit Anda</p>

            <div class="qr-code">
              <img src="${qrCodeDataUrl}" alt="QR Code untuk Import Jadwal" />
            </div>

            <div class="share-code">
              Kode: ${shareCode}
            </div>

            <div class="instructions">
              <h3>Cara Menggunakan:</h3>
              <ol>
                <li>Buka aplikasi Balikin di browser Anda</li>
                <li>Navigasi ke menu Student Kit</li>
                <li>Klik tombol "Import Jadwal"</li>
                <li>Masukkan kode: <strong>${shareCode}</strong></li>
              </ol>
            </div>
          </div>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('[API] Generate QR code error:', error);

    // Return error page
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .error {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 400px;
            }
            h1 { color: #e74c3c; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>❌ Error</h1>
            <p>${error instanceof Error ? error.message : 'QR Code tidak valid atau sudah kadaluarsa'}</p>
          </div>
        </body>
      </html>
    `, {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }
}
