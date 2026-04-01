'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { GripVertical, RotateCw } from 'lucide-react';
import type { StickerItem } from '@/lib/layout-editor';
import { getStickerDimensions } from '@/lib/sticker-template';

interface StickerElementProps {
  item: StickerItem;
  tagSlug: string;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<StickerItem>) => void;
  scale: number;
  onMouseDown?: (e: React.MouseEvent, item: StickerItem) => void;
}

export function StickerElement({
  item,
  tagSlug,
  isSelected,
  onSelect,
  onUpdate,
  scale,
  onMouseDown,
}: StickerElementProps) {
  const dimensions = getStickerDimensions(item.shape, item.size);

  // Generate QR URL
  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://balikin.id'}/p/${tagSlug}`;

  const scaledWidth = dimensions.width * scale;
  const scaledHeight = dimensions.height * scale;

  const shapeClass = {
    circle: 'rounded-full',
    square: 'rounded-lg',
    rectangle: 'rounded-lg',
  }[item.shape];

  const handleDragStart = (e: React.MouseEvent) => {
    if (onMouseDown) {
      onMouseDown(e, item);
    }
  };

  return (
    <div
      className={`absolute cursor-move transition-shadow ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      style={{
        left: `${item.x * scale}px`,
        top: `${item.y * scale}px`,
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        transform: `rotate(${item.rotation}deg)`,
        transformOrigin: 'center center',
      }}
      onMouseDown={handleDragStart}
      onClick={onSelect}
    >
      {/* Sticker Background */}
      <div
        className={`w-full h-full bg-sky-500 border-2 border-sky-700 flex flex-col items-center justify-center overflow-hidden ${shapeClass}`}
        style={{ fontSize: `${10 * scale}px` }}
      >
        {/* Header Text */}
        <div className="text-white font-bold text-center px-1" style={{ fontSize: `${7 * scale}px` }}>
          MENEMUKAN BARANG INI?
        </div>

        {/* QR Code Container */}
        <div
          className="bg-white rounded flex items-center justify-center"
          style={{
            width: `${22 * scale}px`,
            height: `${22 * scale}px`,
            margin: `${3 * scale}px`,
          }}
        >
          <QRCodeSVG
            value={qrUrl}
            size={Math.floor(22 * scale)}
            level="H"
            includeMargin={false}
            fgColor="#1f2937"
            bgColor="#ffffff"
          />
        </div>

        {/* Footer Text */}
        <div className="text-white text-center px-1" style={{ fontSize: `${5 * scale}px` }}>
          <div>Scan untuk hubungi pemilik.</div>
          <div>Terima kasih orang baik!</div>
        </div>

        {/* Branding */}
        <div className="text-white font-bold text-center" style={{ fontSize: `${4 * scale}px` }}>
          [BALIKIN]
        </div>
      </div>

      {/* Drag Handle - Only show when selected */}
      {isSelected && (
        <>
          <div
            className="absolute top-1/2 -left-3 -translate-y-1/2 w-3 h-6 bg-blue-500 rounded-l cursor-grab active:cursor-grabbing flex items-center justify-center"
            onMouseDown={handleDragStart}
          >
            <GripVertical className="w-3 h-3 text-white" />
          </div>

          {/* Rotation Handle */}
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-blue-500 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center"
            onMouseDown={(e) => {
              e.stopPropagation();
              // Start rotation
              const startX = e.clientX;
              const startY = e.clientY;
              const centerX = e.currentTarget.parentElement!.getBoundingClientRect().left + scaledWidth / 2;
              const centerY = e.currentTarget.parentElement!.getBoundingClientRect().top + scaledHeight / 2;

              const handleMouseMove = (moveEvent: MouseEvent) => {
                const angle = Math.atan2(
                  moveEvent.clientY - centerY,
                  moveEvent.clientX - centerX
                ) * (180 / Math.PI);
                onUpdate({ rotation: Math.round((angle + 90 + 360) % 360) });
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <RotateCw className="w-3 h-3 text-white" />
          </div>
        </>
      )}

      {/* Bleed Area Indicator */}
      <div
        className={`absolute border border-dashed border-gray-400 pointer-events-none ${shapeClass}`}
        style={{
          left: `${-2 * scale}px`,
          top: `${-2 * scale}px`,
          width: `${scaledWidth + 4 * scale}px`,
          height: `${scaledHeight + 4 * scale}px`,
          borderWidth: `${0.5 * scale}px`,
        }}
      />
    </div>
  );
}
