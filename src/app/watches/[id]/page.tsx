'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { api } from '@/lib/api';
import { formatInterval, formatRelativeTime, truncateUrl } from '@/lib/utils';
import type { WatchWithChanges, Change } from '@/lib/types';

export default function WatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const watchId = params.id as string;
  
  const [watch, setWatch] = useState<WatchWithChanges | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackSaving, setFeedbackSaving] = useState<string | null>(null);
  const [savedFeedback, setSavedFeedback] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadWatch() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const data = await api.get<WatchWithChanges>(`/api/watches/${watchId}`);
        setWatch(data);
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

    loadWatch();
  }, [router, watchId]);

  async function handleFeedback(changeId: string, feedback: 'noise' | 'useful' | 'critical') {
    setFeedbackSaving(changeId);
    
    try {
      await api.post(`/api/feedback/${changeId}`, { feedback });
      setSavedFeedback(prev => new Set(prev).add(changeId));
      
      // Update local state
      if (watch) {
        setWatch({
          ...watch,
          changes: watch.changes.map(c =>
            c.id === changeId ? { ...c, user_feedback: feedback } : c
          ),
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFeedbackSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!watch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Watch not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            &larr; Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Watch Info */}
        <div className="border border-gray-200 shadow-sm rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold">
                {watch.name || new URL(watch.target_url).hostname}
              </h1>
              <a
                href={watch.target_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {truncateUrl(watch.target_url, 60)}
              </a>
            </div>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                watch.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {watch.is_active ? 'Active' : 'Paused'}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-medium text-gray-700">Check Interval</p>
              <p>{formatInterval(watch.check_interval_seconds)}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Last Checked</p>
              <p>{watch.last_checked_at ? formatRelativeTime(watch.last_checked_at) : 'Never'}</p>
            </div>
            {watch.selector && (
              <div className="col-span-2">
                <p className="font-medium text-gray-700">Selector</p>
                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{watch.selector}</code>
              </div>
            )}
          </div>
        </div>

        {/* Changes */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Change History</h2>

          {watch.changes.length === 0 ? (
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">No changes detected yet.</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
              {watch.changes.map((change) => (
                <div key={change.id} className="p-4">
                  <p className="text-sm text-gray-900">{change.change_summary}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatRelativeTime(change.detected_at)}
                  </p>

                  {/* Feedback buttons */}
                  <div className="mt-3 flex items-center gap-2">
                    {savedFeedback.has(change.id) || change.user_feedback ? (
                      <span className="text-xs text-green-600">
                        Feedback saved: {change.user_feedback}
                      </span>
                    ) : (
                      <>
                        <span className="text-xs text-gray-500">Was this useful?</span>
                        <button
                          onClick={() => handleFeedback(change.id, 'noise')}
                          disabled={feedbackSaving === change.id}
                          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                          Noise
                        </button>
                        <button
                          onClick={() => handleFeedback(change.id, 'useful')}
                          disabled={feedbackSaving === change.id}
                          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                          Useful
                        </button>
                        <button
                          onClick={() => handleFeedback(change.id, 'critical')}
                          disabled={feedbackSaving === change.id}
                          className="px-2 py-1 text-xs border border-blue-600 text-blue-600 rounded hover:bg-blue-50 disabled:opacity-50"
                        >
                          Critical
                        </button>
                      </>
                    )}
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
