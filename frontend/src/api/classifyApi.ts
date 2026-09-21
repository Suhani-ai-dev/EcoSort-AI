import apiClient from '../lib/apiClient';

export interface ClassifyResult {
  category: string;
  sub_category: string;
  confidence: number;
  carbon_kg: number;
  carbon_source_citation: string;
}

export async function classifyWaste(file: File): Promise<ClassifyResult> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post<ClassifyResult>('/classify', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
