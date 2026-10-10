import { useState, useEffect, useCallback, useMemo } from 'react';
import { Leaf, ChevronLeft, ChevronRight, History, Filter, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
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
const CATEGORIES = ['All', 'Plastic', 'Paper', 'Metal', 'Glass', 'Food/Organic', 'E-Waste'];

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [totalCarbon, setTotalCarbon] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const loadPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const data = await getScanHistory(p, PAGE_SIZE);
      setScans(data);
      setHasMore(data.length === PAGE_SIZE);
      setTotalCarbon(data.reduce((s, r) => s + (r.carbon_kg || 0), 0));
    } catch {
      setScans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(page);
  }, [page, loadPage]);

  const filteredScans = useMemo(() => {
    if (selectedCategory === 'All') return scans;
    return scans.filter(s => s.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [scans, selectedCategory]);

  const handleExportJson = () => {
    if (scans.length === 0) {
      toast.error('No scan history to export');
      return;
    }
    const blob = new Blob([JSON.stringify(scans, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecosort-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast.success('Scan history downloaded');
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your local scan history?')) {
      localStorage.removeItem('ecosort_local_scans');
      setScans([]);
      setTotalCarbon(0);
      toast.success('Scan history cleared');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-eco-green-100 dark:bg-eco-green-900/30 flex items-center justify-center text-eco-green-600 dark:text-eco-green-400">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Scan History</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 pl-11">
            Browse and manage your past AI waste classifications and impact records
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!loading && scans.length > 0 && (
            <>
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                title="Export history as JSON"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              <button
                onClick={handleClearHistory}
                className="p-1.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                title="Clear history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          {!loading && scans.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-eco-green-50 dark:bg-eco-green-900/30 border border-eco-green-200 dark:border-eco-green-800 flex-shrink-0 shadow-sm">
              <Leaf className="w-4 h-4 text-eco-green-600 dark:text-eco-green-400" />
              <span className="text-xs font-bold text-eco-green-700 dark:text-eco-green-300">
                {totalCarbon.toFixed(1)} kg CO₂e saved
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0 mr-1" />
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-eco-green-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 p-8">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <History className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <p className="font-bold text-gray-700 dark:text-gray-200 text-lg">
              {scans.length === 0 ? 'No scans recorded yet' : `No ${selectedCategory} scans found`}
            </p>
            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1 max-w-sm">
              Use the AI scanner to classify waste items and see them logged here with verifiable carbon reduction metrics.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredScans.map(scan => (
            <ScanHistoryCard key={scan.id} scan={scan} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && scans.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
            Page {page}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
