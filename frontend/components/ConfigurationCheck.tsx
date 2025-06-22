'use client';

import { useEffect, useState } from 'react';
import { validateConfiguration } from '@/lib/constants/contracts';

export default function ConfigurationCheck({ children }: { children: React.ReactNode }) {
  const [isValid, setIsValid] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const { isValid, errors } = validateConfiguration();
    setIsValid(isValid);
    setErrors(errors);
    
    if (!isValid) {
      console.error('Configuration errors:', errors);
    }
  }, []);

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-red-900/20 border border-red-500/30 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Configuration Error</h1>
          <p className="text-gray-300 mb-6">
            The application is not properly configured. Please check your environment variables.
          </p>
          <div className="space-y-2 mb-6">
            {errors.map((error, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-red-400">•</span>
                <span className="text-gray-300">{error}</span>
              </div>
            ))}
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">To fix this:</p>
            <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
              <li>Run <code className="bg-gray-700 px-1 rounded">scripts/deploy_all.sh</code> to deploy contracts</li>
              <li>Or manually update <code className="bg-gray-700 px-1 rounded">frontend/.env.local</code> with valid contract addresses</li>
              <li>Restart the development server after making changes</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}