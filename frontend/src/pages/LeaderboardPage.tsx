import { useState, useEffect, useRef } from 'react';
import { Trophy, RefreshCw } from 'lucide-react';
import { getLeaderboard, type LeaderboardEntry } from '../api/leaderboardApi';
import { LeaderboardRow } from '../components/leaderboard/LeaderboardRow';
import { useAuth } from '../contexts/AuthContext';

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="w-8 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded-full" />
    </div>
  );
}

const REFRESH_INTERVAL = 30_000;

const PODIUM_MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const load = async () => {
    try {
      const data = await getLeaderboard(50);
      setEntries(data);
      setLastRefresh(new Date());
    } catch {
      // keep existing data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, []);

  const timeAgo = Math.floor((Date.now() - lastRefresh.getTime()) / 1000);
  const refreshLabel = timeAgo < 5 ? 'Just updated' : `Updated ${timeAgo}s ago`;
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 pl-10">Top eco-sorters in the community</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {refreshLabel}
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-600 dark:text-gray-300">No entries yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Be the first to scan waste and earn points!</p>
          </div>
        </div>
      ) : (
        <>
          {/* Podium top 3 */}
          {top3.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {top3.map((entry, i) => (
                <div
                  key={entry.user_id}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-shadow ${
                    i === 0
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 shadow-md'
                      : i === 1
                      ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                  }`}
                >
                  <span className="text-3xl">{PODIUM_MEDALS[i]}</span>
                  <div className="w-10 h-10 rounded-full bg-eco-green-600 text-white font-bold flex items-center justify-center text-sm">
                    {entry.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate w-full">{entry.username}</p>
                  <p className="text-sm font-bold text-eco-green-600 dark:text-eco-green-400">{entry.total_points.toLocaleString()} pts</p>
                </div>
              ))}
            </div>
          )}

          {/* Ranked list (4+) */}
          {rest.length > 0 && (
            <div className="space-y-2">
              {rest.map(entry => (
                <LeaderboardRow
                  key={entry.user_id}
                  entry={entry}
                  isCurrentUser={user?.id === entry.user_id}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
