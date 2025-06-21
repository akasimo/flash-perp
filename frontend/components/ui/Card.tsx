// Card component for consistent container styling

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function Card({ children, className, noPadding = false }: CardProps) {
  return (
    <div
      className={cn(
        'bg-gray-900 border border-gray-800 rounded-md',
        !noPadding && 'p-4',
        className
      )}
    >
      {children}
    </div>
  );
}