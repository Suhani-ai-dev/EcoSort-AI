import apiClient from '../lib/apiClient';
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
  const { data } = await apiClient.post<SaveScanResponse>('/scans', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export interface ScanRecord {
  id: string;
  user_id: string;
  category: string;
  sub_category: string;
  confidence: number;
  carbon_kg: number;
  carbon_source_citation: string;
  disposal_guidance: {
    disposal_steps: string[];
    sustainability_tips: string[];
    facility_type: string;
    recyclable: boolean;
    hazardous: boolean;
    explanation: string;
  };
  image_signed_url: string;
  created_at: string;
}

export async function getScanHistory(page = 1, pageSize = 20): Promise<ScanRecord[]> {
  const { data } = await apiClient.get<ScanRecord[]>('/scans', {
    params: { page, page_size: pageSize },
  });
  return data;
}
