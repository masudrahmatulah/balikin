'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, CheckCircle2, Shield, Clock, Filter } from 'lucide-react';

interface ScanLog {
  id: string;
  tagName: string;
  action: string;
  location: string;
  time: string;
  status: 'success' | 'warning' | 'info';
}

async function getScanHistory(): Promise<ScanLog[]> {
  try {
    const response = await fetch('/api/mobile/recent-activity');
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export default function HistoryPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<ScanLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scan' | 'lost'>('all');

  useEffect(() => {
    // Check authentication via API
    fetch('/api/auth/session')
      .then(res => {
        if (!res.ok) {
          router.push('/sign-in');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && !data.user) {
          router.push('/sign-in');
        }
      });

    getScanHistory().then(data => {
      setActivities(data);
      setIsLoading(false);
    });
  }, [router]);

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'scan') return activity.action === 'Di-scan';
    if (filter === 'lost') return activity.action === 'Mode Hilang';
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Scan</h1>
          <p className="text-gray-600">Lacak semua aktivitas tag Anda</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter('scan')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'scan'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Scan
          </button>
          <button
            onClick={() => setFilter('lost')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'lost'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Mode Hilang
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-1" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada riwayat aktivitas</p>
              <p className="text-sm text-gray-400 mt-1">
                {filter === 'all' ? 'Scan tag Anda untuk melihat riwayat di sini' : `Tidak ada aktivitas ${filter === 'scan' ? 'scan' : 'mode hilang'}`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      activity.status === 'success'
                        ? 'bg-green-100 text-green-600'
                        : activity.status === 'warning'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : activity.status === 'warning' ? (
                        <Shield className="h-6 w-6" />
                      ) : (
                        <MapPin className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{activity.tagName}</h4>
                        <span className="text-xs text-gray-400">{activity.time}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {activity.action} • {activity.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
