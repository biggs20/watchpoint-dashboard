'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { api } from '@/lib/api';
import { formatInterval, formatRelativeTime, truncateUrl } from '@/lib/utils';
import type { User, Watch, Change } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [watches, setWatches] = useState<Watch[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const [userData, watchesData, changesData] = await Promise.all([
          api.get<User>('/api/me'),
          api.get<Watch[]>('/api/watches'),
          api.get<Change[]>('/api/changes/recent'),
        ]);

        setUser(userData);
        setWatches(watchesData);
        setChanges(changesData);
      } catch (err: any) {
        if (err.message === 'AUTH_REQUIRED') {
          router.push('/login');
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  async function handlePauseResume(watch: Watch) {
    try {
      const endpoint = watch.is_active 
        ? `/api/watches/${watch.id}/pause`
        : `/api/watches/${watch.id}/resume`;
      
      await api.post(endpoint);
      setWatches(watches.map(w => 
        w.id === watch.id ? { ...w, is_active: !w.is_active } : w
      ));
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(watchId: string) {
    if (!confirm('Delete this watch?')) return;
    
    try {
      await api.del(`/api/watches/${watchId}`);
      setWatches(watches.filter(w => w.id !== watchId));
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">WatchPoint</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Watches Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Watches</h2>
            <Link
              href="/watches/new"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              + Add Watch
            </Link>
          </div>

          {watches.length === 0 ? (
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">No watches yet. Add one to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {watches.map((watch) => (
                <div
                  key={watch.id}
                  className="border border-gray-200 shadow-sm rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {watch.name || new URL(watch.target_url).hostname}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {truncateUrl(watch.target_url, 40)}
                      </p>
                    </div>
                    <span
                      className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                        watch.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {watch.is_active ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1 mb-3">
                    <p>Interval: {formatInterval(watch.check_interval_seconds)}</p>
                    {watch.last_checked_at && (
                      <p>Last check: {formatRelativeTime(watch.last_checked_at)}</p>
                    )}
                    {watch.next_check_at && watch.is_active && (
                      <p>Next check: {formatRelativeTime(watch.next_check_at)}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handlePauseResume(watch)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {watch.is_active ? 'Pause' : 'Resume'}
                    </button>
                    <span className="text-gray-300">|</span>
                    <Link
                      href={`/watches/${watch.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleDelete(watch.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Changes Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Recent Changes</h2>
          
          {changes.length === 0 ? (
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">No changes detected yet.</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
              {changes.map((change) => (
                <div key={change.id} className="p-4">
                  <p className="text-sm text-gray-900">{change.change_summary}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span>{change.watch?.name || change.watch?.target_url}</span>
                    <span>â¢</span>
                    <span>{formatRelativeTime(change.detected_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
