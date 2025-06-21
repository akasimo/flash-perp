// Hook to check if component is mounted (prevents hydration issues)

'use client';

import { useEffect, useState } from 'react';

export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}