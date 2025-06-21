// Debug component to check Freighter availability

'use client';

import React, { useEffect, useState } from 'react';
import { useIsMounted } from '@/lib/hooks/useIsMounted';

export default function FreighterDebug() {
  const mounted = useIsMounted();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    if (!mounted) return;

    const checkFreighter = () => {
      const info = {
        windowExists: typeof window !== 'undefined',
        freighterExists: typeof window !== 'undefined' && !!(window as any).freighter,
        freighterKeys: typeof window !== 'undefined' && (window as any).freighter ? Object.keys((window as any).freighter) : [],
        stellarExists: typeof window !== 'undefined' && !!(window as any).stellar,
        stellarFreighter: typeof window !== 'undefined' && !!(window as any).stellar?.freighter,
        freighterApiExists: typeof window !== 'undefined' && !!(window as any).freighterApi,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        timestamp: new Date().toISOString(),
      };
      
      setDebugInfo(info);
      console.log('Freighter Debug Info:', info);
    };

    checkFreighter();
    
    // Check every 2 seconds for changes
    const interval = setInterval(checkFreighter, 2000);
    
    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) {
    return <div>Loading debug info...</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs font-mono max-w-md overflow-auto max-h-96 z-50">
      <h3 className="font-bold mb-2">Freighter Debug</h3>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
}