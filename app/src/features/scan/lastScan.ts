import type { ScanResponse } from '@/types/api';

// Lightweight handoff of the latest scan result from the Scanner screen to the
// Result screen (avoids serializing a large object through navigation params).
let _last: ScanResponse | null = null;

export const lastScan = {
  get: () => _last,
  set: (r: ScanResponse | null) => {
    _last = r;
  },
};
