'use client';

import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { LayoutCanvas } from '@/components/admin/layout-canvas';
import { LayoutSidebar } from '@/components/admin/layout-sidebar';
import { Alert } from '@/components/ui/alert';
import type { StickerItem, PaperSize, Orientation } from '@/lib/layout-editor';
import type { StickerShape, StickerSize } from '@/lib/sticker-template';
import type { Tag } from '@/db/schema';

interface LayoutEditorClientProps {
  availableTags: Tag[];
}

export function LayoutEditorClient({ availableTags }: LayoutEditorClientProps) {
  const [paperSize, setPaperSize] = useState<PaperSize>('a3');
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [selectedShape, setSelectedShape] = useState<StickerShape>('circle');
  const [selectedSize, setSelectedSize] = useState<StickerSize>('medium');
  const [items, setItems] = useState<StickerItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get selected item
  const selectedItem = items.find((item) => item.id === selectedId) || null;

  // Get tag slug by tag ID
  const getTagSlug = useCallback((tagId: string) => {
    const tag = availableTags.find((t) => t.id === tagId);
    return tag?.slug || '';
  }, [availableTags]);

  // Add new item
  const handleAddItem = useCallback((tagId: string, x: number, y: number) => {
    // Find an unused tag or reuse the first one
    const usedTagIds = items.map((i) => i.tagId);
    const unusedTag = availableTags.find((t) => !usedTagIds.includes(t.id));
    const tagToAdd = unusedTag || availableTags[0];

    if (!tagToAdd) return;

    const newItem: StickerItem = {
      id: nanoid(),
      tagId: tagToAdd.id,
      x,
      y,
      rotation: 0,
      shape: selectedShape,
      size: selectedSize,
    };

    setItems((prev) => [...prev, newItem]);
    setSelectedId(newItem.id);
  }, [items, availableTags, selectedShape, selectedSize]);

  // Update item
  const handleUpdateItem = useCallback((id: string, updates: Partial<StickerItem>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  // Delete item
  const handleDeleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  }, [selectedId]);

  // Clear all items
  const handleClearAll = useCallback(() => {
    setItems([]);
    setSelectedId(null);
  }, []);

  // Save template
  const handleSaveTemplate = useCallback((name: string) => {
    const template = {
      id: nanoid(),
      name,
      paperSize,
      orientation,
      items,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage for now
    const templates = JSON.parse(localStorage.getItem('layout-templates') || '[]');
    templates.push(template);
    localStorage.setItem('layout-templates', JSON.stringify(templates));

    alert(`Template "${name}" berhasil disimpan!`);
  }, [paperSize, orientation, items]);

  // Generate PDF
  const handleGeneratePDF = useCallback(async () => {
    if (items.length === 0) {
      setError('Tambahkan minimal satu sticker ke canvas');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/admin/api/layout-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperSize,
          orientation,
          items: items.map((item) => ({
            ...item,
            tagSlug: getTagSlug(item.tagId),
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal generate PDF');
      }

      const { pdfUrl } = await response.json();

      // Download PDF
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `balikin-layout-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Gagal generate PDF';
      setError(errMsg);
      console.error('Error generating PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [paperSize, orientation, items, getTagSlug]);

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Canvas Area */}
        <div className="flex-1">
          <LayoutCanvas
            items={items}
            paperSize={paperSize}
            orientation={orientation}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdateItem={handleUpdateItem}
            onAddItem={(x, y) => handleAddItem('', x, y)}
            getTagSlug={getTagSlug}
          />
        </div>

        {/* Sidebar */}
        <LayoutSidebar
          paperSize={paperSize}
          orientation={orientation}
          selectedShape={selectedShape}
          selectedSize={selectedSize}
          selectedItem={selectedItem}
          availableTags={availableTags}
          onPaperSizeChange={setPaperSize}
          onOrientationChange={setOrientation}
          onShapeChange={setSelectedShape}
          onSizeChange={setSelectedSize}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onClearAll={handleClearAll}
          onSaveTemplate={handleSaveTemplate}
          onGeneratePDF={handleGeneratePDF}
        />
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-slate-600 dark:text-slate-400">Jumlah Sticker:</span>{' '}
            <span className="font-medium text-slate-900 dark:text-white">{items.length}</span>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400">Ukuran Kertas:</span>{' '}
            <span className="font-medium text-slate-900 dark:text-white">
              {paperSize.toUpperCase()} {orientation}
            </span>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400">Bentuk Sticker:</span>{' '}
            <span className="font-medium text-slate-900 dark:text-white">{selectedShape}</span>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400">Ukuran Sticker:</span>{' '}
            <span className="font-medium text-slate-900 dark:text-white">{selectedSize}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
