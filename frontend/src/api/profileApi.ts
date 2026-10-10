import { getLocalScans } from './scansApi';
import { getPersistentUserId } from '../lib/apiClient';

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  threshold_points: number;
  icon?: string;
}

export interface UserBadge {
  badge_id: string;
  awarded_at: string;
}

export const ALL_BADGES: Badge[] = [
  { id: 'badge-1', name: 'First Scan', description: 'Scanned your first waste item', threshold_points: 10, icon: '🌱' },
  { id: 'badge-2', name: 'Eco Starter', description: 'Crossed 50 points of sorted waste', threshold_points: 50, icon: '🌿' },
  { id: 'badge-3', name: 'Green Guardian', description: 'Consistently sorting recyclable materials', threshold_points: 200, icon: '🛡️' },
  { id: 'badge-4', name: 'Waste Warrior', description: 'Diverted major carbon from municipal landfills', threshold_points: 500, icon: '⚔️' },
  { id: 'badge-5', name: 'Planet Hero', description: 'Top-tier recycling champion for the Earth', threshold_points: 1000, icon: '🌍' },
  { id: 'badge-6', name: 'Zero Waste Legend', description: 'Exemplary environmental stewardship', threshold_points: 2500, icon: '👑' },
];

const LOCAL_USERNAME_KEY = 'ecosort_username';
const LOCAL_POINTS_KEY = 'ecosort_local_points';
const LOCAL_JOIN_KEY = 'ecosort_joined_at';

export async function getProfile(userId?: string): Promise<UserProfile> {
  const uid = userId || getPersistentUserId();
  const username = localStorage.getItem(LOCAL_USERNAME_KEY) || 'Eco Explorer';
  let createdAt = localStorage.getItem(LOCAL_JOIN_KEY);
  if (!createdAt) {
    createdAt = new Date().toISOString();
    localStorage.setItem(LOCAL_JOIN_KEY, createdAt);
  }

  return {
    id: uid,
    username,
    avatar_url: null,
    created_at: createdAt,
  };
}

export function updateProfileUsername(newName: string): void {
  localStorage.setItem(LOCAL_USERNAME_KEY, newName.trim());
}

export async function getUserPoints(_userId?: string): Promise<number> {
  try {
    const raw = localStorage.getItem(LOCAL_POINTS_KEY);
    if (raw) return parseInt(raw, 10);
  } catch {}
  return 0;
}

export async function getAllBadges(): Promise<Badge[]> {
  return ALL_BADGES;
}

export async function getUserBadges(_userId?: string): Promise<UserBadge[]> {
  const points = await getUserPoints();
  const localScans = getLocalScans();
  const badges: UserBadge[] = [];

  if (localScans.length > 0 || points >= 10) {
    badges.push({ badge_id: 'badge-1', awarded_at: new Date().toISOString() });
  }

  ALL_BADGES.slice(1).forEach((b) => {
    if (points >= b.threshold_points) {
      badges.push({ badge_id: b.id, awarded_at: new Date().toISOString() });
    }
  });

  return badges;
}

export async function getUserCarbonTotal(_userId?: string): Promise<number> {
  const scans = getLocalScans();
  return scans.reduce((sum, s) => sum + (s.carbon_kg || 0), 0);
}
