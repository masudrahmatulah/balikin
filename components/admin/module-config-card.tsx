'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getModuleDisplayName, getModuleColor, type ModuleType } from '@/lib/admin-modules';
import { toggleModuleStatus } from '@/app/actions/module-config-actions';
import { CheckCircle2, XCircle, Edit, Power, PowerOff } from 'lucide-react';

interface ModuleConfigCardProps {
  moduleType: ModuleType;
  isEnabled: boolean;
  price: number;
  isPaid: boolean;
  requiresApproval: boolean;
  description: string;
  features: string[];
}

export function ModuleConfigCard({
  moduleType,
  isEnabled,
  price,
  isPaid,
  requiresApproval,
  description,
  features,
}: ModuleConfigCardProps) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    isEnabled,
    price,
    isPaid,
    requiresApproval,
    description,
    features: features.join(', '),
  });

  const moduleColor = getModuleColor(moduleType);
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);

  const handleToggle = async (checked: boolean) => {
    setIsToggling(true);
    try {
      await toggleModuleStatus(moduleType, checked);
      router.refresh();
    } catch (error) {
      console.error('Failed to toggle module:', error);
      alert('Gagal mengubah status modul');
    } finally {
      setIsToggling(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`/api/admin/modules/${moduleType}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          features: editForm.features.split(',').map(f => f.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        setEditModalOpen(false);
        router.refresh();
      } else {
        alert('Gagal menyimpan konfigurasi');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('Gagal menyimpan konfigurasi');
    }
  };

  return (
    <>
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 transition-all ${
        isEnabled
          ? 'border-gray-200 dark:border-gray-700'
          : 'border-red-200 dark:border-red-900 opacity-75'
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${moduleColor.replace('bg-', 'bg-opacity-10 ')} rounded-xl flex items-center justify-center`}>
                <div className={`w-8 h-8 ${moduleColor} rounded-lg flex items-center justify-center`}>
                  {isEnabled ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <XCircle className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getModuleDisplayName(moduleType)}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {isEnabled ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      AKTIF
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      NONAKTIF
                    </Badge>
                  )}
                  {isPaid ? (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      BERBAYAR
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                      GRATIS
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggle}
                disabled={isToggling}
                className="data-[state=checked]:bg-green-600"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditModalOpen(true)}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {description || 'Tidak ada deskripsi'}
          </p>

          {/* Price */}
          <div className="mb-4">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {isPaid ? formattedPrice : 'GRATIS'}
            </span>
            {isPaid && requiresApproval && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                (Butuh verifikasi admin)
              </span>
            )}
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div className="space-y-1">
              {features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
              {features.length > 3 && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  +{features.length - 3} fitur lainnya
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Konfigurasi Modul</DialogTitle>
            <DialogDescription>
              Ubah pengaturan untuk {getModuleDisplayName(moduleType)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-isEnabled">Status Aktif</Label>
              <Switch
                id="edit-isEnabled"
                checked={editForm.isEnabled}
                onCheckedChange={(checked) =>
                  setEditForm({ ...editForm, isEnabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Harga (Rupiah)</Label>
              <Input
                id="edit-price"
                type="number"
                value={editForm.price}
                onChange={(e) =>
                  setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="edit-isPaid">Modul Berbayar</Label>
              <Switch
                id="edit-isPaid"
                checked={editForm.isPaid}
                onCheckedChange={(checked) =>
                  setEditForm({ ...editForm, isPaid: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="edit-requiresApproval">Butuh Verifikasi Admin</Label>
              <Switch
                id="edit-requiresApproval"
                checked={editForm.requiresApproval}
                onCheckedChange={(checked) =>
                  setEditForm({ ...editForm, requiresApproval: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-features">Fitur (pisahkan dengan koma)</Label>
              <Textarea
                id="edit-features"
                value={editForm.features}
                onChange={(e) =>
                  setEditForm({ ...editForm, features: e.target.value })
                }
                rows={3}
                placeholder="Fitur 1, Fitur 2, Fitur 3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveEdit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
