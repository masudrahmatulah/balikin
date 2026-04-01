'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { StickerElement } from './sticker-element';
import type { StickerItem } from '@/lib/layout-editor';
import { getPaperDimensions, mmToPx, pxToMm } from '@/lib/layout-editor';
import type { StickerShape, StickerSize } from '@/lib/sticker-template';

interface LayoutCanvasProps {
  items: StickerItem[];
  paperSize: 'a3' | 'a4';
  orientation: 'landscape' | 'portrait';
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateItem: (id: string, updates: Partial<StickerItem>) => void;
  onAddItem?: (x: number, y: number) => void;
  getTagSlug: (tagId: string) => string;
}

export function LayoutCanvas({
  items,
  paperSize,
  orientation,
  selectedId,
  onSelect,
  onUpdateItem,
  onAddItem,
  getTagSlug,
}: LayoutCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Calculate scale to fit container
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 40; // padding
        const [paperWidth] = getPaperDimensions(paperSize, orientation);
        const paperWidthPx = mmToPx(paperWidth);
        const newScale = Math.min(1, containerWidth / paperWidthPx);
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [paperSize, orientation]);

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent, item: StickerItem) => {
    e.stopPropagation();
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

    onSelect(item.id);
  }, [scale, onSelect]);

  // Handle mouse move for dragging
  useEffect(() => {
    if (!isDragging || !draggingId || !canvasRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvasRect = canvasRef.current!.getBoundingClientRect();
      const x = pxToMm(e.clientX - canvasRect.left - dragOffset.x);
      const y = pxToMm(e.clientY - canvasRect.top - dragOffset.y);

      // Get paper bounds
      const [paperWidth, paperHeight] = getPaperDimensions(paperSize, orientation);
      const margin = 10;

      // Constrain to paper bounds
      const item = items.find(i => i.id === draggingId);
      if (item) {
        // Get item dimensions (simplified - could be improved)
        const itemSize = item.size === 'small' ? 30 : item.size === 'medium' ? 40 : 50;
        const constrainedX = Math.max(margin, Math.min(x, paperWidth - itemSize - margin));
        const constrainedY = Math.max(margin, Math.min(y, paperHeight - itemSize - margin));

        onUpdateItem(draggingId, { x: constrainedX, y: constrainedY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggingId(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, draggingId, dragOffset, items, paperSize, orientation, onUpdateItem, scale]);

  // Handle click on canvas to deselect
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelect(null);
    }
  };

  // Handle double click to add item
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!onAddItem || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = pxToMm(e.clientX - canvasRect.left);
    const y = pxToMm(e.clientY - canvasRect.top);
    onAddItem(x, y);
  };

  const [paperWidth, paperHeight] = getPaperDimensions(paperSize, orientation);
  const canvasWidth = mmToPx(paperWidth);
  const canvasHeight = mmToPx(paperHeight);

  return (
    <div ref={containerRef} className="w-full overflow-auto">
      <div className="flex justify-center">
        <div
          ref={canvasRef}
          className="relative bg-white shadow-lg border border-gray-300"
          style={{
            width: `${canvasWidth * scale}px`,
            height: `${canvasHeight * scale}px`,
            minWidth: '300px',
            minHeight: '200px',
          }}
          onClick={handleCanvasClick}
          onDoubleClick={handleDoubleClick}
        >
          {/* Paper background pattern */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, #ccc 1px, transparent 1px),
                linear-gradient(to bottom, #ccc 1px, transparent 1px)
              `,
              backgroundSize: `${mmToPx(10) * scale}px ${mmToPx(10) * scale}px`,
            }}
          />

          {/* Grid lines every 50mm */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, #999 1px, transparent 1px),
                linear-gradient(to bottom, #999 1px, transparent 1px)
              `,
              backgroundSize: `${mmToPx(50) * scale}px ${mmToPx(50) * scale}px`,
            }}
          />

          {/* Margin indicator */}
          <div
            className="absolute border-2 border-dashed border-blue-300 pointer-events-none"
            style={{
              left: `${mmToPx(10) * scale}px`,
              top: `${mmToPx(10) * scale}px`,
              right: `${mmToPx(10) * scale}px`,
              bottom: `${mmToPx(10) * scale}px`,
            }}
          />

          {/* Sticker items */}
          {items.map((item) => (
            <StickerElement
              key={item.id}
              item={item}
              tagSlug={getTagSlug(item.tagId)}
              isSelected={selectedId === item.id}
              onSelect={() => onSelect(item.id)}
              onUpdate={(updates) => onUpdateItem(item.id, updates)}
              scale={scale}
              onMouseDown={handleMouseDown}
            />
          ))}

          {/* Paper label */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 font-medium">
            {paperSize.toUpperCase()} {orientation}
          </div>
        </div>
      </div>
    </div>
  );
}
