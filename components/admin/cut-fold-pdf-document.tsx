import { Document, Page, Image, Text, View, StyleSheet } from '@react-pdf/renderer';

// ============================================================================
// CONSTANTS
// ============================================================================

const A4_WIDTH = '210mm';
const A4_HEIGHT = '297mm';
const PAGE_MARGIN = '10mm';

const TAG_WIDTH = '58mm';
const TAG_HEIGHT = '45mm';
const FOLD_POSITION = '29mm';
const GAP = '4mm';

const COLS = 3;
const ROWS = 5;
const TAGS_PER_PAGE = 15;

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  page: {
    width: A4_WIDTH,
    height: A4_HEIGHT,
    padding: PAGE_MARGIN,
    flexDirection: 'column',
  },

  grid: {
    flexDirection: 'column',
    flex: 1,
  },

  // Cutting mark (border luar)
  cuttingMark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 0.3,
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
    marginBottom: GAP,
  },

  tagWrapper: {
    width: TAG_WIDTH,
    height: TAG_HEIGHT,
    flexDirection: 'row',
    borderWidth: 0.3,
    borderColor: '#cccccc',
    borderStyle: 'solid',
    position: 'relative',
    margin: '2mm',
    overflow: 'hidden',
  },

  // Sisi Kiri (Depan) - 29mm x 45mm dengan space-between
  leftSide: {
    width: '29mm',
    minWidth: '29mm',
    maxWidth: '29mm',
    height: TAG_HEIGHT,
    flexGrow: 0,
    flexShrink: 0,
    borderRightWidth: 0.3,
    borderRightColor: '#999999',
    borderRightStyle: 'dashed',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  // SCAN ME Header Container - Cyberpunk Glow (Blue Electric)
  scanMeHeader: {
    width: '29mm',
    height: '6mm',
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Teks "SCAN ME" putih tebal
  scanMeText: {
    fontSize: '6.5pt',
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // QR Code 25mm x 25mm - otomatis di tengah karena space-between
  qrCode: {
    width: '25mm',
    height: '25mm',
  },

  // Container teks bawah dengan marginBottom sebagai padding pengaman
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

  // Sisi Kanan (Belakang) - 29mm x 45mm (FULL SCREEN IMAGE)
  rightSide: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '29mm',
    minWidth: '29mm',
    maxWidth: '29mm',
    height: TAG_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },

  // Logo Full Screen Portrait - objectFit cover untuk fill penuh
  logoFull: {
    width: '29mm',
    height: '45mm',
    objectFit: 'cover',
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
}

// ============================================================================
// COMPONENTS
// ============================================================================

export function CutFoldPDFDocument({ tags, totalPages, baseUrl = 'https://balikin.id' }: CutFoldPDFDocumentProps) {
  // Create all pages
  const pages = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    // Get tags for this page only
    const startIndex = (pageNum - 1) * TAGS_PER_PAGE;
    const endIndex = Math.min(startIndex + TAGS_PER_PAGE, tags.length);
    const pageTags = tags.slice(startIndex, endIndex);

    // Calculate grid positions
    const rows: Array<TagItem[]> = [];

    for (let row = 0; row < ROWS; row++) {
      const rowTags: TagItem[] = [];
      for (let col = 0; col < COLS; col++) {
        const index = row * COLS + col;
        if (index < pageTags.length) {
          rowTags.push(pageTags[index]);
        } else {
          rowTags.push({ slug: '', qrDataUrl: '' });
        }
      }
      rows.push(rowTags);
    }

    // Remove last row if all empty
    if (rows.length > 0 && rows[rows.length - 1].every(tag => !tag.slug)) {
      rows.pop();
    }

    // Create page content
    const pageContent = (
      <Page size="A4" style={styles.page} key={`page-${pageNum}`}>
        <View style={styles.grid}>
          {rows.map((rowTags, rowIndex) => (
            <View key={rowIndex} style={styles.row} wrap={false}>
              {rowTags.map((tag, colIndex) => (
                tag.slug ? (
                  <View key={`${rowIndex}-${colIndex}`} style={styles.tagWrapper} wrap={false}>
                    {/* Cutting Marks */}
                    <View style={styles.cuttingMark} />

                    {/* Folding Mark */}
                    <View style={styles.foldingMark} />

                    {/* Sisi Kiri (Depan) - space-between untuk distribusi vertikal sempurna */}
                    <View style={styles.leftSide}>
                      {/* TOP: SCAN ME Header */}
                      <View style={styles.scanMeHeader}>
                        <Text style={styles.scanMeText}>SCAN ME</Text>
                      </View>

                      {/* CENTER: QR Code - otomatis di tengah karena space-between */}
                      <Image src={tag.qrDataUrl} style={styles.qrCode} />

                      {/* BOTTOM: Teks Bawah */}
                      <View style={styles.leftTextContainer}>
                        <Text style={styles.frontText1}>BANTU BALIKIN</Text>
                        <Text style={styles.frontText2}>Scan QR tuk WA pemiliknya</Text>
                      </View>
                    </View>

                    {/* Sisi Kanan (Belakang) - Full Screen Logo */}
                    <View style={styles.rightSide}>
                      <Image src={`${baseUrl}/gantungan kunci logo.png`} style={styles.logoFull} />
                    </View>
                  </View>
                ) : (
                  <View key={`${rowIndex}-${colIndex}`} style={styles.tagWrapper} wrap={false} />
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
