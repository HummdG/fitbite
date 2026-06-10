import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type { ScanRequest, ScanResponse } from '@/types/api';

export function useScan() {
  return useMutation<ScanResponse, Error, ScanRequest>({
    mutationFn: (req) => api.scan(req),
  });
}
