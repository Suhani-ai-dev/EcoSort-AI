import apiClient, { getPersistentUserId } from '../lib/apiClient';
import type { GuidanceResult } from './guidanceApi';
import type { ClassifyResult } from './classifyApi';

export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  threshold_points: number;
}

export interface SaveScanResponse {
  scan: {
    id: string;
    category: string;
    sub_category: string;
    confidence: number;
    carbon_kg: number;
    carbon_source_citation: string;
    disposal_guidance: GuidanceResult;
    image_signed_url: string;
    created_at: string;
  };
  points_total: number;
  points_earned: number;
  new_badges: BadgeInfo[];
}

export interface ScanRecord {
  id: string;
  user_id: string;
  category: string;
  sub_category: string;
  confidence: number;
  carbon_kg: number;
  carbon_source_citation: string;
  disposal_guidance: GuidanceResult;
  image_signed_url: string;
  created_at: string;
}

const LOCAL_SCANS_KEY = 'ecosort_local_scans';
const LOCAL_POINTS_KEY = 'ecosort_local_points';

export function getLocalScans(): ScanRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_SCANS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalScan(record: ScanRecord, pointsEarned: number): number {
  try {
    const existing = getLocalScans();
    existing.unshift(record);
    localStorage.setItem(LOCAL_SCANS_KEY, JSON.stringify(existing.slice(0, 100)));

    const currentPoints = parseInt(localStorage.getItem(LOCAL_POINTS_KEY) || '0', 10);
    const newPoints = currentPoints + pointsEarned;
    localStorage.setItem(LOCAL_POINTS_KEY, String(newPoints));
    return newPoints;
  } catch {
    return 0;
  }
}

export async function saveScan(
  file: File,
  classify: ClassifyResult,
  guidance: GuidanceResult,
): Promise<SaveScanResponse> {
  const form = new FormData();
  form.append('file', file);
  form.append('category', classify.category);
  form.append('sub_category', classify.sub_category);
  form.append('confidence', String(classify.confidence));
  form.append('carbon_kg', String(classify.carbon_kg));
  form.append('carbon_source_citation', classify.carbon_source_citation);
  form.append('disposal_guidance', JSON.stringify(guidance));

  const userId = getPersistentUserId();
  const scanId = 'scan_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  // Create local preview image URL
  const previewUrl = URL.createObjectURL(file);

  const localRecord: ScanRecord = {
    id: scanId,
    user_id: userId,
    category: classify.category,
    sub_category: classify.sub_category,
    confidence: classify.confidence,
    carbon_kg: classify.carbon_kg,
    carbon_source_citation: classify.carbon_source_citation,
    disposal_guidance: guidance,
    image_signed_url: previewUrl,
    created_at: now,
  };

  try {
    const { data } = await apiClient.post<SaveScanResponse>('/scans', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Also sync to local storage for instant offline access
    if (data && data.scan) {
      saveLocalScan({
        ...localRecord,
        id: data.scan.id,
        image_signed_url: data.scan.image_signed_url || previewUrl,
      }, data.points_earned);
    }
    return data;
  } catch (err) {
    console.warn('[saveScan] API sync failed, persisting locally:', err);
    // Offline / direct local fallback
    const pointsEarned = 10 + (classify.category === 'E-Waste' ? 15 : classify.category === 'Hazardous' ? 20 : 0);
    const totalPoints = saveLocalScan(localRecord, pointsEarned);

    return {
      scan: localRecord,
      points_total: totalPoints,
      points_earned: pointsEarned,
      new_badges: totalPoints >= 50 ? [{
        id: 'badge-1',
        name: 'Eco Starter',
        description: 'Scanned your first waste items',
        threshold_points: 50
      }] : [],
    };
  }
}

export async function getScanHistory(page = 1, pageSize = 20): Promise<ScanRecord[]> {
  try {
    const { data } = await apiClient.get<ScanRecord[]>('/scans', {
      params: { page, page_size: pageSize },
    });
    if (data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('[getScanHistory] Backend fetch failed, falling back to local history:', err);
  }

  // Fallback to local storage records
  const localList = getLocalScans();
  const offset = (page - 1) * pageSize;
  return localList.slice(offset, offset + pageSize);
}
