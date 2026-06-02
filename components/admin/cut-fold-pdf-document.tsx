import { Document, Page, Image, Text, View, StyleSheet } from '@react-pdf/renderer';

// ============================================================================
// CONSTANTS
// ============================================================================

const A4_WIDTH = '210mm';
const A4_HEIGHT = '297mm';
const PAGE_MARGIN = '10mm';

const TAG_WIDTH = '70mm';
const TAG_HEIGHT = '45mm';
const FOLD_POSITION = '35mm';
const GAP = '4mm';

const COLS = 2;
const ROWS = 5;
const TAGS_PER_PAGE = 10;

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

  // Sisi Kiri (Depan) - 35mm x 45mm
  leftSide: {
    width: '35mm',
    minWidth: '35mm',
    maxWidth: '35mm',
    height: TAG_HEIGHT,
    flexGrow: 0,
    flexShrink: 0,
    borderRightWidth: 0.3,
    borderRightColor: '#999999',
    borderRightStyle: 'dashed',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '2mm',
    paddingHorizontal: '2.5mm',
    backgroundColor: '#FFFFFF',
  },

  // Badge "SCAN ME" hitam
  scanMeBadge: {
    backgroundColor: '#111111',
    borderRadius: '2mm',
    paddingHorizontal: '3mm',
    paddingVertical: '1mm',
    marginTop: '2mm',
    marginBottom: '2mm',
  },

  // Teks "SCAN ME" putih di dalam badge
  scanMeText: {
    fontSize: '7pt',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // QR Code 30mm x 30mm
  qrCode: {
    width: '30mm',
    height: '30mm',
  },

  // Container teks bawah dengan jarak 3mm dari QR
  leftTextContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '3mm',
  },

  frontText1: {
    fontSize: '7pt',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 1.1,
  },

  frontText2: {
    fontSize: '6pt',
    color: '#555555',
    textAlign: 'center',
    marginTop: '2px',
    lineHeight: 1.1,
  },

  // Sisi Kanan (Belakang) - 35mm x 45mm (ABSOLUTE POSITIONING)
  rightSide: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '35mm',
    minWidth: '35mm',
    maxWidth: '35mm',
    height: TAG_HEIGHT,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#121318',
  },

  // Logo persegi 26mm x 26mm dengan sudut melengkung
  logoIcon: {
    width: '26mm',
    height: '26mm',
    objectFit: 'contain',
    borderRadius: '4mm',
    marginTop: '4mm',
    marginBottom: '2mm',
  },

  subBrandText: {
    fontSize: '7pt',
    fontWeight: 'medium',
    color: '#A1A1AA',
    width: '100%',
    textAlign: 'center',
    letterSpacing: '0.3px',
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

                    {/* Sisi Kiri (Depan) */}
                    <View style={styles.leftSide}>
                      <View style={styles.scanMeBadge}>
                        <Text style={styles.scanMeText}>SCAN ME</Text>
                      </View>
                      <Image src={tag.qrDataUrl} style={styles.qrCode} />
                      <View style={styles.leftTextContainer}>
                        <Text style={styles.frontText1}>BANTU BALIKIN</Text>
                        <Text style={styles.frontText2}>Scan QR tuk WA pemiliknya</Text>
                      </View>
                    </View>

                    {/* Sisi Kanan (Belakang) */}
                    <View style={styles.rightSide}>
                      <Image src={`${baseUrl}/logo-diakrilik.png`} style={styles.logoIcon} />
                      <Text style={styles.subBrandText}>Smart Lost & Found</Text>
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
