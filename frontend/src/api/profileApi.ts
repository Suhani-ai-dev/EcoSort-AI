import { supabase } from '../lib/supabaseClient';

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface UserPoints {
  total_points: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  threshold_points: number;
}

export interface UserBadge {
  badge_id: string;
  awarded_at: string;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, created_at')
    .eq('id', userId)
    .single();
  return data;
}

export async function getUserPoints(userId: string): Promise<number> {
  const { data } = await supabase
    .from('points')
    .select('total_points')
    .eq('user_id', userId)
    .single();
  return data?.total_points ?? 0;
}

export async function getAllBadges(): Promise<Badge[]> {
  const { data } = await supabase
    .from('badges')
    .select('id, name, description, threshold_points')
    .order('threshold_points', { ascending: true });
  return data ?? [];
}

export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const { data } = await supabase
    .from('user_badges')
    .select('badge_id, awarded_at')
    .eq('user_id', userId);
  return data ?? [];
}

export async function getUserCarbonTotal(userId: string): Promise<number> {
  const { data } = await supabase
    .from('scans')
    .select('carbon_kg')
    .eq('user_id', userId);
  if (!data) return 0;
  return data.reduce((sum, row) => sum + (row.carbon_kg ?? 0), 0);
}
