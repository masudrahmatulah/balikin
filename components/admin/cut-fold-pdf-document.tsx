import { Document, Page, Image, Text, View, StyleSheet } from '@react-pdf/renderer';

// ============================================================================
// CONSTANTS
// ============================================================================

const A4_WIDTH = '210mm';
const A4_HEIGHT = '297mm';
const PAGE_MARGIN = '10mm';

const TAG_WIDTH = '60mm';
const TAG_HEIGHT = '37mm';
const FOLD_POSITION = '30mm';
const GAP = '4mm';

const COLS = 3;
const ROWS = 7;
const TAGS_PER_PAGE = 21;

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
  },

  // Sisi Kiri (Depan) - 30mm x 37mm
  leftSide: {
    width: FOLD_POSITION,
    minWidth: FOLD_POSITION,
    maxWidth: FOLD_POSITION,
    flexGrow: 0,
    flexShrink: 0,
    borderRightWidth: 0.3,
    borderRightColor: '#999999',
    borderRightStyle: 'dashed',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '2mm',
    paddingHorizontal: '1.5mm',
  },

  // QR Code 24mm x 24mm
  qrCode: {
    width: '24mm',
    height: '24mm',
  },

  // Container teks dengan lebar penuh
  textContainer: {
    width: '100%',
    height: '9mm',
    justifyContent: 'center',
    alignItems: 'center',
  },

  frontText1: {
    fontSize: '6.5pt',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 1.0,
  },

  frontText2: {
    fontSize: '5.5pt',
    color: '#555555',
    textAlign: 'center',
    marginTop: '1px',
    lineHeight: 1.0,
  },

  // Sisi Kanan (Belakang) - 30mm x 37mm (ABSOLUTE POSITIONING)
  rightSide: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '30mm',
    minWidth: '30mm',
    maxWidth: '30mm',
    height: TAG_HEIGHT,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  // Container untuk logo
  logoContainer: {
    width: '18.5mm',
    height: '6mm',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '3mm',
  },

  // Logo di dalam container
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },

  subBrandText: {
    fontSize: '6pt',
    color: '#777777',
    width: '100%',
    textAlign: 'center',
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

function CutFoldTag({ slug, qrDataUrl }: TagItem) {
  return (
    <View style={styles.tagContainer}>
      {/* Cutting Marks */}
      <View style={styles.cuttingMark} />

      {/* Folding Mark */}
      <View style={styles.foldingMark} />

      {/* Front Side (Left) */}
      <View style={styles.frontSide}>
        <Image src={qrDataUrl} style={styles.qrCode} />
        <View style={styles.frontTextContainer}>
          <Text style={styles.frontText1}>BANTU BALIKIN</Text>
          <Text style={styles.frontText2}>Scan QR tuk WA pemiliknya</Text>
        </View>
      </View>

      {/* Back Side (Right) */}
      <View style={styles.rightSide}>
        <View style={styles.logoContainer}>
          <Image src="/logo-balikin-icon-128.png" style={styles.logo} />
        </View>
        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>BALIKIN</Text>
          <Text style={styles.subBrandText}>Smart Lost & Found</Text>
        </View>
      </View>
    </View>
  );
}

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
                    {/* Sisi Kiri (Depan) */}
                    <View style={styles.leftSide}>
                      <Image src={tag.qrDataUrl} style={styles.qrCode} />
                      <View style={styles.textContainer}>
                        <Text style={styles.frontText1}>BANTU BALIKIN</Text>
                        <Text style={styles.frontText2}>Scan QR tuk WA pemiliknya</Text>
                      </View>
                    </View>

                    {/* Sisi Kanan (Belakang) */}
                    <View style={styles.rightSide}>
                      <View style={styles.logoContainer}>
                        <Image src={`${baseUrl}/logo-icon.png`} style={styles.logo} />
                      </View>
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
