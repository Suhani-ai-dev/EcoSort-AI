import { useState, useEffect, useCallback } from 'react';
import { Leaf, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { getScanHistory, type ScanRecord } from '../api/scansApi';
import { ScanHistoryCard } from '../components/history/ScanHistoryCard';

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex gap-4 animate-pulse">
      <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-3 w-40 bg-gray-100 dark:bg-gray-600 rounded-full" />
        <div className="h-3 w-32 bg-gray-100 dark:bg-gray-600 rounded-full" />
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [totalCarbon, setTotalCarbon] = useState(0);

  const loadPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const data = await getScanHistory(p, PAGE_SIZE);
      setScans(data);
      setHasMore(data.length === PAGE_SIZE);
      setTotalCarbon(data.reduce((s, r) => s + r.carbon_kg, 0));
    } catch {
      setScans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPage(page); }, [page, loadPage]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-eco-green-100 dark:bg-eco-green-900/30 flex items-center justify-center">
              <History className="w-4 h-4 text-eco-green-600 dark:text-eco-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scan History</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 pl-10">Your past waste scans and carbon savings</p>
        </div>
        {!loading && scans.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-eco-green-50 dark:bg-eco-green-900/20 border border-eco-green-200 dark:border-eco-green-800 flex-shrink-0">
            <Leaf className="w-4 h-4 text-eco-green-600 dark:text-eco-green-400" />
            <span className="text-xs font-semibold text-eco-green-700 dark:text-eco-green-400">
              {totalCarbon.toFixed(1)} kg CO₂e saved
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : scans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <History className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-600 dark:text-gray-300">No scans yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start scanning waste items to see your history here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {scans.map(scan => <ScanHistoryCard key={scan.id} scan={scan} />)}
        </div>
      )}

      {/* Pagination */}
      {!loading && (scans.length > 0 || page > 1) && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
