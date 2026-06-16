import { Document, Page, Image, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { PaperSize } from '@/lib/sticker-template';

// ============================================================================
// CONSTANTS
// ============================================================================

// Tag dimensions - FIXED untuk presisi
// 3 kolom: 30mm QR Utama + 30mm Logo/Foto + 30mm QR Aktivasi = 90mm content
// Cutting mark menggunakan inset positioning (tidak menambah lebar)
// TOTAL TAG WIDTH = 90mm (presisi, tanpa overflow)

const TAG_WIDTH = '90mm';
const TAG_HEIGHT = '45mm';
const TAG_COLUMN_1 = '30mm';  // QR Utama
const TAG_COLUMN_2 = '30mm';  // Logo/Foto
const TAG_COLUMN_3 = '30mm';  // QR Aktivasi
const FOLD_POSITION_1 = '30mm';  // Posisi lipat pertama (antara kolom 1-2)
const FOLD_POSITION_2 = '60mm';  // Posisi lipat kedua (antara kolom 2-3)
const TAG_LEFT_SIDE = '30mm';
const TAG_RIGHT_SIDE = '60mm';  // Columns 2 + 3 combined

// Paper-specific configurations dengan calculated gaps
// Menggunakan LANDSCAPE orientation: width > height
const PAPER_CONFIGS = {
  a4: {
    // A4 landscape: 297mm width × 210mm height
    width: '297mm',
    height: '210mm',
    margin: '12mm',
    rows: 4,  // 4 baris
    cols: 2,  // 2 kolom saja untuk A4
    rowGap: '3mm',
    // Perhitungan: (273 - 2*3) / 2 = 133.5mm slot per kolom
    // Tag 90mm + gap 2mm = 92mm ✅ MUAT dengan aman!
    // Total: 2 kolom × 4 baris = 8 paket tag per halaman
    colGap: '2mm',
  },
  a3: {
    // A3 portrait: 297mm width × 420mm height (React-PDF default orientation)
    width: '297mm',
    height: '420mm',
    margin: '8mm',
    rows: 9,  // Updated for 90mm width tags
    cols: 3,
    rowGap: '5mm',
    // Perhitungan OPTIMAL: (420 - 16) / 9 = 45.5mm slot per baris
    // Tag 45mm + gap 1mm = 46mm ✅ MUAT!
    // Width: (297 - 16) / 3 = 93.6mm slot per kolom
    // Tag 90mm + gap 4mm = 94mm ✅ AMAN!
    // 3 kolom × 9 baris = 27 tags per halaman
    colGap: '4mm',
  },
} as const;

const PAGE_MARGIN = '10mm';

// ============================================================================
// STYLES
// ============================================================================

function createStyles(paperSize: PaperSize) {
  const config = PAPER_CONFIGS[paperSize];

  return StyleSheet.create({
    page: {
      width: config.width,
      height: config.height,
      padding: config.margin,
      flexDirection: 'column',
    },

    grid: {
      flexDirection: 'column',
      flex: 1,
    },

    // Cutting mark (border inset untuk avoid overflow)
    cuttingMark: {
      position: 'absolute',
      top: '0.15mm',
      left: '0.15mm',
      right: '0.15mm',
      bottom: '0.15mm',
      borderWidth: 0.15,
      borderColor: '#cccccc',
      borderStyle: 'solid',
    },

    // Folding mark (garis lipat pertama - antara kolom 1 dan 2)
    foldingMark: {
      position: 'absolute',
      top: 0,
      left: FOLD_POSITION_1,
      width: '0.3mm',
      height: TAG_HEIGHT,
      backgroundColor: '#999999',
    },

    // Folding mark kedua (antara kolom 2 dan 3)
    foldingMark2: {
      position: 'absolute',
      top: 0,
      left: FOLD_POSITION_2,
      width: '0.3mm',
      height: TAG_HEIGHT,
      backgroundColor: '#999999',
    },

    row: {
      flexDirection: 'row',
      marginBottom: config.rowGap,
    },

    tagWrapper: {
      width: TAG_WIDTH,
      height: TAG_HEIGHT,
      flexDirection: 'row',
      position: 'relative',
      marginRight: config.colGap,
      overflow: 'hidden',
    },

    // Override margin for last item in row
    tagWrapperLast: {
      width: TAG_WIDTH,
      height: TAG_HEIGHT,
      flexDirection: 'row',
      position: 'relative',
      marginRight: 0,
      overflow: 'hidden',
    },

    // Container utama untuk kedua sisi (tanpa padding)
    tagContent: {
      flexDirection: 'row',
      width: '100%',
      height: '100%',
    },

    // Sisi Kiri (Depan) - 30mm x 45mm
    leftSide: {
      width: TAG_LEFT_SIDE,
      height: TAG_HEIGHT,
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
    },

    // SCAN ME Header Container
    scanMeHeader: {
      width: TAG_LEFT_SIDE,
      height: '6mm',
      backgroundColor: '#2563EB',
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Teks "SCAN ME"
    scanMeText: {
      fontSize: '6.5pt',
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
      letterSpacing: 0.5,
    },

    // QR Code area - SQUARE (25mm x 25mm)
    qrCodeWrapper: {
      width: '25mm',
      height: '25mm',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },

    qrCode: {
      width: '100%',
      height: '100%',
    },

    // Container teks bawah
    leftTextContainer: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '2mm',
    },

    frontText1: {
      fontSize: '6.5pt',
      fontWeight: 'bold',
      color: '#7C3AED',
      textAlign: 'center',
      lineHeight: 1.0,
    },

    frontText2: {
      fontSize: '5.5pt',
      color: '#4b5563',
      textAlign: 'center',
      marginTop: '2px',
      lineHeight: 1.0,
    },

    // Sisi Kanan (Belakang) - 60mm x 45mm (columns 2 + 3 combined for backward compatibility)
    rightSide: {
      width: TAG_RIGHT_SIDE,
      height: TAG_HEIGHT,
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
    },

    // Column 2 (Logo/Foto) - 30mm x 45mm
    column2Side: {
      width: TAG_COLUMN_2,
      height: TAG_HEIGHT,
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
    },

    // Logo Full Screen Portrait untuk Column 2
    logoFull: {
      width: TAG_COLUMN_2,
      height: TAG_HEIGHT,
      objectFit: 'contain',
    },

    // Custom Photo Full Screen Portrait untuk Column 2
    customPhotoFull: {
      width: TAG_COLUMN_2,
      height: TAG_HEIGHT,
      objectFit: 'cover',
    },

    // Column 3 (QR Aktivasi) - 30mm x 45mm
    column3Side: {
      width: TAG_COLUMN_3,
      height: TAG_HEIGHT,
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderLeftWidth: '0.3mm',
      borderLeftColor: '#999999',
      borderLeftStyle: 'solid',
    },

    // SCAN UNTUK AKTIVASI Header
    scanAktivasiHeader: {
      width: TAG_COLUMN_3,
      height: '6mm',
      backgroundColor: '#7C3AED',
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Teks "SCAN UNTUK AKTIVASI"
    scanAktivasiText: {
      fontSize: '5.5pt',
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
      letterSpacing: 0.3,
    },

    // QR Code area untuk Column 3
    qrCodeWrapperAktivasi: {
      width: '22mm',
      height: '22mm',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '2mm',
    },

    // Container untuk PIN text
    pinContainer: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '1mm',
    },

    // Teks PIN (merah, bold)
    pinText: {
      fontSize: '9pt',
      fontWeight: 'bold',
      color: '#EF4444',
      textAlign: 'center',
      lineHeight: 1.0,
    },

    // Serial number micro text (4pt, abu-abu gelap)
    serialTextMicro: {
      fontSize: '4pt',
      color: '#64748B',
      textAlign: 'center',
      position: 'absolute',
      bottom: '1mm',
      left: 0,
      right: 0,
    },

    // Footer
    footer: {
      position: 'absolute',
      bottom: '3mm',
      left: 0,
      right: 0,
      textAlign: 'center',
    },

    footerText: {
      fontSize: '8pt',
      color: '#777777',
    },
  });
}

// ============================================================================
// TYPES
// ============================================================================

interface TagItem {
  slug: string;
  qrDataUrl: string;
  activationQrDataUrl: string;
  activationPinPlain: string;
  serialNumber: string;
  isCustom: boolean;
  customPhotoUrl?: string;
}

interface CutFoldPDFDocumentProps {
  tags: TagItem[];
  totalPages: number;
  baseUrl?: string;
  paperSize?: PaperSize;
}

// ============================================================================
// COMPONENTS
// ============================================================================

export function CutFoldPDFDocument({ tags, totalPages, baseUrl = 'https://balikin.id', paperSize = 'a4' }: CutFoldPDFDocumentProps) {
  const config = PAPER_CONFIGS[paperSize];
  const styles = createStyles(paperSize);
  const { rows: ROWS, cols: COLS } = config;

  // Create all pages
  const pages = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    // Get tags for this page only
    const startIndex = (pageNum - 1) * (ROWS * COLS);
    const endIndex = Math.min(startIndex + (ROWS * COLS), tags.length);
    const pageTags = tags.slice(startIndex, endIndex);

    // Calculate grid positions
    const rows: Array<Array<{ tag: TagItem; isLast: boolean }>> = [];

    for (let row = 0; row < ROWS; row++) {
      const rowItems: Array<{ tag: TagItem; isLast: boolean }> = [];
      for (let col = 0; col < COLS; col++) {
        const index = row * COLS + col;
        const isLastInRow = col === COLS - 1;  // Mark last column for gap removal

        if (index < pageTags.length) {
          rowItems.push({ tag: pageTags[index], isLast: isLastInRow });
        } else {
          rowItems.push({
            tag: {
              slug: '',
              qrDataUrl: '',
              activationQrDataUrl: '',
              activationPinPlain: '',
              serialNumber: '',
              isCustom: false,
            },
            isLast: isLastInRow
          });
        }
      }
      // Only add row if it has any actual tags
      if (rowItems.some(item => item.tag.slug)) {
        rows.push(rowItems);
      }
    }

    // Create page content
    const pageContent = (
      <Page size={paperSize.toUpperCase()} style={styles.page} key={`page-${pageNum}`}>
        <View style={styles.grid}>
          {rows.map((rowItems, rowIndex) => (
            <View key={rowIndex} style={styles.row} wrap={false}>
              {rowItems.map((item, colIndex) => (
                item.tag.slug ? (
                  <View
                    key={`${rowIndex}-${colIndex}`}
                    style={item.isLast ? styles.tagWrapperLast : styles.tagWrapper}
                    wrap={false}
                  >
                    {/* Cutting Marks */}
                    <View style={styles.cuttingMark} />

                    {/* Folding Mark 1 */}
                    <View style={styles.foldingMark} />

                    {/* Folding Mark 2 */}
                    <View style={styles.foldingMark2} />

                    {/* Container untuk 3 kolom dengan Flexbox */}
                    <View style={styles.tagContent}>
                      {/* Column 1: QR Utama */}
                      <View style={styles.leftSide}>
                        {/* TOP: SCAN ME Header */}
                        <View style={styles.scanMeHeader}>
                          <Text style={styles.scanMeText}>SCAN ME</Text>
                        </View>

                        {/* CENTER: QR Code */}
                        <View style={styles.qrCodeWrapper}>
                          <Image src={item.tag.qrDataUrl} style={styles.qrCode} />
                        </View>

                        {/* BOTTOM: Teks Bawah */}
                        <View style={styles.leftTextContainer}>
                          <Text style={styles.frontText1}>BANTU BALIKIN</Text>
                          <Text style={styles.frontText2}>Scan QR tuk WA pemiliknya</Text>
                        </View>
                      </View>

                      {/* Column 2: Logo/Foto */}
                      <View style={styles.column2Side}>
                        {item.tag.isCustom && item.tag.customPhotoUrl ? (
                          <Image src={item.tag.customPhotoUrl} style={styles.customPhotoFull} />
                        ) : (
                          <Image src={`${baseUrl}/gantungan kunci logo.png`} style={styles.logoFull} />
                        )}
                      </View>

                      {/* Column 3: QR Aktivasi */}
                      <View style={styles.column3Side}>
                        {/* TOP: SCAN UNTUK AKTIVASI Header */}
                        <View style={styles.scanAktivasiHeader}>
                          <Text style={styles.scanAktivasiText}>SCAN UNTUK AKTIVASI</Text>
                        </View>

                        {/* CENTER: QR Code Aktivasi */}
                        {item.tag.activationQrDataUrl ? (
                          <View style={styles.qrCodeWrapperAktivasi}>
                            <Image src={item.tag.activationQrDataUrl} style={styles.qrCode} />
                          </View>
                        ) : null}

                        {/* BOTTOM: PIN Text */}
                        {item.tag.activationPinPlain ? (
                          <View style={styles.pinContainer}>
                            <Text style={styles.pinText}>PIN: {item.tag.activationPinPlain}</Text>
                          </View>
                        ) : null}

                        {/* Serial Number Micro */}
                        {item.tag.serialNumber ? (
                          <View style={{ position: 'absolute', bottom: '1mm', width: '100%' }}>
                            <Text style={styles.serialTextMicro}>{item.tag.serialNumber}</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </View>
                ) : (
                  <View
                    key={`${rowIndex}-${colIndex}`}
                    style={item.isLast ? styles.tagWrapperLast : styles.tagWrapper}
                    wrap={false}
                  />
                )
              ))}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Page {pageNum} of {totalPages} | Generated: {new Date().toLocaleString('id-ID')}
          </Text>
        </View>
      </Page>
    );

    pages.push(pageContent);
  }

  return <Document>{pages}</Document>;
}
