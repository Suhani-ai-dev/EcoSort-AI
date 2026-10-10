import { useState, useEffect } from 'react';
import { Leaf, Star, Calendar, Award, Edit3, Check, Smartphone, Car, Trees, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getProfile, getUserPoints, getAllBadges, getUserBadges, getUserCarbonTotal,
  updateProfileUsername,
  type UserProfile, type Badge, type UserBadge,
} from '../api/profileApi';
import { getLocalScans } from '../api/scansApi';
import { BadgeCard } from '../components/profile/BadgeCard';

function StatCard({
  label, value, icon: Icon, colorBg, colorText, subtitle,
}: {
  label: string; value: string;
  icon: React.ElementType; colorBg: string; colorText: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorBg}`}>
        <Icon className={`w-5 h-5 ${colorText}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5 truncate">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

const RANK_CONFIG: Array<{ min: number; label: string; next: number | null }> = [
  { min: 1000, label: '🌍 Planet Hero', next: null },
  { min: 500,  label: '⚔️ Waste Warrior', next: 1000 },
  { min: 200,  label: '🛡️ Green Guardian', next: 500 },
  { min: 50,   label: '🌱 Eco Starter', next: 200 },
  { min: 0,    label: '🌿 New Recycler', next: 50 },
];

function getRank(pts: number) {
  return RANK_CONFIG.find(r => pts >= r.min) ?? RANK_CONFIG[RANK_CONFIG.length - 1];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [points, setPoints] = useState(0);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [carbonTotal, setCarbonTotal] = useState(0);
  const [scanCount, setScanCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Username editing
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  const loadData = async () => {
    try {
      const [prof, pts, badges, ubadges, carbon] = await Promise.all([
        getProfile(),
        getUserPoints(),
        getAllBadges(),
        getUserBadges(),
        getUserCarbonTotal(),
      ]);
      setProfile(prof);
      setEditName(prof.username);
      setPoints(pts);
      setAllBadges(badges);
      setUserBadges(ubadges);
      setCarbonTotal(carbon);
      setScanCount(getLocalScans().length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveName = () => {
    if (!editName.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    updateProfileUsername(editName);
    if (profile) {
      setProfile({ ...profile, username: editName.trim() });
    }
    setIsEditing(false);
    toast.success('Profile username updated!');
  };

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
  const earnedCount = earnedBadgeIds.size;
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : 'Recently';
  const rank = getRank(points);

  // Progress to next tier
  const nextTarget = rank.next ?? 1000;
  const prevTarget = rank.min;
  const progressPercent = rank.next
    ? Math.min(100, Math.max(0, ((points - prevTarget) / (nextTarget - prevTarget)) * 100))
    : 100;

  // Real world equivalents
  const treesEquiv = (carbonTotal / 21).toFixed(1); // 1 tree absorbs ~21kg CO2/year
  const carKmEquiv = (carbonTotal / 0.12).toFixed(1); // avg car ~0.12kg CO2/km
  const phoneCharges = Math.round(carbonTotal / 0.008); // avg phone charge ~0.008kg CO2

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-5 animate-pulse">
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl" />)}
        </div>
        <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      </div>
    );
  }

  const initials = (profile?.username?.[0] ?? 'E').toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile banner */}
      <div className="relative bg-gradient-to-br from-eco-green-600 via-eco-green-700 to-teal-800 rounded-3xl overflow-hidden p-6 sm:p-8 text-white shadow-lg">
        {/* Decorative blur circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-teal-400/20 blur-xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-3xl font-extrabold flex-shrink-0 border-2 border-white/40 shadow-inner">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    maxLength={25}
                    className="px-3 py-1 bg-white/20 text-white placeholder-white/60 border border-white/40 rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 bg-white text-eco-green-800 rounded-lg hover:bg-white/90 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-extrabold text-white truncate">{profile?.username}</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-white/70 hover:text-white transition-colors"
                    title="Edit username"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-eco-green-100 text-sm mt-0.5">Active Sustainability Champion</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-3">
              <span className="text-xs font-bold text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                {rank.label}
              </span>
              <span className="flex items-center gap-1 text-xs text-eco-green-100 bg-white/10 px-3 py-1 rounded-full">
                <Calendar className="w-3.5 h-3.5" />
                Joined {joinDate}
              </span>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mt-6 pt-5 border-t border-white/15">
          <div className="flex justify-between items-center text-xs font-semibold text-eco-green-100 mb-1.5">
            <span>Rank Progress ({points} pts)</span>
            <span>{rank.next ? `${rank.next} pts needed for next tier` : 'Top Rank Achieved!'}</span>
          </div>
          <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-yellow-300 to-eco-green-200 rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Points"
          value={points.toLocaleString()}
          icon={Star}
          colorBg="bg-yellow-100 dark:bg-yellow-900/30"
          colorText="text-yellow-600 dark:text-yellow-400"
          subtitle="Earned from scans"
        />
        <StatCard
          label="CO₂e Saved"
          value={`${carbonTotal.toFixed(1)} kg`}
          icon={Leaf}
          colorBg="bg-eco-green-100 dark:bg-eco-green-900/30"
          colorText="text-eco-green-600 dark:text-eco-green-400"
          subtitle="Landfill avoided"
        />
        <StatCard
          label="Items Scanned"
          value={scanCount.toString()}
          icon={Sparkles}
          colorBg="bg-blue-100 dark:bg-blue-900/30"
          colorText="text-blue-600 dark:text-blue-400"
          subtitle="Waste items sorted"
        />
        <StatCard
          label="Badges"
          value={`${earnedCount} / ${allBadges.length}`}
          icon={Award}
          colorBg="bg-purple-100 dark:bg-purple-900/30"
          colorText="text-purple-600 dark:text-purple-400"
          subtitle="Milestones unlocked"
        />
      </div>

      {/* Environmental Equivalents Showcase */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-3 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Trees className="w-5 h-5 text-eco-green-600 dark:text-eco-green-400" />
          Real-World Environmental Impact
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Your waste diversion translates directly into verifiable carbon offset equivalents:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-4 rounded-xl bg-eco-green-50/70 dark:bg-eco-green-950/30 border border-eco-green-100 dark:border-eco-green-900/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-eco-green-600 text-white flex items-center justify-center flex-shrink-0">
              <Trees className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-eco-green-900 dark:text-eco-green-200">{treesEquiv}</p>
              <p className="text-xs text-eco-green-700 dark:text-eco-green-400">Trees absorption / year</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-200">{carKmEquiv} km</p>
              <p className="text-xs text-blue-700 dark:text-blue-400">Driving emissions offset</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-amber-900 dark:text-amber-200">{phoneCharges.toLocaleString()}</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">Smartphones charged</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badge showcase */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Milestone Badges</h3>
          <span className="ml-auto text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2.5 py-1 rounded-full">
            {earnedCount} of {allBadges.length} earned
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
      </div>
    </div>
  );
}
