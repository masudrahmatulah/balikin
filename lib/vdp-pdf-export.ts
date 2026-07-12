/**
 * Combine already-rendered A5 sticker sheet PNGs (Sharp output) into a single
 * multi-page A5 PDF, one page per sheet.
 */

import { jsPDF } from 'jspdf';

const A5_FORMAT: [number, number] = [148, 210]; // A5 portrait, mm - explicit to guarantee exact page size

export async function buildStickerSheetsPdf(sheetBuffers: Buffer[]): Promise<Buffer> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: A5_FORMAT });

  sheetBuffers.forEach((buffer, index) => {
    if (index > 0) {
      doc.addPage(A5_FORMAT, 'portrait');
    }
    const dataUri = `data:image/png;base64,${buffer.toString('base64')}`;
    doc.addImage(dataUri, 'PNG', 0, 0, A5_FORMAT[0], A5_FORMAT[1]);
  });

  return Buffer.from(doc.output('arraybuffer'));
}
