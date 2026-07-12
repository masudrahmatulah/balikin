# Sticker VDP Implementation Summary

## ✅ What Was Implemented

### 1. UI/UX Updates (vdp-tool-form.tsx)

**Added Features:**
- A5 paper size option to the Paper Size dropdown
- Sticker product type dropdown that appears only when:
  - Material Type = "Stiker (Vinyl)"
  - Paper Size = "A5"
- Four sticker product options:
  - Stiker Balikin Pro (35×35mm, 6 per sheet)
  - Stiker Balikin Daily (25×25mm, 12 per sheet)
  - Stiker Balikin Micro (18×18mm, 20 per sheet)
  - Stiker Balikin Family (Mixed, 12 per sheet)
- Dynamic sheet estimation for A5 stickers
- Help text: "Desain 2 kolom: QR code di kiri, custom photo atau logo Balikin di kanan"

**Form State:**
```typescript
interface FormData {
  batchName: string;
  quantity: number;
  materialType: "sticker" | "acrylic" | "acrylic-cutfold";
  productType: "standard" | "student_kit" | "otomotif" | "pertanian" | "diklat";
  paperSize: "a4" | "a3" | "a5";  // ✨ Added "a5"
  stickerShape?: "circle" | "square" | "rectangle";
  stickerSize?: "small" | "medium" | "large";
  stickerProductKey: "stiker-pro" | "stiker-daily" | "stiker-micro" | "stiker-family";  // ✨ New field
}
```

### 2. Two-Column Sticker Generator (vdp-a5-sticker-twocol.ts)

**New File:** `/home/mesot01/balikin/lib/vdp-a5-sticker-twocol.ts`

**Key Features:**
- Generates A5 sticker sheets (148×210mm at 300 DPI)
- Two-column layout per sticker:
  - **Left column**: QR code (half width)
  - **Right column**: Custom photo or default Balikin logo (half width)
- Supports all 4 sticker product types
- Auto-handles custom photo URLs or base64 encoded images
- Creates default Balikin gradient logo if no custom photo
- Adds border lines between QR and photo
- Optional serial number display below stickers
- Async generator for streaming (memory efficient)

**Exported Functions:**
```typescript
export async function generateA5TwoColStickerSheet(
  tags: A5TwoColStickerTag[],
  productKey: StickerProductKey,
  defaultLogoBuffer?: Buffer
): Promise<Buffer>

export async function generateA5TwoColStickerSheets(
  tags: A5TwoColStickerTag[],
  productKey: StickerProductKey,
  defaultLogoBuffer?: Buffer
): Promise<Buffer[]>

export async function* generateA5TwoColStickerStream(
  tags: A5TwoColStickerTag[],
  productKey: StickerProductKey,
  defaultLogoBuffer?: Buffer
): AsyncGenerator<Buffer, void, unknown>
```

### 3. API Route Updates (app/admin/api/vdp/generate/route.ts)

**Changes:**
- Added import for `generateA5TwoColStickerStream`
- Extended `VDPGenerateRequest` interface with `stickerProductKey`
- Added logic to detect A5 sticker requests:
  ```typescript
  const isA5Sticker = materialType === "sticker" && paperSize === "a5" && stickerProductKey;
  ```
- Routes A5 sticker requests to use `generateA5TwoColStickerStream`
- Passes `stickerProductKey` as `StickerProductKey` type to generator

**Flow:**
```
POST /admin/api/vdp/generate
  ↓
Check materialType, paperSize, stickerProductKey
  ↓
If A5 Sticker:
  1. Create printBatches entry
  2. Generate activation data
  3. Insert tags into database
  4. Fetch tags from DB
  5. Generate A5 sheets using generateA5TwoColStickerStream
  6. Package PNG sheets into ZIP
  7. Return as base64 data URL
```

## 📁 Files Modified

1. **components/admin/vdp-tool-form.tsx**
   - Added A5 paper size option
   - Added stickerProductKey state
   - Added conditional sticker product dropdown
   - Updated getEstimatedSheets() function

2. **app/admin/api/vdp/generate/route.ts**
   - Added import for two-column generator
   - Updated VDPGenerateRequest interface
   - Added A5 sticker generation path

## 📄 Files Created

1. **lib/vdp-a5-sticker-twocol.ts** (new)
   - Two-column sticker generator implementation

2. **docs/STICKER_VDP_SETUP.md** (new)
   - User guide and documentation

3. **docs/STICKER_VDP_IMPLEMENTATION.md** (this file)
   - Technical implementation details

## 🎨 Design Specifications

### Sticker Layout

Each A5 sheet contains multiple stickers in a grid layout. Each sticker is divided into 2 columns:

```
┌─────────────────────────────────┐
│          │                      │
│   QR     │   Photo/Logo         │
│   Code   │   (custom or default)│
│   (B&W)  │   (Full Color)       │
│          │                      │
└─────────────────────────────────┘
```

### Product Grids

