import { Lock, Star } from 'lucide-react';

interface BadgeCardProps {
  name: string;
  description: string;
  threshold_points: number;
  earned: boolean;
  awarded_at?: string;
}

const BADGE_ICONS: Record<string, string> = {
  'Eco Starter':    '🌱',
  'Green Guardian': '🛡️',
  'Waste Warrior':  '⚔️',
  'Planet Hero':    '🌍',
};

export function BadgeCard({ name, description, threshold_points, earned, awarded_at }: BadgeCardProps) {
  const emoji = BADGE_ICONS[name] ?? '🏅';
  const awardedDate = awarded_at
    ? new Date(awarded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div
      className={`relative flex flex-col items-center text-center p-4 rounded-2xl border transition-all ${
        earned
          ? 'bg-white dark:bg-gray-800 border-eco-green-200 dark:border-eco-green-700 shadow-sm'
          : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-60'
      }`}
    >
      {/* Lock overlay for locked badges */}
      {!earned && (
        <div className="absolute top-3 right-3">
          <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" aria-label="Locked" />
        </div>
      )}
      {/* Badge icon */}
      <span className="text-4xl mb-3">{emoji}</span>
      {/* Name */}
      <h3 className={`font-semibold text-sm ${earned ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
        {name}
      </h3>
      {/* Description */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug">{description}</p>
      {/* Threshold */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{threshold_points.toLocaleString()} pts</p>
      {/* Earned date */}
      {earned && awardedDate && (
        <p className="flex items-center gap-1 text-xs text-eco-green-600 dark:text-eco-green-400 mt-2 font-medium">
          <Star className="w-3 h-3" /> Earned {awardedDate}
        </p>
      )}
    </div>
  );
}
