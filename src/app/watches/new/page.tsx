'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { api } from '@/lib/api';

export default function NewWatchPage() {
  const router = useRouter();
  const [targetUrl, setTargetUrl] = useState('');
  const [name, setName] = useState('');
  const [interval, setInterval] = useState('86400');
  const [selector, setSelector] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    }
    checkAuth();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Basic URL validation
      new URL(targetUrl);
    } catch {
      setError('Please enter a valid URL');
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/watches', {
        target_url: targetUrl,
        name: name || undefined,
        check_interval_seconds: parseInt(interval, 10),
        selector: selector || undefined,
      });

      router.push('/dashboard');
    } catch (err: any) {
      if (err.message.includes('403') || err.message.includes('upgrade')) {
        setError('Upgrade required for faster check intervals');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            &larr; Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-6">Add New Watch</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL to Monitor *
            </label>
            <input
              id="targetUrl"
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com/page"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name (optional)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My important page"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-1">
              Check Interval
            </label>
            <select
              id="interval"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="900">Every 15 minutes</option>
              <option value="3600">Every 1 hour</option>
              <option value="86400">Every 1 day</option>
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {showAdvanced ? 'â¼ Hide Advanced' : 'â¶ Show Advanced'}
            </button>
            
            {showAdvanced && (
              <div className="mt-3">
                <label htmlFor="selector" className="block text-sm font-medium text-gray-700 mb-1">
                  CSS Selector (optional)
                </label>
                <input
                  id="selector"
                  type="text"
                  value={selector}
                  onChange={(e) => setSelector(e.target.value)}
                  placeholder="#main-content, .price, article"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Only watch a specific part of the page
                </p>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Watch'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
