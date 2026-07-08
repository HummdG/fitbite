import { supabase } from './supabase';
import type { ScanRequest, ScanResponse, TargetRequest, Targets } from '@/types/api';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

async function authedFetch<T>(path: string, body: unknown, timeoutMs: number): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  // Without an abort, an unreachable host makes `fetch` hang forever — the UI just
  // spins. Bail after `timeoutMs` so the user gets a clear error instead of a stuck
  // button. (The Metro `--tunnel` does NOT proxy this call; the phone must reach
  // EXPO_PUBLIC_API_URL directly over the network.)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    // Timed out (host unreachable / service asleep) vs. an immediate network error.
    // The abort rejection isn't always an Error instance in RN, so match on name.
    const name = e instanceof Error ? e.name : (e as { name?: string } | null)?.name;
    const timedOut = name === 'AbortError';
    throw new Error(
      timedOut
        ? `The FitBite service at ${API_URL} didn't respond in time. Check that it's running ` +
          `and reachable from your phone — on a real device "localhost"/LAN often won't work, so ` +
          `use your machine's network IP or expose the service with a tunnel, then restart Expo.`
        : `Couldn't reach the FitBite service at ${API_URL}. On a phone, "localhost" won't work — ` +
          `set EXPO_PUBLIC_API_URL to your computer's network address (e.g. http://192.168.x.x:8000) ` +
          `or a tunnel URL, and restart Expo.`,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${detail || res.statusText}`);
  }
  return (await res.json()) as T;
}

export const api = {
  // Targets is a fast calc — a slow response means it's unreachable, so fail quickly.
  computeTargets: (req: TargetRequest) => authedFetch<Targets>('/targets', req, 20000),
  // Scan runs vision over a menu image; give it a generous budget before timing out.
  scan: (req: ScanRequest) => authedFetch<ScanResponse>('/scan', req, 90000),
};
