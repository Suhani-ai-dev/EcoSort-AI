import apiClient from '../lib/apiClient';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  total_points: number;
  avatar_url: string | null;
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const { data } = await apiClient.get<LeaderboardEntry[]>('/leaderboard', {
    params: { limit },
  });
  return data;
}
