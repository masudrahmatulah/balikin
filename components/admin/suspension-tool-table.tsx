'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Suspension {
  id: string;
  userId: string | null;
  suspensionType: string;
  identifier: string;
  reason: string;
  suspendedAt: Date;
  liftedAt: Date | null;
  isActive: boolean;
  user?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  suspendedByUser?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  liftedByUser?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface SuspensionStats {
  active: number;
  lifted: number;
}

interface SuspensionToolTableProps {
  suspensions: Suspension[];
  stats?: SuspensionStats;
  adminId: string;
}

export function SuspensionToolTable({ suspensions, stats = { active: 0, lifted: 0 }, adminId }: SuspensionToolTableProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);
  const [suspendDialog, setSuspendDialog] = useState(false);
  const [liftDialog, setLiftDialog] = useState(false);
  const [selectedSuspension, setSelectedSuspension] = useState<Suspension | null>(null);
  const [newSuspension, setNewSuspension] = useState({
    suspensionType: 'user_id' as 'user_id' | 'device_id',
    identifier: '',
    reason: '',
  });
  const [liftReason, setLiftReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const activeSuspensions = suspensions.filter((s) => s.isActive);
  const liftedSuspensions = suspensions.filter((s) => !s.isActive);

  const handleSuspend = async () => {
    if (!newSuspension.identifier || !newSuspension.reason) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setUpdating('suspend');

    try {
      const response = await fetch('/admin/api/suspensions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSuspension,
          adminId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create suspension');
      }

      setSuspendDialog(false);
      setNewSuspension({ suspensionType: 'user_id', identifier: '', reason: '' });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create suspension');
    } finally {
      setUpdating(null);
    }
  };

  const openLiftDialog = (suspension: Suspension) => {
    setSelectedSuspension(suspension);
    setLiftReason('');
    setLiftDialog(true);
  };

  const handleLift = async () => {
    if (!selectedSuspension) return;

    setError(null);
    setUpdating(selectedSuspension.id);

    try {
      const response = await fetch(`/admin/api/suspensions/${selectedSuspension.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, liftReason }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to lift suspension');
      }

      setLiftDialog(false);
      setSelectedSuspension(null);
      setLiftReason('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lift suspension');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-3 rounded-lg"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">Active Suspensions</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.active}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400">Lifted Suspensions</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.lifted}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Dialog open={suspendDialog} onOpenChange={setSuspendDialog}>
          <DialogTrigger asChild>
            <Button variant="destructive">Suspend User/Device</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend User or Device</DialogTitle>
              <DialogDescription>
                Create a new suspension for a user ID or device ID
              </DialogDescription>
            </DialogHeader>
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-2 rounded-lg text-sm"
              >
                {error}
              </div>
            )}
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="suspensionType">Suspension Type</Label>
                <Select
                  value={newSuspension.suspensionType}
                  onValueChange={(value: 'user_id' | 'device_id') =>
                    setNewSuspension({ ...newSuspension, suspensionType: value })
                  }
                >
                  <SelectTrigger id="suspensionType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user_id">User ID</SelectItem>
                    <SelectItem value="device_id">Device ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="identifier">
                  {newSuspension.suspensionType === 'user_id' ? 'User ID' : 'Device ID'}
                </Label>
                <Input
                  id="identifier"
                  placeholder={newSuspension.suspensionType === 'user_id' ? 'Enter user ID' : 'Enter device ID'}
                  value={newSuspension.identifier}
                  onChange={(e) =>
                    setNewSuspension({ ...newSuspension, identifier: e.target.value })
                  }
                  maxLength={255}
                  aria-invalid={error !== null && newSuspension.identifier === ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for suspension..."
                  value={newSuspension.reason}
                  onChange={(e) => setNewSuspension({ ...newSuspension, reason: e.target.value })}
                  rows={3}
                  maxLength={500}
                  aria-invalid={error !== null && newSuspension.reason === ''}
                />
              </div>
              <Button
                onClick={handleSuspend}
                disabled={updating === 'suspend'}
                variant="destructive"
                className="w-full"
              >
                {updating === 'suspend' ? 'Creating...' : 'Create Suspension'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Suspensions</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Identifier</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Suspended By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSuspensions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No active suspensions
                    </TableCell>
                  </TableRow>
                ) : (
                  activeSuspensions.map((suspension) => (
                    <TableRow key={suspension.id}>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          {suspension.suspensionType === 'user_id' ? 'User ID' : 'Device ID'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{suspension.identifier}</TableCell>
                      <TableCell>
                        {suspension.user ? (
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {suspension.user.name || suspension.user.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={suspension.reason}>{suspension.reason}</TableCell>
                      <TableCell>
                        {suspension.suspendedByUser ? (
                          <p className="text-sm">
                            {suspension.suspendedByUser.name || suspension.suspendedByUser.email}
                          </p>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(suspension.suspendedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openLiftDialog(suspension)}
                          disabled={updating === suspension.id}
                          aria-label={`Lift suspension for ${suspension.suspensionType === 'user_id' ? 'user' : 'device'} ${suspension.identifier}`}
                        >
                          Lift
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Lifted Suspensions</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Identifier</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Suspended</TableHead>
                  <TableHead>Lifted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liftedSuspensions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No lifted suspensions
                    </TableCell>
                  </TableRow>
                ) : (
                  liftedSuspensions.map((suspension) => (
                    <TableRow key={suspension.id}>
                      <TableCell>
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                          {suspension.suspensionType === 'user_id' ? 'User ID' : 'Device ID'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{suspension.identifier}</TableCell>
                      <TableCell className="max-w-xs truncate" title={suspension.reason}>{suspension.reason}</TableCell>
                      <TableCell>
                        {new Date(suspension.suspendedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        {suspension.liftedAt ? (
                          <div>
                            {new Date(suspension.liftedAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                            {suspension.liftedByUser && (
                              <p className="text-xs text-gray-500">
                                by {suspension.liftedByUser.name || suspension.liftedByUser.email}
                              </p>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={liftDialog} onOpenChange={setLiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lift Suspension</DialogTitle>
            <DialogDescription>
              {selectedSuspension && (
                <>
                  Are you sure you want to lift the suspension for{' '}
                  {selectedSuspension.suspensionType === 'user_id' ? 'user' : 'device'}{' '}
                  <strong>{selectedSuspension.identifier}</strong>?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-2 rounded-lg text-sm"
            >
              {error}
            </div>
          )}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="liftReason">Reason for lifting (optional)</Label>
              <Textarea
                id="liftReason"
                placeholder="Enter reason for lifting suspension..."
                value={liftReason}
                onChange={(e) => setLiftReason(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setLiftDialog(false)}
                disabled={updating !== null}
              >
                Cancel
              </Button>
              <Button
                onClick={handleLift}
                disabled={updating !== null}
                variant="destructive"
              >
                {updating ? 'Lifting...' : 'Lift Suspension'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}