| Product | Size | Grid | Total | Layout |
|---------|------|------|-------|--------|
| Pro | 35×35mm | 2×3 | 6 | 2 cols, 3 rows |
| Daily | 25×25mm | 4×3 | 12 | 4 cols, 3 rows |
| Micro | 18×18mm | 5×4 | 20 | 5 cols, 4 rows |
| Family | Mixed | 3×4 | 12 | 3 cols, 4 rows (mixed) |

### Print Specifications

- **Resolution**: 300 DPI
- **Paper**: A5 (148×210mm) vinyl sticker sheet
- **Colors**: Full RGB color
- **Bleed**: Included in design
- **Cutting**: Cut lines included for manual cutting

## 🔄 Data Flow

### Generation Process

```
1. User fills form (batch name, quantity, paper size A5, sticker product)
2. Form sends POST to /admin/api/vdp/generate
3. API validates request
4. API creates printBatches record
5. API generates activation data for all tags
6. API inserts tags into database with:
   - slug
   - serialNumber (from batch)
   - activationPinPlain
   - customPhotoUrl (if custom order)
   - isCustom flag
7. API fetches tags from database
8. API calls generateA5TwoColStickerStream with:
   - tags array
   - stickerProductKey ("stiker-pro", etc)
9. Generator creates PNG sheets with:
   - QR codes (left column)
   - Custom photos or default logo (right column)
   - Border lines
   - Optional serial numbers
10. API packages PNG sheets into ZIP
11. API returns download URL as base64
12. Frontend downloads ZIP with all sheets
```

### Custom Photo Handling

```
Custom Photo URL
  ↓
If URL: fetch from Vercel Blob (public)
If base64: decode from data URL
  ↓
Resize to column width/height
Fit mode: cover (center-cropped)
  ↓
Composite onto right column of sticker
```

### Default Logo

If no custom photo:
- Create Balikin "B" logo SVG on-the-fly
- Linear gradient background (#f0f9ff to #e0e7ff)
- Dark circle with white "B" letter
- Dynamically sized based on column dimensions

## 🧪 Testing Checklist

- [ ] Form displays A5 option when materialType = "sticker"
- [ ] Sticker product dropdown appears only for A5
- [ ] All 4 sticker products are selectable
- [ ] Sheet estimation is correct for each product
- [ ] API accepts stickerProductKey parameter
- [ ] A5 sticker generation creates correct number of sheets
- [ ] QR codes are scannable
- [ ] Default logo displays when no custom photo
- [ ] Custom photo displays correctly from URL
- [ ] Serial numbers display correctly (if enabled)
- [ ] Border lines are visible between columns
- [ ] ZIP download works and contains correct PNG files
- [ ] PNG files are 300 DPI and correct dimensions

## 🚀 Deployment Notes

### Prerequisites
- Node.js 20+ (already using)
- `sharp` library (already installed)
- `qrcode` library (already installed)
- Vercel Blob storage enabled (for custom photos)

### Environment Variables
Required for custom photo uploads:
```env
BLOB_READ_WRITE_TOKEN=...
```

### Database Schema
No new migrations required. Existing `tags` table fields support:
- `customPhotoUrl`: Stores custom photo URL or base64
- `isCustom`: Flag for custom orders
- `serialNumber`: Print batch tracking

### Build & Deploy
```bash
npm run build   # ✅ Builds successfully
npm run dev     # ✅ Runs without errors
```

## 📚 References

### Related Files
- `lib/sticker-template.ts` - Product configurations, grid layouts
- `lib/vdp-a5-sticker.ts` - Original single-column generator (fallback)
- `lib/vdp-engine.ts` - 6-column VDP engine for A3/A4

### Database Schema
- `db/schema.ts` - Tags table with customPhotoUrl, isCustom, serialNumber fields

### Admin API
- `app/admin/api/vdp/generate/route.ts` - Main generation endpoint
- `app/admin/api/vdp/download/[id]/route.ts` - Download handler

## ⚠️ Known Limitations

1. **Sticker Family Layout**: Uses simplified layout (3×4 grid). May need refinement for exact size distribution in future.

2. **Custom Photo Size**: Photo is center-cropped (cover fit). If photo is not square, content may be cut off.

3. **Serial Numbers**: Optional, only displayed if provided in tag data.

4. **Batch Size**: Supports 1-1000 stickers per batch. Very large batches (>1000) would require pagination.

5. **Network Photos**: Custom photo URLs must be publicly accessible. Expired URLs will fallback to default logo.

## 🔮 Future Enhancements

- [ ] Support for 1-column layout (QR only, no photo)
- [ ] Support for 3-column layout (QR + Photo + Text info)
- [ ] Batch watermarking (date, batch number on each sheet)
- [ ] Customizable logo/branding image
- [ ] Direct printer integration
- [ ] Live preview before download
- [ ] Batch status tracking and history
- [ ] Duplicate sheet detection
- [ ] Barcode support (with QR)
