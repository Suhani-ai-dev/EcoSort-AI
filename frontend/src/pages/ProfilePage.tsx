import { useState, useEffect } from 'react';
import { Leaf, Star, User, Calendar, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getProfile, getUserPoints, getAllBadges, getUserBadges, getUserCarbonTotal,
  type UserProfile, type Badge, type UserBadge,
} from '../api/profileApi';
import { BadgeCard } from '../components/profile/BadgeCard';

function StatCard({
  label, value, icon: Icon, colorBg, colorText,
}: {
  label: string; value: string;
  icon: React.ElementType; colorBg: string; colorText: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorBg}`}>
        <Icon className={`w-5 h-5 ${colorText}`} />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}

const RANK_CONFIG: Array<{ min: number; label: string; color: string }> = [
  { min: 1000, label: '🌍 Planet Hero', color: 'text-purple-600 dark:text-purple-400' },
  { min: 500,  label: '⚔️ Waste Warrior', color: 'text-red-600 dark:text-red-400' },
  { min: 200,  label: '🛡️ Green Guardian', color: 'text-eco-teal-600 dark:text-eco-teal-400' },
  { min: 50,   label: '🌱 Eco Starter', color: 'text-eco-green-600 dark:text-eco-green-400' },
  { min: 0,    label: 'Newcomer', color: 'text-gray-500 dark:text-gray-400' },
];

function getRank(pts: number) {
  return RANK_CONFIG.find(r => pts >= r.min) ?? RANK_CONFIG[RANK_CONFIG.length - 1];
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [points, setPoints] = useState(0);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [carbonTotal, setCarbonTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getProfile(user.id),
      getUserPoints(user.id),
      getAllBadges(),
      getUserBadges(user.id),
      getUserCarbonTotal(user.id),
    ]).then(([prof, pts, badges, ubadges, carbon]) => {
      setProfile(prof);
      setPoints(pts);
      setAllBadges(badges);
      setUserBadges(ubadges);
      setCarbonTotal(carbon);
    }).finally(() => setLoading(false));
  }, [user]);

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
  const earnedCount = earnedBadgeIds.size;
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : '—';
  const rank = getRank(points);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-5 animate-pulse">
        <div className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl" />)}
        </div>
        <div className="h-52 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      </div>
    );
  }

  const initials = (profile?.username?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile banner */}
      <div className="relative bg-eco-green-600 dark:bg-eco-green-700 rounded-2xl overflow-hidden p-6">
        {/* Decorative blob */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-eco-green-500/40 pointer-events-none" />
        <div className="relative flex items-center gap-5">
          <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-white/20 text-white flex items-center justify-center text-3xl font-extrabold flex-shrink-0 border-2 border-white/30">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{profile?.username ?? 'Unknown'}</h2>
            <p className="text-eco-green-100 text-sm truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-sm font-semibold ${rank.color} bg-white/10 px-2.5 py-0.5 rounded-full`}>
                {rank.label}
              </span>
              <span className="flex items-center gap-1 text-xs text-eco-green-200">
                <Calendar className="w-3.5 h-3.5" />
                Member since {joinDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Total Points"
          value={points.toLocaleString()}
          icon={Star}
          colorBg="bg-yellow-100 dark:bg-yellow-900/20"
          colorText="text-yellow-600 dark:text-yellow-400"
        />
        <StatCard
          label="CO₂e Saved"
          value={`${carbonTotal.toFixed(1)} kg`}
          icon={Leaf}
          colorBg="bg-eco-green-100 dark:bg-eco-green-900/20"
          colorText="text-eco-green-600 dark:text-eco-green-400"
        />
        <StatCard
          label="Badges"
          value={`${earnedCount} / ${allBadges.length}`}
          icon={Award}
          colorBg="bg-purple-100 dark:bg-purple-900/20"
          colorText="text-purple-600 dark:text-purple-400"
        />
        <StatCard
          label="Rank"
          value={rank.label}
          icon={User}
          colorBg="bg-eco-teal-100 dark:bg-eco-teal-900/20"
          colorText="text-eco-teal-600 dark:text-eco-teal-400"
        />
      </div>

      {/* Badge showcase */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Badges</h3>
          <span className="ml-auto text-xs font-medium text-gray-400 dark:text-gray-500">
            {earnedCount} of {allBadges.length} earned
          </span>
        </div>
        {allBadges.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No badges available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {allBadges.map(badge => {
              const ub = userBadges.find(u => u.badge_id === badge.id);
              return (
                <BadgeCard
                  key={badge.id}
                  name={badge.name}
                  description={badge.description}
                  threshold_points={badge.threshold_points}
                  earned={!!ub}
                  awarded_at={ub?.awarded_at}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
