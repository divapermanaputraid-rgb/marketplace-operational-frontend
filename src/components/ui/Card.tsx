import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("px-6 py-4 border-b border-gray-200", className)}>
      {children}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
}
