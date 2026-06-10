import { Document, Page, Image, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { PaperSize } from '@/lib/sticker-template';

// ============================================================================
// CONSTANTS
// ============================================================================

// Tag dimensions - FIXED untuk presisi
// Setiap sisi: 30mm kiri (QR) + 30mm kanan (logo) = 60mm content
// Cutting mark menggunakan inset positioning (tidak menambah lebar)
// TOTAL TAG WIDTH = 60mm (presisi, tanpa overflow)

const TAG_WIDTH = '60mm';
const TAG_HEIGHT = '45mm';
const FOLD_POSITION = '30mm';  // Posisi lipat di tengah (30mm konten)
const TAG_LEFT_SIDE = '30mm';
const TAG_RIGHT_SIDE = '30mm';

// Paper-specific configurations dengan calculated gaps
// Menggunakan LANDSCAPE orientation: width > height
const PAPER_CONFIGS = {
  a4: {
    // A4 landscape: 297mm width × 210mm height
    width: '297mm',
    height: '210mm',
    margin: '12mm',
    rows: 5,
    cols: 3,
    rowGap: '3mm',
    // Perhitungan: (273 - 3*2) / 3 = 89.6mm slot per kolom
    // Tag 60mm + gap 2mm = 62mm ✅ MUAT!
    colGap: '2mm',
  },
  a3: {
    // A3 portrait: 297mm width × 420mm height (React-PDF default orientation)
    width: '297mm',
    height: '420mm',
    margin: '8mm',
    rows: 8,
    cols: 4,
    rowGap: '5mm',
    // Perhitungan OPTIMAL: (420 - 16) / 8 = 50.5mm slot per baris
    // Tag 45mm + gap 1mm = 46mm ✅ MUAT!
    // Width: (297 - 16) / 4 = 70.25mm slot per kolom
    // Tag 60mm + gap 6mm = 66mm ✅ AMAN!
    // 4 kolom × 8 baris = 32 tags per halaman
    colGap: '6mm',
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

    // Folding mark (garis lipat tengah)
    foldingMark: {
      position: 'absolute',
      top: 0,
      left: FOLD_POSITION,
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

    // Sisi Kanan (Belakang) - 30mm x 45mm
    rightSide: {
      width: TAG_RIGHT_SIDE,
      height: TAG_HEIGHT,
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
    },

    // Logo Full Screen Portrait
    logoFull: {
      width: TAG_RIGHT_SIDE,
      height: TAG_HEIGHT,
      objectFit: 'contain',
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
          rowItems.push({ tag: { slug: '', qrDataUrl: '' }, isLast: isLastInRow });
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

                    {/* Folding Mark */}
                    <View style={styles.foldingMark} />

                    {/* Container untuk kedua sisi dengan Flexbox */}
                    <View style={styles.tagContent}>
                      {/* Sisi Kiri (Depan) */}
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

                      {/* Sisi Kanan (Belakang) */}
                      <View style={styles.rightSide}>
                        <Image src={`${baseUrl}/gantungan kunci logo.png`} style={styles.logoFull} />
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
