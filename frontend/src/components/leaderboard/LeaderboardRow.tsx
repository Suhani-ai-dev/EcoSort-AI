import { Trophy } from 'lucide-react';
import type { LeaderboardEntry } from '../../api/leaderboardApi';

interface Props {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}

const RANK_COLORS: Record<number, string> = {
  1: 'text-yellow-500',
  2: 'text-gray-400',
  3: 'text-amber-600',
};

export function LeaderboardRow({ entry, isCurrentUser }: Props) {
  const initials = entry.username.slice(0, 2).toUpperCase();
  const rankColor = RANK_COLORS[entry.rank] ?? 'text-gray-400 dark:text-gray-500';

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
        isCurrentUser
          ? 'bg-eco-green-50 dark:bg-eco-green-900/20 border border-eco-green-200 dark:border-eco-green-800'
          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
      }`}
    >
      {/* Rank */}
      <div className={`w-8 text-center font-bold text-lg flex-shrink-0 ${rankColor}`}>
        {entry.rank <= 3 ? (
          <Trophy className="w-5 h-5 mx-auto" aria-label={`Rank ${entry.rank}`} />
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400">#{entry.rank}</span>
        )}
      </div>

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-eco-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
        {entry.avatar_url ? (
          <img src={entry.avatar_url} alt={entry.username} className="w-9 h-9 rounded-full object-cover" />
        ) : initials}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold truncate ${isCurrentUser ? 'text-eco-green-800 dark:text-eco-green-300' : 'text-gray-800 dark:text-gray-100'}`}>
          {entry.username}
          {isCurrentUser && <span className="ml-2 text-xs font-normal text-eco-green-600 dark:text-eco-green-400">(you)</span>}
        </p>
      </div>

      {/* Points */}
      <div className="flex-shrink-0 text-right">
        <span className={`font-bold ${isCurrentUser ? 'text-eco-green-700 dark:text-eco-green-400' : 'text-gray-700 dark:text-gray-200'}`}>
          {entry.total_points.toLocaleString()}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">pts</span>
      </div>
    </div>
  );
}
