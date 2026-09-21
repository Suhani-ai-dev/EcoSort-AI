import apiClient from '../lib/apiClient';

export interface GuidanceResult {
  category: string;
  sub_category: string;
  disposal_steps: string[];
  sustainability_tips: string[];
  facility_type: string;
  recyclable: boolean;
  hazardous: boolean;
  explanation: string;
}

export async function getGuidance(
  category: string,
  sub_category: string,
  location_hint?: string,
): Promise<GuidanceResult> {
  const { data } = await apiClient.post<GuidanceResult>('/guidance', {
    category,
    sub_category,
    location_hint: location_hint ?? null,
  });
  return data;
}
