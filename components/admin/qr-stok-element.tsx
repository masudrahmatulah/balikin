'use client';

import { QRCodeSVG } from 'qrcode.react';
import type { Tag } from '@/db/schema';

interface QRStokElementProps {
  tag: Tag;
  x: number;  // position in mm
  y: number;  // position in mm
  scale: number;
  isSelected: boolean;
  onSelect: () => void;
  onMouseDown?: (e: React.MouseEvent, tag: Tag) => void;
}

const QR_WIDTH_MM = 50;  // 50mm width
const QR_HEIGHT_MM = 60; // 60mm height

export function QRStokElement({
  tag,
  x,
  y,
  scale,
  isSelected,
  onSelect,
  onMouseDown,
}: QRStokElementProps) {
  // Generate QR URL
  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/p/${tag.slug}`;

  const scaledWidth = QR_WIDTH_MM * scale;
  const scaledHeight = QR_HEIGHT_MM * scale;

  const handleDragStart = (e: React.MouseEvent) => {
    if (onMouseDown) {
      onMouseDown(e, tag);
    }
  };

  return (
    <div
      className={`absolute cursor-move transition-shadow ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      style={{
        left: `${x * scale}px`,
        top: `${y * scale}px`,
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
      }}
      onMouseDown={handleDragStart}
      onClick={onSelect}
    >
      {/* QR Card Container */}
      <div
        className="w-full h-full bg-white border-2 border-slate-900 rounded-lg flex flex-col items-center justify-center p-2 shadow-sm"
        style={{ fontSize: `${10 * scale}px` }}
      >
        {/* QR Code */}
        <div
          className="bg-white rounded flex items-center justify-center border border-slate-300"
          style={{
            width: `${36 * scale}px`,
            height: `${36 * scale}px`,
            marginBottom: `${4 * scale}px`,
          }}
        >
          <QRCodeSVG
            value={qrUrl}
            size={Math.floor(36 * scale)}
            level="H"
            includeMargin={false}
            fgColor="#000000"
            bgColor="#ffffff"
          />
        </div>

        {/* Tag Name */}
        <div
          className="text-slate-900 font-semibold text-center w-full"
          style={{ fontSize: `${7 * scale}px`, lineHeight: '1.2' }}
        >
          {tag.name}
        </div>

        {/* Slug */}
        <div
          className="text-slate-600 text-center font-mono w-full truncate"
          style={{ fontSize: `${5 * scale}px`, lineHeight: '1.2' }}
        >
          /p/{tag.slug}
        </div>

        {/* Branding */}
        <div
          className="text-slate-500 font-bold text-center"
          style={{ fontSize: `${4 * scale}px` }}
        >
          [BALIKIN]
        </div>
      </div>

      {/* Selection Ring */}
      {isSelected && (
        <div
          className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"
          style={{
            top: '-2px',
            left: '-2px',
            right: '-2px',
            bottom: '-2px',
          }}
        />
      )}
    </div>
  );
}
