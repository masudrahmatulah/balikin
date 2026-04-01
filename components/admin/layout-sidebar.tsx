'use client';

import { useState } from 'react';
import { Trash2, Plus, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { StickerItem, PaperSize, Orientation } from '@/lib/layout-editor';
import type { StickerShape, StickerSize } from '@/lib/sticker-template';

interface LayoutSidebarProps {
  paperSize: PaperSize;
  orientation: Orientation;
  selectedShape: StickerShape;
  selectedSize: StickerSize;
  selectedItem: StickerItem | null;
  availableTags: Array<{ id: string; slug: string; name: string }>;
  onPaperSizeChange: (size: PaperSize) => void;
  onOrientationChange: (orientation: Orientation) => void;
  onShapeChange: (shape: StickerShape) => void;
  onSizeChange: (size: StickerSize) => void;
  onAddItem: (tagId: string, x: number, y: number) => void;
  onUpdateItem: (id: string, updates: Partial<StickerItem>) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onSaveTemplate?: (name: string) => void;
  onGeneratePDF: () => void;
}

const PAPER_SIZES: { value: PaperSize; label: string; dimensions: string }[] = [
  { value: 'a3', label: 'A3', dimensions: '420 x 297 mm' },
  { value: 'a4', label: 'A4', dimensions: '297 x 210 mm' },
];

const ORIENTATIONS: { value: Orientation; label: string }[] = [
  { value: 'landscape', label: 'Landscape' },
  { value: 'portrait', label: 'Portrait' },
];

const SHAPES: { value: StickerShape; label: string }[] = [
  { value: 'circle', label: 'Bulat' },
  { value: 'square', label: 'Segi Empat' },
  { value: 'rectangle', label: 'Persegi Panjang' },
];

const SIZES: { value: StickerSize; label: string }[] = [
  { value: 'small', label: 'Kecil (30mm)' },
  { value: 'medium', label: 'Sedang (40mm)' },
  { value: 'large', label: 'Besar (50mm)' },
];

export function LayoutSidebar({
  paperSize,
  orientation,
  selectedShape,
  selectedSize,
  selectedItem,
  availableTags,
  onPaperSizeChange,
  onOrientationChange,
  onShapeChange,
  onSizeChange,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onClearAll,
  onSaveTemplate,
  onGeneratePDF,
}: LayoutSidebarProps) {
  const [templateName, setTemplateName] = useState('');

  const handleAddSticker = () => {
    // Add to center of canvas with some offset
    const centerOffset = 50;
    onAddItem(availableTags[0]?.id || '', centerOffset, centerOffset);
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      {/* Paper Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pengaturan Kertas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Paper Size */}
          <div>
            <Label className="mb-2 text-xs">Ukuran Kertas</Label>
            <div className="grid grid-cols-2 gap-2">
              {PAPER_SIZES.map((size) => (
                <Button
                  key={size.value}
                  type="button"
                  variant={paperSize === size.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPaperSizeChange(size.value)}
                  className="flex flex-col gap-1 h-auto py-2"
                >
                  <span className="font-medium">{size.label}</span>
                  <span className="text-xs opacity-70">{size.dimensions}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Orientation */}
          <div>
            <Label className="mb-2 text-xs">Orientasi</Label>
            <div className="grid grid-cols-2 gap-2">
              {ORIENTATIONS.map((ori) => (
                <Button
                  key={ori.value}
                  type="button"
                  variant={orientation === ori.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onOrientationChange(ori.value)}
                >
                  {ori.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sticker Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pengaturan Sticker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Shape */}
          <div>
            <Label className="mb-2 text-xs">Bentuk Sticker</Label>
            <div className="grid grid-cols-3 gap-2">
              {SHAPES.map((shape) => (
                <Button
                  key={shape.value}
                  type="button"
                  variant={selectedShape === shape.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onShapeChange(shape.value)}
                >
                  {shape.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <Label className="mb-2 text-xs">Ukuran Sticker</Label>
            <div className="grid grid-cols-3 gap-2">
              {SIZES.map((size) => (
                <Button
                  key={size.value}
                  type="button"
                  variant={selectedSize === size.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSizeChange(size.value)}
                >
                  {size.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Add Sticker Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleAddSticker}
            disabled={availableTags.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Sticker ke Canvas
          </Button>
        </CardContent>
      </Card>

      {/* Selected Item Properties */}
      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Item Terpilih</span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onDeleteItem(selectedItem.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Posisi X (mm)</Label>
                <Input
                  type="number"
                  value={Math.round(selectedItem.x)}
                  onChange={(e) => onUpdateItem(selectedItem.id, { x: Number(e.target.value) })}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Posisi Y (mm)</Label>
                <Input
                  type="number"
                  value={Math.round(selectedItem.y)}
                  onChange={(e) => onUpdateItem(selectedItem.id, { y: Number(e.target.value) })}
                  className="h-8"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Rotasi (derajat)</Label>
              <Input
                type="number"
                min="0"
                max="360"
                value={selectedItem.rotation}
                onChange={(e) => onUpdateItem(selectedItem.id, { rotation: Number(e.target.value) % 360 })}
                className="h-8"
              />
            </div>

            <div>
              <Label className="text-xs">Teks Custom</Label>
              <Input
                type="text"
                value={selectedItem.customText || ''}
                onChange={(e) => onUpdateItem(selectedItem.id, { customText: e.target.value })}
                placeholder="Opsional..."
                className="h-8"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Tag Tersedia ({availableTags.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {availableTags.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Tidak ada tag tersedia
              </p>
            ) : (
              availableTags.slice(0, 10).map((tag) => (
                <Button
                  key={tag.id}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => onAddItem(tag.id, 50, 50)}
                >
                  + {tag.name || tag.slug}
                </Button>
              ))
            )}
            {availableTags.length > 10 && (
              <p className="text-xs text-gray-500 text-center">
                ...dan {availableTags.length - 10} lainnya
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aksi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Generate PDF */}
          <Button
            type="button"
            className="w-full"
            onClick={onGeneratePDF}
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>

          {/* Save Template */}
          {onSaveTemplate && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Nama template..."
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="h-9"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (templateName.trim()) {
                      onSaveTemplate(templateName);
                      setTemplateName('');
                    }
                  }}
                  disabled={!templateName.trim()}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Clear All */}
          <Button
            type="button"
            variant="outline"
            className="w-full text-red-600 hover:text-red-700"
            onClick={onClearAll}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus Semua
          </Button>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-xs text-blue-800 dark:text-blue-300">
        <p className="font-medium mb-1">Tips:</p>
        <ul className="space-y-1 list-disc list-inside opacity-80">
          <li>Klik sticker untuk memilih</li>
          <li>Drag untuk memindahkan</li>
          <li>Gunakan handle rotasi untuk memutar</li>
          <li>Double-click canvas untuk tambah sticker</li>
        </ul>
      </div>
    </div>
  );
}
