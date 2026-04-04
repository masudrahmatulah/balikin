'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { QRStokElement } from './qr-stok-element';
import { Alert } from '@/components/ui/alert';
import type { Tag } from '@/db/schema';
import { getPaperDimensions, mmToPx, pxToMm } from '@/lib/layout-editor';

// QR dimensions in mm
const QR_WIDTH = 50;
const QR_HEIGHT = 60;

interface QRItem {
  id: string;
  tagId: string;
  tag: Tag;
  x: number;  // position in mm
  y: number;  // position in mm
}

interface QRLayoutEditorClientProps {
  initialTags: Tag[];
}

export function QRLayoutEditorClient({ initialTags }: QRLayoutEditorClientProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<QRItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize items in 3-column grid layout
  useEffect(() => {
    if (initialTags.length > 0 && items.length === 0) {
      const newItems: QRItem[] = [];

      // 3-column grid layout
      const cols = 3;
      const startX = 20;  // margin left
      const startY = 20;  // margin top
      const colSpacing = 70;  // horizontal spacing (50mm + 20mm gap)
      const rowSpacing = 80;  // vertical spacing (60mm + 20mm gap)

      initialTags.forEach((tag, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);

        const item: QRItem = {
          id: nanoid(),
          tagId: tag.id,
          tag,
          x: startX + col * colSpacing,
          y: startY + row * rowSpacing,
        };

        newItems.push(item);
      });

      setItems(newItems);
      if (newItems.length > 0) {
        setSelectedId(newItems[0].id);
      }
    }
  }, [initialTags, items.length]);

  // Calculate scale to fit container
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 40;
        const [paperWidth] = getPaperDimensions('a4', 'portrait');
        const paperWidthPx = mmToPx(paperWidth);
        const newScale = Math.min(1, containerWidth / paperWidthPx);
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent, tag: Tag) => {
    e.stopPropagation();
    const item = items.find(i => i.tagId === tag.id);
    if (!item) return;

    setDraggingId(item.id);
    setIsDragging(true);

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect) {
      const itemX = item.x * scale;
      const itemY = item.y * scale;
      setDragOffset({
        x: e.clientX - canvasRect.left - itemX,
        y: e.clientY - canvasRect.top - itemY,
      });
    }

    setSelectedId(item.id);
  }, [scale, items]);

  // Handle mouse move for dragging
  useEffect(() => {
    if (!isDragging || !draggingId || !canvasRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvasRect = canvasRef.current!.getBoundingClientRect();
      const x = pxToMm(e.clientX - canvasRect.left - dragOffset.x);
      const y = pxToMm(e.clientY - canvasRect.top - dragOffset.y);

      // Constrain to A4 paper bounds (portrait: 210mm x 297mm)
      const maxX = 210 - QR_WIDTH;
      const maxY = 297 - QR_HEIGHT;

      const constrainedX = Math.max(0, Math.min(x, maxX));
      const constrainedY = Math.max(0, Math.min(y, maxY));

      setItems(prev =>
        prev.map(item =>
          item.id === draggingId
            ? { ...item, x: constrainedX, y: constrainedY }
            : item
        )
      );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggingId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, draggingId, dragOffset]);

  // Update item position
  const handleUpdateItem = useCallback((id: string, x: number, y: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, x, y } : item
      )
    );
  }, []);

  // Print
  const handlePrint = useCallback(() => {
    document.body.classList.add('printing-layout-mode');
    window.print();
    document.body.classList.remove('printing-layout-mode');
  }, []);

  // Get selected item
  const selectedItem = items.find(item => item.id === selectedId) || null;

  // Calculate A4 dimensions
  const [paperWidth, paperHeight] = getPaperDimensions('a4', 'portrait');
  const paperWidthPx = mmToPx(paperWidth);
  const paperHeightPx = mmToPx(paperHeight);

  return (
    <div className="flex gap-6">
      {/* Main Canvas Area */}
      <div className="flex-1">
        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Toolbar */}
        <div className="mb-4 flex items-center justify-between gap-3 no-print">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {items.length} QR code{items.length !== 1 ? 's' : ''} •
            Drag untuk mengatur posisi
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/admin/qr-stok')}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-sm"
            >
              Print
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div ref={containerRef} className="bg-slate-200 dark:bg-slate-800 rounded-lg p-6 overflow-auto">
          <div
            ref={canvasRef}
            className="bg-white shadow-lg mx-auto relative no-print"
            style={{
              width: `${paperWidthPx * scale}px`,
              height: `${paperHeightPx * scale}px`,
            }}
          >
            {/* Grid Background */}
            <div className="absolute inset-0 pointer-events-none">
              {/* 10mm grid */}
              <svg
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="smallGrid"
                    width={mmToPx(10) * scale}
                    height={mmToPx(10) * scale}
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d={`M ${mmToPx(10) * scale} 0 L 0 0 0 ${mmToPx(10) * scale}`}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#smallGrid)" />
              </svg>
            </div>

            {/* QR Items */}
            {items.map((item) => (
              <QRStokElement
                key={item.id}
                tag={item.tag}
                x={item.x}
                y={item.y}
                scale={scale}
                isSelected={selectedId === item.id}
                onSelect={() => setSelectedId(item.id)}
                onMouseDown={handleMouseDown}
              />
            ))}

            {/* Selected Item Outline */}
            {selectedItem && (
              <div
                className="absolute border-2 border-blue-500 pointer-events-none"
                style={{
                  left: `${selectedItem.x * scale}px`,
                  top: `${selectedItem.y * scale}px`,
                  width: `${QR_WIDTH * scale}px`,
                  height: `${QR_HEIGHT * scale}px`,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 no-print">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Informasi Layout
          </h3>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Jumlah QR:</span>
              <span className="font-medium">{items.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Ukuran Kertas:</span>
              <span className="font-medium">A4</span>
            </div>
            <div className="flex justify-between">
              <span>Orientasi:</span>
              <span className="font-medium">Portrait</span>
            </div>
            {selectedItem && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="font-medium text-slate-900 dark:text-white mb-1">
                  QR Terpilih
                </p>
                <p className="text-xs">{selectedItem.tag.name}</p>
                <p className="text-xs font-mono">/p/{selectedItem.tag.slug}</p>
                <p className="text-xs mt-2">
                  Posisi: X: {Math.round(selectedItem.x)}mm, Y: {Math.round(selectedItem.y)}mm
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
