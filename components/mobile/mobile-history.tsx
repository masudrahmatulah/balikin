'use client';

import { useEffect, useState } from 'react';
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

export function MobileHistory() {
  const [activities, setActivities] = useState<ScanLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scan' | 'lost'>('all');

  useEffect(() => {
    getScanHistory().then(data => {
      setActivities(data);
      setIsLoading(false);
    });
  }, []);

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'scan') return activity.action === 'Di-scan';
    if (filter === 'lost') return activity.action === 'Mode Hilang';
    return true;
  });

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Riwayat Scan</h1>
          <p className="text-sm text-gray-500 mt-1">Lacak semua aktivitas tag Anda</p>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pb-3 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-mobile-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter('scan')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'scan'
                ? 'bg-mobile-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Scan
          </button>
          <button
            onClick={() => setFilter('lost')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'lost'
                ? 'bg-mobile-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Hilang
          </button>
        </div>
      </header>

      <main className="px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-1" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada riwayat aktivitas</p>
            <p className="text-sm text-gray-400 mt-1">
              {filter === 'all' ? 'Scan tag Anda untuk melihat riwayat di sini' : `Tidak ada aktivitas ${filter === 'scan' ? 'scan' : 'mode hilang'}`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-white/20"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    activity.status === 'success'
                      ? 'bg-mobile-success-lighter text-mobile-success'
                      : activity.status === 'warning'
                      ? 'bg-mobile-danger-lighter text-mobile-danger'
                      : 'bg-mobile-primary-lighter text-mobile-primary'
                  }`}>
                    {activity.status === 'success' ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : activity.status === 'warning' ? (
                      <Shield className="h-6 w-6" />
                    ) : (
                      <MapPin className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">{activity.tagName}</h4>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{activity.time}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {activity.action} • {activity.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom padding for navigation */}
        <div className="h-8" />
      </main>
    </div>
  );
}
