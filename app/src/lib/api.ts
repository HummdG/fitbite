import { supabase } from './supabase';
import type { ScanRequest, ScanResponse, TargetRequest, Targets } from '@/types/api';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

async function authedFetch<T>(path: string, body: unknown): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${detail || res.statusText}`);
  }
  return (await res.json()) as T;
}

export const api = {
  computeTargets: (req: TargetRequest) => authedFetch<Targets>('/targets', req),
  scan: (req: ScanRequest) => authedFetch<ScanResponse>('/scan', req),
};
