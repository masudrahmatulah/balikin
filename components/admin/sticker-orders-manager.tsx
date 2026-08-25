'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { GenerateBundleButton } from '@/components/admin/generate-bundle-button';
import {
  bulkDeleteStickerOrders,
  bulkSetOrderStatus,
  bulkSetPaymentStatus,
  createStickerOrderByAdmin,
  deleteStickerOrderById,
  getStickerOrderForAdmin,
  updateStickerOrderStatus,
  updateStickerOrderByAdmin,
  verifyStickerOrder,
  type AdminCreateOrderInput,
  type AdminUpdateOrderInput,
} from '@/app/admin/sticker-orders/actions';

export interface StickerOrderRow {
  id: string;
  recipientName: string;
  phone: string;
  city: string;
  email: string;
  totalAmount: number;
  packQuantity: number;
  unitCountPerPack: number;
  paymentStatus: string;
  status: string;
  bundleCount: number;
  createdAtLabel: string;
}

const ORDER_STATUS_OPTIONS = [
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'in_production', label: 'In Production' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'completed', label: 'Completed' },
];

const PRODUCT_TYPE_OPTIONS = [
  { value: 'sticker', label: 'Stiker (Rp59.000/pack)', basePrice: 59000 },
  { value: 'acrylic', label: 'Armor Tag Acrylic (Rp54.000/pcs)', basePrice: 54000 },
  { value: 'bundle', label: 'Bundle (Rp89.000/pack)', basePrice: 89000 },
];

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`;
}

export function StickerOrdersManager({ orders }: { orders: StickerOrderRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StickerOrderRow | null>(null);
  const [deleteSingleId, setDeleteSingleId] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const allSelected = orders.length > 0 && orders.every((o) => selected.has(o.id));
  const selectedIds = Array.from(selected);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected(allSelected ? new Set() : new Set(orders.map((o) => o.id)));
  };

  const runAction = (fn: () => Promise<unknown>, opts?: { clearSelection?: boolean }) => {
    startTransition(async () => {
      try {
        await fn();
        if (opts?.clearSelection) setSelected(new Set());
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
      }
    });
  };

  // ─── Single-order handlers ─────────────────────────────────────────────
  const handleVerify = (orderId: string) => runAction(() => verifyStickerOrder(orderId));

  const handleStatus = (orderId: string, status: 'in_production' | 'shipped' | 'completed') =>
    runAction(() => updateStickerOrderStatus(orderId, status));

  // ─── Bulk handlers ──────────────────────────────────────────────────────
  const handleBulkVerify = () =>
    runAction(() => bulkSetPaymentStatus(selectedIds, 'paid'), { clearSelection: true });

  const handleBulkStatus = (status: string) =>
    runAction(() => bulkSetOrderStatus(selectedIds, status), { clearSelection: true });

  const confirmBulkDelete = () => {
    setBulkDeleteConfirm(false);
    runAction(() => bulkDeleteStickerOrders(selectedIds), { clearSelection: true });
  };

  const confirmSingleDelete = () => {
    const id = deleteSingleId;
    setDeleteSingleId(null);
    if (!id) return;
    runAction(() => deleteStickerOrderById(id));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={orders.length > 0 && allSelected}
            onCheckedChange={toggleSelectAll}
            aria-label="Pilih semua order"
          />
          <Label htmlFor="select-all" className="text-sm text-gray-600 dark:text-gray-300">
            Pilih semua ({orders.length})
          </Label>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Tambah Order Manual
        </Button>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="sticky top-16 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/60 p-3 shadow-md">
          <span className="mr-1 text-sm font-medium text-indigo-900 dark:text-indigo-200">
            {selected.size} order dipilih:
          </span>
          <Button size="sm" variant="outline" disabled={isPending} onClick={handleBulkVerify}>
            Tandai Bayar (Paid)
          </Button>
          {ORDER_STATUS_OPTIONS.filter((s) => s.value !== 'pending_payment').map((s) => (
            <Button key={s.value} size="sm" variant="outline" disabled={isPending} onClick={() => handleBulkStatus(s.value)}>
              Set {s.label}
            </Button>
          ))}
          <Button size="sm" variant="destructive" disabled={isPending} onClick={() => setBulkDeleteConfirm(true)}>
            <Trash2 className="mr-1 h-4 w-4" aria-hidden="true" />
            Hapus Terpilih
          </Button>
        </div>
      )}

      {/* Order list */}
      <div className="grid gap-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-gray-600">
              Belum ada order sticker.
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selected.has(order.id)}
                      onCheckedChange={() => toggleSelect(order.id)}
                      aria-label={`Pilih order ${order.recipientName}`}
                      className="mt-1.5"
                    />
                    <div>
                      <CardTitle className="text-lg">
                        Order {order.id.slice(0, 8)}…
                        <span className="ml-2 text-xs font-normal text-gray-500">{order.createdAtLabel}</span>
                      </CardTitle>
                      <CardDescription>
                        {order.recipientName} • {order.city} • {order.email}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{order.paymentStatus}</Badge>
                    <Badge variant="outline">{order.status}</Badge>
                    <Badge variant="outline">bundle {order.bundleCount}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    WhatsApp: <span className="font-medium text-gray-900">{order.phone}</span>
                  </div>
                  <div>
                    Total: <span className="font-medium text-gray-900">{formatRupiah(order.totalAmount)}</span>
                  </div>
                  <div>
                    Pack:{' '}
                    <span className="font-medium text-gray-900">
                      {order.packQuantity} x {order.unitCountPerPack}
                    </span>
                  </div>
                  <div>
                    Alamat: <span className="font-medium text-gray-900">{order.city}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {order.paymentStatus !== 'paid' && (
                    <Button size="sm" disabled={isPending} onClick={() => handleVerify(order.id)}>
                      Verifikasi Bayar
                    </Button>
                  )}

                  {order.paymentStatus === 'paid' && order.bundleCount === 0 && (
                    <GenerateBundleButton orderId={order.id} />
                  )}

                  {order.status === 'in_production' && (
                    <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleStatus(order.id, 'shipped')}>
                      Tandai Shipped
                    </Button>
                  )}

                  {order.status === 'shipped' && (
                    <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleStatus(order.id, 'completed')}>
                      Tandai Completed
                    </Button>
                  )}

                  <Button size="sm" variant="ghost" disabled={isPending} onClick={() => setEditTarget(order)}>
                    <Pencil className="mr-1 h-4 w-4" aria-hidden="true" />
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    disabled={isPending}
                    onClick={() => setDeleteSingleId(order.id)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" aria-hidden="true" />
                    Hapus
                  </Button>

                  <Link href={`/admin/sticker-orders/${order.id}`}>
                    <Button size="sm" variant="ghost">
                      Lihat Detail Bundle
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create dialog */}
      <CreateOrderDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Edit dialog */}
      {editTarget && <EditOrderDialog order={editTarget} onClose={() => setEditTarget(null)} />}

      {/* Delete single confirmation */}
      <Dialog open={deleteSingleId !== null} onOpenChange={(open) => !open && setDeleteSingleId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Order Ini?</DialogTitle>
            <DialogDescription>
              Order beserta bundle dan tag terkait akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSingleId(null)}>Batal</Button>
            <Button variant="destructive" disabled={isPending} onClick={confirmSingleDelete}>
              {isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete bulk confirmation */}
      <Dialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus {selectedIds.length} Order?</DialogTitle>
            <DialogDescription>
              Semua order terpilih beserta bundle dan tag terkait akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteConfirm(false)}>Batal</Button>
            <Button variant="destructive" disabled={isPending} onClick={confirmBulkDelete}>
              {isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Hapus Semua
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Shared form field types ─────────────────────────────────────────────

interface OrderFormState {
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode: string;
  notes: string;
  shippingCourier: string;
  shippingCost: number;
  totalAmount: number;
}

// ─── Create dialog ───────────────────────────────────────────────────────

function CreateOrderDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    userEmail: '',
    recipientName: '',
    phone: '',
    addressLine: '',
    city: '',
    postalCode: '',
    notes: '',
    productType: 'sticker',
    packQuantity: 1,
    unitCountPerPack: 12,
    shippingCost: 0,
  });

  const basePrice = PRODUCT_TYPE_OPTIONS.find((p) => p.value === form.productType)?.basePrice ?? 0;
  const estimatedTotal = basePrice * (Number(form.packQuantity) || 0) + (Number(form.shippingCost) || 0);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await createStickerOrderByAdmin({
        ...form,
        packQuantity: Number(form.packQuantity),
        unitCountPerPack: Number(form.unitCountPerPack),
        shippingCost: Number(form.shippingCost),
      });
      setForm((f) => ({
        ...f,
        userEmail: '', recipientName: '', phone: '', addressLine: '', city: '', postalCode: '', notes: '',
      }));
      setIsSubmitting(false);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat order');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Order Manual</DialogTitle>
          <DialogDescription>
            Buat order untuk user yang sudah terdaftar. Total dihitung otomatis dari tipe produk × jumlah pack + ongkir.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="co-email">Email User (pembeli)</Label>
            <Input id="co-email" type="email" required value={form.userEmail} onChange={set('userEmail')} placeholder="user@email.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="co-name">Nama Penerima</Label>
              <Input id="co-name" required value={form.recipientName} onChange={set('recipientName')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="co-phone">No. WhatsApp</Label>
              <Input id="co-phone" required value={form.phone} onChange={set('phone')} placeholder="08xxxxxxxxxx" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="co-address">Alamat Lengkap</Label>
            <Textarea id="co-address" required rows={2} value={form.addressLine} onChange={set('addressLine')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="co-city">Kota</Label>
              <Input id="co-city" required value={form.city} onChange={set('city')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="co-postal">Kode Pos</Label>
              <Input id="co-postal" required inputMode="numeric" value={form.postalCode} onChange={set('postalCode')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipe Produk</Label>
              <Select value={form.productType} onValueChange={(v) => setForm((f) => ({ ...f, productType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPE_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="co-qty">Jumlah Pack</Label>
              <Input id="co-qty" type="number" min={1} max={100} required value={form.packQuantity} onChange={set('packQuantity')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="co-unit">Isi per Pack</Label>
              <Input id="co-unit" type="number" min={1} max={1000} required value={form.unitCountPerPack} onChange={set('unitCountPerPack')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="co-shipping">Ongkir (Rp)</Label>
              <Input id="co-shipping" type="number" min={0} required value={form.shippingCost} onChange={set('shippingCost')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="co-notes">Catatan (opsional)</Label>
            <Textarea id="co-notes" rows={2} value={form.notes} onChange={set('notes')} />
          </div>

          <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm dark:bg-blue-950/40">
            Estimasi total: <span className="font-semibold">{formatRupiah(estimatedTotal)}</span>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Simpan Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit dialog ─────────────────────────────────────────────────────────

function EditOrderDialog({
  order,
  onClose,
}: {
  order: StickerOrderRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<OrderFormState | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStickerOrderForAdmin(order.id)
      .then((data) => {
        if (cancelled) return;
        setForm({
          recipientName: data.recipientName,
          phone: data.phone,
          addressLine: data.addressLine,
          city: data.city,
          postalCode: data.postalCode,
          notes: data.notes ?? '',
          shippingCourier: data.shippingCourier ?? '',
          shippingCost: data.shippingCost,
          totalAmount: data.totalAmount,
        });
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat data order');
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [order.id]);

  const set = (key: keyof OrderFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => (f ? { ...f, [key]: e.target.value } : f));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await updateStickerOrderByAdmin({
        id: order.id,
        ...form,
        shippingCost: Number(form.shippingCost),
        totalAmount: Number(form.totalAmount),
      });
      setIsSubmitting(false);
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan perubahan');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        {isLoading ? (
          <>
            <DialogHeader>
              <DialogTitle>Memuat Data Order…</DialogTitle>
              <DialogDescription>Mengambil detail order untuk diedit.</DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" aria-hidden="true" />
            </div>
          </>
        ) : error && !form ? (
          <>
            <DialogHeader>
              <DialogTitle>Gagal Memuat</DialogTitle>
              <DialogDescription>{error}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Tutup</Button>
            </DialogFooter>
          </>
        ) : form ? (
          <>
            <DialogHeader>
              <DialogTitle>Edit Order</DialogTitle>
              <DialogDescription>Order {order.id.slice(0, 8)}… • {order.email}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ed-name">Nama Penerima</Label>
                  <Input id="ed-name" required value={form.recipientName} onChange={set('recipientName')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ed-phone">No. WhatsApp</Label>
                  <Input id="ed-phone" required value={form.phone} onChange={set('phone')} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ed-address">Alamat Lengkap</Label>
                <Textarea id="ed-address" required rows={2} value={form.addressLine} onChange={set('addressLine')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ed-city">Kota</Label>
                  <Input id="ed-city" required value={form.city} onChange={set('city')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ed-postal">Kode Pos</Label>
                  <Input id="ed-postal" required value={form.postalCode} onChange={set('postalCode')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ed-courier">Kurir</Label>
                  <Input id="ed-courier" value={form.shippingCourier} onChange={set('shippingCourier')} placeholder="jne / tiki / pos" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ed-shipping">Ongkir (Rp)</Label>
                  <Input id="ed-shipping" type="number" min={0} required value={form.shippingCost} onChange={set('shippingCost')} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ed-total">Total Harga (Rp)</Label>
                <Input id="ed-total" type="number" min={0} required value={form.totalAmount} onChange={set('totalAmount')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ed-notes">Catatan</Label>
                <Textarea id="ed-notes" rows={2} value={form.notes} onChange={set('notes')} />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
