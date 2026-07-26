/**
 * Combine the 6-column acrylic VDP row PNGs (Sharp output, one row = 2 packets
 * of QR/Logo/QR) into a single multi-page PDF sized to the selected paper
 * (A3/A4/A5), packing as many rows per page as fit instead of shipping one
 * PNG file per row.
 */

import sharp from 'sharp';
import { jsPDF } from 'jspdf';
import { PX_PER_MM } from './acrylic-shapes';
import { PAPER_DIMENSIONS, type PaperSize } from './sticker-template';

const PAGE_MARGIN_MM = 5;
const ROW_GAP_MM = 3;

export async function buildAcrylicRowsPdf(
  rowBuffers: Buffer[],
  paperSize: PaperSize
): Promise<Buffer> {
  if (rowBuffers.length === 0) {
    throw new Error('No rows to render into PDF');
  }

  const dimsMm = await Promise.all(
    rowBuffers.map(async (buffer) => {
      const { width = 0, height = 0 } = await sharp(buffer).metadata();
      return { widthMm: width / PX_PER_MM, heightMm: height / PX_PER_MM };
    })
  );

  const rowWidthMm = Math.max(...dimsMm.map((d) => d.widthMm));
  const rowHeightMm = Math.max(...dimsMm.map((d) => d.heightMm));

  const landscape = PAPER_DIMENSIONS[paperSize].landscape;
  const portrait = PAPER_DIMENSIONS[paperSize].portrait;
  const fitsLandscape = landscape[0] - PAGE_MARGIN_MM * 2 >= rowWidthMm;
  const [paperWidthMm, paperHeightMm] = fitsLandscape ? landscape : portrait;
  const orientation: 'landscape' | 'portrait' = fitsLandscape ? 'landscape' : 'portrait';

  const usableWidthMm = paperWidthMm - PAGE_MARGIN_MM * 2;
  const usableHeightMm = paperHeightMm - PAGE_MARGIN_MM * 2;

  // Scale down uniformly only if a single row still doesn't fit the page width.
  const scale = rowWidthMm > usableWidthMm ? usableWidthMm / rowWidthMm : 1;
  const cellWidthMm = rowWidthMm * scale;
  const cellHeightMm = rowHeightMm * scale;

  const cols = Math.max(1, Math.floor((usableWidthMm + ROW_GAP_MM) / (cellWidthMm + ROW_GAP_MM)));
  const rowsPerPage = Math.max(1, Math.floor((usableHeightMm + ROW_GAP_MM) / (cellHeightMm + ROW_GAP_MM)));
  const itemsPerPage = cols * rowsPerPage;

  const gridWidthMm = cols * cellWidthMm + (cols - 1) * ROW_GAP_MM;
  const gridHeightMm = rowsPerPage * cellHeightMm + (rowsPerPage - 1) * ROW_GAP_MM;
  const offsetXMm = PAGE_MARGIN_MM + Math.max(0, (usableWidthMm - gridWidthMm) / 2);
  const offsetYMm = PAGE_MARGIN_MM + Math.max(0, (usableHeightMm - gridHeightMm) / 2);

  const doc = new jsPDF({ orientation, unit: 'mm', format: [paperWidthMm, paperHeightMm] });

  rowBuffers.forEach((buffer, index) => {
    const pageIndex = Math.floor(index / itemsPerPage);
    const posInPage = index % itemsPerPage;
    const row = Math.floor(posInPage / cols);
    const col = posInPage % cols;

    if (posInPage === 0 && pageIndex > 0) {
      doc.addPage([paperWidthMm, paperHeightMm], orientation);
    }

    const { widthMm, heightMm } = dimsMm[index];
    const drawWidthMm = widthMm * scale;
    const drawHeightMm = heightMm * scale;
    const x = offsetXMm + col * (cellWidthMm + ROW_GAP_MM);
    const y = offsetYMm + row * (cellHeightMm + ROW_GAP_MM);

    const dataUri = `data:image/png;base64,${buffer.toString('base64')}`;
    doc.addImage(dataUri, 'PNG', x, y, drawWidthMm, drawHeightMm);
  });

  return Buffer.from(doc.output('arraybuffer'));
}
